const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Strict NoSQL Injection & Type Validation
        if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
            return res.status(400).json({ success: false, error: "Invalid input fields format" });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanMessage = String(message).trim();

        if (!cleanName || !cleanEmail || !cleanMessage) {
            return res.status(400).json({ success: false, error: "All contact fields are required" });
        }

        const contact = new Contact({
            name: cleanName,
            email: cleanEmail,
            message: cleanMessage
        });
        await contact.save();

        res.json({
            success: true,
            message: "Message saved"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
