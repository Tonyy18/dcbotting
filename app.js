const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express")
const app = express()
const dataLimit = "50mb"
app.use(express.json({limit: dataLimit}))
app.use(express.urlencoded({limit: dataLimit}))

const auth = require("./modules/auth");

const indexRouters = require("./modules/routers/indexRouter");
const authRouter = require("./modules/routers/authRouter");
const apiRouter = require("./modules/routers/apiRouter");
const accountRouter = require("./modules/routers/accountRouter");


app.use("", indexRouters);

app.get("/static/*", (req, res) => {
    res.sendFile(__dirname + "/src/" + req.originalUrl)
})

app.use("/api", apiRouter);
app.use("/auth", authRouter);
app.use("/account", accountRouter);
app.use(auth.jwt_middleware);
app.post("/ping", function(req, res) {
    res.sendStatus(200)
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

const httpServer = http.createServer(app);
let _port = process.argv.slice(2);
let port = 80;
if(_port.length > 0) {
	port = parseInt(_port[0]);
}
httpServer.listen(port, () => {
    console.log("Listening port " + port)
})

