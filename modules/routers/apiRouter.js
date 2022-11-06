const express = require("express");
const router = express.Router();
const db = require("../db")
const parentDir = require("../parentUrl");
const api = require("../api");
const responses = require("../responses");
const auth = require("../auth");
const { is_authenticated, jwt_middleware } = require("../auth");

router.get("/bots/:id", (req, res) => {
    const id = req.params.id;
    api.getBot(id, (response) => {
        if(!response) {
            responses.not_found(res);
            return;
        }
        if(response["public"]) {
            responses.ok(res, response)
            return;
        } else {
            auth.is_authenticated(req, (bool, data) => {
                if(bool && response["creator"] == data["id"]) {
                    responses.ok(res, response)
                } else {
                    responses.unauthorized(res, "You are not authorized to this bot");
                }
            })
        }
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
                if(bool && req.payload["id"] == bot["creator"]) {
                    send(bot);
                } else {
                    responses.unauthorized(res, "", null);
                }
            }, true)
        }
    })
})

router.use(jwt_middleware);
router.post("/bot", function(req, res) {
    if(!("name" in req.body)) {
        responses.bad_request(res, "Name field is missing");
        return;
    }
    if(!("data" in req.body)) {
        responses.bad_request(res, "Data field is missing");
        return;
    }
    api.saveBot(req.payload["id"], req.body.name, req.body.data, (response) => {
        if("insertId" in response) {
            responses.ok(res, response["insertId"]);
        } else {
            responses.internal_server_error(res);
        }
    })
})

exports.router = router