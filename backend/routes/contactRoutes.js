const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.post("/contact", async (req, res) => {
    try {
        const contact = new Contact(req.body);
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
