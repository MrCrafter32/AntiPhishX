import mongoose from "mongoose";

const imapSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    secure: {
        type: Boolean,
        required: true
    },
    auth: {
        user: {
            type: String,
            required: true
        },
        pass: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Imap = mongoose.model("Imap", imapSchema);

export default Imap;