import { Router } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js"; // Assuming you have a User model in models/User.js
dotenv.config();

const router = Router();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and Password are required");
    }
    User.findOne({ email }).then(async (user) => {
        if (!user) {
            return res.status(404).send("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send("Invalid Password");
        }
        req.session.username = user.username;
        res.status(200).send("Logged in successfully");
    }).catch((error) => {   
        console.error("Error logging in:", error);
})})

router.post("/register", async (req, res) => {
    // console.log(req.body)
    const { username, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and Password are required");
    }
    try {
        const hashedPassword = await hashPassword(password);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;