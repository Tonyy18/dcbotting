const express = require("express")
const Router = express.Router();
const db = require("../db");
const auth = require("../auth")
const responses = require("../responses")
const { Validator, keysToValidators } = require("../common");

Router.post("/register", function(req, res) {
    const required = ["username", "email", "password"]
    for(i in required) {
        if(!(required[i] in req.body)) {
            responses.bad_request(res, required[i] + " is missing")
            return;
        }
    }

    for(key in req.body) {
        if(key in keysToValidators) {
            const valid = keysToValidators[key](req.body[key]);
            if(valid !== true) {
                responses.bad_request(res, valid);
                return;
            }
        }
    }

    if(req.body.password != req.body.password2) {
        responses.bad_request(res, "passwords doesn't match")
        return
    }
    db.query("select id from users where email='" + req.body.email + "'", function(results) {
        if(results.length > 0) {
            responses.bad_request(res, "email is already taken")
            return;
        }
        auth.hash_password(req.body.password, (hash) => {
            db.query("insert into users(name,email,password) values('" + req.body.username + "','" + req.body.email + "','" + hash + "')", function(results) {
                responses.ok(res)
            })
        })
    });

})

Router.post("/login", function(req, res) {
    if(!("email" in req.body) || !("password" in req.body)) {
        responses.bad_request(res, "Required fields are missing")
        return;
    }
    db.query("select * from users where email='" + req.body.email + "'", (results) => {
        if(results.length == 0) {
            responses.bad_request(res, "Invalid credentials")
            return;
        }
        results = results[0]
        const hashed = results["password"];
        auth.passwords_equal(req.body.password, hashed, (equals) => {
            if(equals) {
                //Creating jwt
                const token = auth.get_jwt({
                    id: results["id"],
                    email: results["email"]
                })
                res.cookie("jwt", token, {maxAge: process.env.JWT_EXPIRATION})
                responses.ok(res, token)
                return;
            }
            responses.bad_request(res, "Invalid credentials")
            return;
        })
    })
})

module.exports = Router;