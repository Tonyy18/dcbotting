const express = require("express");
const router = express.Router();
const parentUrl = require("../parentUrl");

router.get("/", function(req, res) {
    res.sendFile(parentUrl + "/src/account.html");
})

module.exports = router;