const axios = require("axios")

const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express")
const app = express()
const db = require("./modules/db");
const dataLimit = "50mb"
app.use(express.json({limit: dataLimit}))
app.use(express.urlencoded({limit: dataLimit}))

const auth = require("./modules/auth");
const api = require("./modules/api");

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/src/index.html")
})
app.get("/editor", (req, res) => {
    res.sendFile(__dirname + "/src/editor.html")
})
app.get("/docs", (req, res) => {
    res.sendFile(__dirname + "/src/docs.html")
})
app.get("/sitemap", (req, res) => {
    res.sendFile(__dirname + "/data/sitemap.xml")
})

app.get("/static/*", (req, res) => {
    res.sendFile(__dirname + "/src/" + req.originalUrl)
})

app.use("/api", api.router);
app.use("/auth", auth.router);

app.post("/router", async (req, res) => {
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

app.get("/download/*", (req, res) => {
    const url = req.originalUrl;
    const split = url.split("/download/");
    if(split.length > 1) {
        const file = decodeURI(url.split("/download/")[1])
        res.download(__dirname + "/data/downloads/" + file);
    } else {
        res.sendStatus(400);
    }
})

try {
    //Enable SSL
    const privateKey = fs.readFileSync("/etc/letsencrypt/live/dcbotting.com/privkey.pem");
    const certificate = fs.readFileSync("/etc/letsencrypt/live/dcbotting.com/fullchain.pem");
    const credentials = {
        key: privateKey,
        cert: certificate
    }

    app.use(function(req, res, next) {
        //Redirect to https if not secured already
        if(req.headers.host.includes("www")) {
            res.set("location", "https://dcbotting.com" + req.url);
            res.status(301);
            res.send();
            return
        }
        if(req.secure) {
            next() ;
        } else {
            res.set("location", "https://" + req.headers.host + req.url);
            res.status(301);
            res.send()
        }
    })

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
        console.log("Listening port 443 for SSL")
    })
} catch(e) {
    console.log("SSL is not enabled: " + e)
}

app.use(auth.jwt_middleware);
app.post("/ping", function(req, res) {
    res.sendStatus(200)
})

const httpServer = http.createServer(app);
let _port = process.argv.slice(2);
let port = 80;
if(_port.length > 0) {
	port = parseInt(_port[0]);
}
httpServer.listen(port, () => {
    console.log("Listening port " + port)
})

