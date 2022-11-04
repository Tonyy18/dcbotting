const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const db = require("./db")
require("dotenv").config();
const express = require("express");
const responses = require("./responses");
const get_jwt = (payload) => {
    let token = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRATION});
    return token
}
exports.get_jwt = get_jwt;
const verify_jwt = (token, success = () =>{}, error = () => {}) => {
    try {
        let payload = jwt.verify(token, process.env.JWT_KEY);
        success(payload);
    } catch(err) {
        error(err);
    }
}
exports.verify_jwt = verify_jwt;
const is_authenticated = (req, callback) => {
    //Check the valid jwt from authorization header
    //Before any secured api method
    let auth = req.get("authorization")
    if(!auth) {
        callback(false);
        return;
    }
    auth = auth.split(" ")
    if(auth.length != 2 || auth[0].toLowerCase() != "bearer") {
        callback(false);
        return;
    }
    auth = auth[1]
    verify_jwt(auth, (payload) => {
        req.payload = payload;
        callback(true);
    }, (error) => {
        callback(false);
        return;
    })
}
exports.is_authenticated = is_authenticated;
const jwt_middleware = (req, res, next) => {
    //Check the valid jwt from authorization header
    //Before any secured api method
    is_authenticated(req, function(bool) {
        if(bool) {
            next();
        } else {
            responses.unauthorized(res);
        }
    })
};
exports.jwt_middleware = jwt_middleware;

const hash_password = (password, callback) => {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            callback(hash);
        })
    })
}
exports.hash_password = hash_password;

const passwords_equal = (password, hash, callback) => {
    bcrypt.compare(password, hash, function(err, res) {
        if(res) {
            callback(true)
            return
        }
        callback(false)
    })
}
exports.passwords_equal = passwords_equal;