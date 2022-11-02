const express = require("express");
const router = express.Router();
const db = require("./db")
const parentDir = require("./parentUrl");

router.get("/bots/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM bots WHERE id='" + id + "'", (result) => {
        if(result.length == 0) {
            res.sendStatus(404);
            return;
        }
        res.json(result[0])
    })
})

router.get("/events", (req, res) => {
    res.set("content-type", "application/json")
    res.sendFile(parentDir + "/data/events.json")
})

router.get("/methods", (req, res) => {
    let sp = __dirname.split("/")
    sp.pop()
    const url = sp.join("/");
    res.set("content-type", "application/json")
    res.sendFile(parentDir + "/data/methods.json")
})

exports.router = router