const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const db = require("./db")
require("dotenv").config();
const express = require("express");
const router = express.Router();
const get_jwt = (payload) => {
    //jwt.sign(payload, process.env.JWT_KEY, {expiresIn: "10000"});
    let token = jwt.sign(payload, process.env.JWT_KEY);
    return token
}
const verify_jwt = (token, success = () =>{}, error = () => {}) => {
    try {
        let payload = jwt.verify(token, process.env.JWT_KEY);
        success(payload);
    } catch(err) {
        error(err);
    }
}
const jwt_middleware = (req, res, next) => {
    //Check the valid jwt from authorization header
    //Before any secured api method
    let auth = req.get("authorization")
    if(!auth) {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Unauthorized"
        })
        return;
    }
    auth = auth.split(" ")
    if(auth.length != 2 || auth[0].toLowerCase() != "bearer") {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Unauthorized"
        })
        return;
    }
    auth = auth[1]
    verify_jwt(auth, (payload) => {
        req.payload = payload;
        next();
    }, (error) => {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Unauthorized"
        })
        return;
    })
};
exports.jwt_middleware = jwt_middleware;

function validateEmail(email) {
    return String(email)
                .toLowerCase()
                .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
}

function hash_password(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            callback(hash);
        })
    })
}

function passwords_equal(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, res) {
        if(res) {
            callback(true)
            return
        }
        callback(false)
    })
}

router.post("/register", function(req, res) {
    const required = ["username", "email", "password"]
    for(i in required) {
        if(!(required[i] in req.body)) {
            res.status(400);
            res.json({
                "status": 400,
                "message": required[i] + " is missing"
            })
            return
        }
    }
    if(req.body.username.length < 2) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "username is too short"
        })
        return
    }
    if(req.body.username.length > 20) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "username is too long"
        })
        return
    }
    if(!validateEmail(req.body.email)) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "invalid email"
        })
        return
    }
    if(req.body.password.length < 6) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "password is too short"
        })
        return
    }
    if(req.body.password.length > 50) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "password is too long"
        })
        return
    }
    if(req.body.password != req.body.password2) {
        res.status(400);
        res.json({
             "status": 400,
            "message": "passwords doesn't match"
        })
        return
    }
    db.query("select id from users where email='" + req.body.email + "'", function(results) {
        if(results.length > 0) {
            res.status(400);
            res.json({
                "status": 400,
                "message": "email is already taken"
            })
            return;
        }
        hash_password(req.body.password, (hash) => {
            db.query("insert into users(name,email,password) values('" + req.body.username + "','" + req.body.email + "','" + hash + "')", function(results) {
                res.json({
                    "status": 200,
                    "message": "User created"
                });
            })
        })
    });

})

router.post("/login", function(req, res) {
    if(!("email" in req.body) || !("password" in req.body)) {
        res.status(400)
        res.json({
            "status": 400,
            "message": "invalid credentials"
        })
        return;
    }
    db.query("select * from users where email='" + req.body.email + "'", (results) => {
        if(results.length == 0) {
            res.status(400)
            res.json({
                "status": 400,
                "message": "invalid credentials"
            })
            return;
        }
        results = results[0]
        const hashed = results["password"];
        passwords_equal(req.body.password, hashed, (equals) => {
            if(equals) {
                //Creating jwt
                const token = get_jwt({
                    id: results["ID"],
                    email: results["EMAIL"]
                })
                res.json({
                    "status": 200,
                    "message": token
                })
                return;
            }
            res.status(400)
            res.json({
                "status": 400,
                "message": "invalid credentials"
            })
            return;
        })
    })
})

exports.router = router;
exports.get_jwt = get_jwt;