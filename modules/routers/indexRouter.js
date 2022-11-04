const express = require("express");
const Router = express.Router();
const axios = require("axios")
const parentUrl = require("../parentUrl");

Router.get("/", (req, res) => {
    res.sendFile(parentUrl + "/src/index.html")
})
Router.get("/editor", (req, res) => {
    res.sendFile(parentUrl + "/src/editor.html")
})
Router.get("/docs", (req, res) => {
    res.sendFile(parentUrl + "/src/docs.html")
})
Router.get("/sitemap", (req, res) => {
    res.sendFile(parentUrl + "/data/sitemap.xml")
})
Router.post("/router", async (req, res) => {
    //This is made because cross origin error in client side
    //Redirects requests to the discord api
    const url = req.body.url;
    const data = JSON.parse(req.body.data);
    const headers = JSON.parse(req.body.headers);
    headers["User-Agent"] = "DiscordBot (http://localhost, 0.0.0.1)"
    const type = req.body.type;

    const options = {
        method: type,
        url: url,
        headers: headers,
        mode: "cors"
    }

    if(Object.keys(data).length > 0) {
        options["data"] = data;
    }
    await axios(options).then((response) => {
        res.set("Content-type", "application/json")
        res.json(response.data)
        res.end();
    }).catch((error) => {
        res.set("Content-type", "application/json")
        let ob = {
            "message": error.response.statusText,
            "code": error.response.status
        }
        if(Object.keys(error.response.data).length > 0) {
            ob = error.response.data
        }
        /* console.log(error.response) */
        ob["error"] = true;
        res.json(ob)
        res.end();
    })

})
module.exports = Router