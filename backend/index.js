import express from "express";
import imapRoutes from './routes/imapRoutes.js';
import authRoutes from './routes/authRoutes.js';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 5000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send('Hello');
});

app.use('/api/imap', imapRoutes)
app.use('/api/auth', authRoutes)

app.listen(PORT, () => console.log("Server running on port " + PORT));
