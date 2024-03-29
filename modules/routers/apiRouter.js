const express = require("express");
const router = express.Router();
const db = require("../db")
const parentDir = require("../parentUrl");
const api = require("../api");
const responses = require("../responses");
const auth = require("../auth");
const common = require("../common");
const fileUpload = require('express-fileupload')
const constants = require("../constants");
router.get("/bot/:id", (req, res) => {
    //Get bot by id
    const id = req.params.id;
    api.getBot(id, (response) => {
        if(!response) {
            responses.not_found(res, "Bot was not found");
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
    }, (err) => {
        responses.internal_server_error(res);
    })
})
router.get("/user/:id/bots", (req, res) => {
    //get users bot
    const id = req.params.id;
    api.getBotsByUserId(id, (response) => {
        responses.ok(res, response)
    }, (err) => {
        responses.internal_server_error(res);
    })
})

router.get("/events", (req, res) => {
    api.getEvents((results) => {
        responses.ok(res, results)
    }, (err) => {
        responses.internal_server_error(res);
    })
})

router.get("/methods", (req, res) => {
    api.getMethods((results) => {
        responses.ok(res, results)
    }, (err) => {
        responses.internal_server_error(res);
    })
})

router.use(auth.jwt_middleware);
//Secured endpoints. Login always secured
//If login is not always required. Define the endpoint above the middleware and use is_authenticated method
//The jwt payload is stored in request.payload property including the users id and email
router.post("/bot", function(req, res) {
    if(!("name" in req.body)) {
        responses.bad_request(res, "Name field is missing");
        return;
    }
    if(!("data" in req.body)) {
        responses.bad_request(res, "Data field is missing");
        return;
    }
    const validName = common.Validator.name(req.body.name);
    if(validName !== true) {
        responses.bad_request(res, validName);
        return;
    }
    api.saveBot(req.payload["id"], req.body.name, req.body.data, (response) => {
        if("insertId" in response) {
            responses.ok(res, response["insertId"]);
        } else {
            responses.internal_server_error(res);
        }
    }, (err) => {
        responses.internal_server_error(res);
    })
})
router.use(fileUpload());
router.put("/bot/:id", function(req, res) {
    for(key in req.files) {
        //Add files to the body for easier processing
        req.body[key] = req.files[key];
    }
    const id = req.params.id;
    db.getCols("bots", (result) => {
        for(key in req.body) {
            if(!result.includes(key)) {
                responses.bad_request(res, "Unknown key: " + key);
                return;
            }
        }
        api.getBot(id, (result) => {
            if(!result) {
                responses.not_found(res);
                return
            }
            if(result["creator"] != req.payload["id"]) {
                //Only the original creator can update/edit the bot
                responses.unauthorized(res);
                return;
            }
            api.updateBot(id, req.body, (re) => {
                responses.ok(res, req.body);
                return;
            }, (err) => {
                responses.internal_server_error(res);
            })
        })
    })
})
router.delete("/bot/:id", function(req, res) {
    api.deleteBot(req.params.id, function(result) {
        responses.ok(res)
    }, (err) => {
        responses.internal_server_error(res);
    })
})

module.exports = router