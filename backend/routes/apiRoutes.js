import { Router } from "express";
import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const URI = process.env.MONGO_URI;


const router = Router();

mongoose.connect(URI);

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT,
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
  logger: false
});

async function startIMAP() {
  try {
    await client.connect();
    console.log("IMAP Connected!");

    client.on("exists", (mailbox) => {
      console.log(`New email detected in ${mailbox}`);
    });

    client.idle().catch((err) => console.error("IMAP Idle Error:", err));
  } catch (error) {
    console.error("IMAP Connection Error:", error);
  }
}

async function fetchInboxEmails() {
  await client.connect();
  console.log("IMAP Connected!");
  let lock = await client.getMailboxLock('INBOX');
  let emails = [];
  console.log("Fetching emails...");
  try {
    for await (let message of client.fetch('1:10', { envelope: true, source: true })) {
      const envelope = message.envelope.from[0];
      console.log(`New email from ${envelope.name} <${envelope.address}>`);
      emails.push({
        id: `${message.uid}`,
        from: `${envelope.name} <${envelope.address}>`,
        subject: message.envelope.subject,
      });
    }
  } finally {
    lock.release();
  }
  await client.logout();
  return emails;

};



router.get("/", (req, res) => {
  res.send("Hello");
});

router.get("/mail", async (req, res) => {
  await startIMAP();
  res.send("IMAP is running, check the console for new emails.");
});

router.get("/listmails", async (req, res) => {
  const mailboxes = await fetchInboxEmails();
  res.send(mailboxes);
});

router.get("/fetchmailbody/:id", async (req, res) => {
  await client.connect();
  let lock = await client.getMailboxLock('INBOX');
  let emailBody = "";
  try {
    for await (let message of client.fetch(req.params.id, { envelope: true, source: true })) {
      const envelope = message.envelope.from[0];
      emailBody = {
        from: `${envelope.name} <${envelope.address}>`,
        subject: message.envelope.subject,
        body: message.source.toString()
      };
      console.log(emailBody);
    }
  } finally {
    lock.release();
  }
  await client.logout();
  res.send(emailBody);
});

export default router;
