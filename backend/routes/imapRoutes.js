import { Router } from "express";
import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Imap from "../models/Imap.js";
dotenv.config();

const { MONGO_URI, IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS } = process.env;

if (!MONGO_URI || !IMAP_HOST || !IMAP_PORT || !IMAP_USER || !IMAP_PASS) {
  throw new Error("Missing required environment variables");
}

const router = Router();

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const client = new ImapFlow({
  host: IMAP_HOST,
  port: IMAP_PORT,
  secure: true,
  auth: {
    user: IMAP_USER,
    pass: IMAP_PASS,
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
  try {
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
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

async function fetchEmailBody(id) {
  try {
    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    let emailBody = "";
    try {
      for await (let message of client.fetch(id, { envelope: true, source: true })) {
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
    return emailBody;
  } catch (error) {
    console.error("Error fetching email body:", error);
    throw error;
  }
}

router.get("/", (req, res) => {
  res.send("Hello");
});

router.get("/mail", async (req, res) => {
  try {
    await startIMAP();
    res.send("IMAP is running, check the console for new emails.");
  } catch (error) {
    res.status(500).send("Error starting IMAP");
  }
});

router.get("/listmails", async (req, res) => {
  try {
    const mailboxes = await fetchInboxEmails();
    res.send(mailboxes);
  } catch (error) {
    res.status(500).send("Error fetching emails");
  }
});

router.get("/fetchmailbody/:id", async (req, res) => {
  try {
    const emailBody = await fetchEmailBody(req.params.id);
    res.send(emailBody);
  } catch (error) {
    res.status(500).send("Error fetching email body");
  }
});

router.post("/saveDetails", async (req, res) => {
  const { host, port, secure, user, pass } = req.body;
  const username = req.session.username;
  if (!host || !port || !secure || !user || !pass) {
    return res.status(400).send("All fields are required");
  }
  try {
    const imap = new Imap({ username, host, port, secure, auth: { user, pass } });
    await imap.save();
    res.status(201).send("IMAP details saved successfully");
  } catch (error) {
    console.error("Error saving IMAP details:", error);
    res.status(500).send("Internal Server Error");
  }
})

export default router;
