const express = require("express");
const router = express.Router();
const db = require("../db")
const parentDir = require("../parentUrl");
const api = require("../api");
const responses = require("../responses");
const { is_authenticated } = require("../auth");

router.get("/bots/:id", (req, res) => {
    const id = req.params.id;
    api.getBot(id, (res) => {
        if(!res) {
            res.sendStatus(404);
            return;
        }
        res.json(res);
    })
})

router.get("/events", (req, res) => {
    res.set("content-type", "application/json")
    res.sendFile(parentDir + "/data/events.json")
})

router.get("/methods", (req, res) => {
    res.set("content-type", "application/json")
    res.sendFile(parentDir + "/data/methods.json")
})


router.get("/files/bot/:id", (req, res) => {
    const id = req.params.id;
    const send = (bot) => {
        res.status(200).attachment(bot["name"] + ".dcbotting").send(JSON.stringify(bot["data"]));
    }
    api.getBot(id, function(bot) {
        if(!bot) {
            responses.not_found(res);
            return
        }
        if(bot["public"]) {
            send(bot);
        } else {
            is_authenticated(req, (bool) => {
                console.log("Authenticated: " + bool)
            }, true)
        }
    })
})

exports.router = router