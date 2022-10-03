
class Bot {

    constructor(token) {
        this.base = "https://discord.com/api"
        this.token = token;
        this.open = false;
        this.s = null;
        this.t = null;
        this.sessionId = null;
        this.gateway = null;
        this.user = {};
        this.guilds = {};
        this.lastMessage = null;
        this.reconnected = 0;

        this.headers = {
            "Authorization": "Bot " + this.token
        }

        this.onmessage = (event) => {};
        this.onopen = () => {};
        this.onclose = () => {};
        this.onerror = () => {};

        this.events = {}
        this.submitted = {}

    }

    on(eventName, callback, submission = true) {
        if(!eventName || !callback) {
            return
        }
        eventName = eventName.toUpperCase()
        if(submission == false) {
            if(!(eventName in this.events)) this.events[eventName] = [];
            this.events[eventName].push(callback);
        } else {
            if(!(eventName in this.submitted)) this.submitted[eventName] = [];
            this.submitted[eventName].push(callback);
        }
    }

    identify() {
        const payload = {
            "op": 2,
            "d": {
                "token": this.token,
                "properties": {
                "$os": "linux",
                "$browser": "my_library",
                "$device": "my_library"
              }
            }
        }
        this.send(payload)
    }

    sendHeartbeat() {
        const payload = {
            "op": 1,
            "d": this.s
        }
        this.send(payload)
    }

    send(payload) {
        if(typeof this.socket == "undefined" || this.open == false) {
            Logger.error("Sending a payload failed. Connection is closed");
            return
        }
        this.socket.send(JSON.stringify(payload))
    }

    connect(gateway) {
        if(gateway) {
            this.gateway = gateway;
        } else if(typeof this.gateway != "string") {
            Logger.error("Couldn't start a connection. Gateway endpoint missing");
            return;
        }
        
        this.socket = new WebSocket(this.gateway)
        this.socket.onopen = this.onopen
        this.socket.onclose = this.onclose
        this.socket.onerror = this.onerror
        this.socket.onmessage = this.onmessage;
        
    }

    resume() {
        const payload = {
            "op": 6,
            "d": {
              "token": this.token,
              "session_id": this.sessionId,
              "seq": this.s
            }
        }
        this.send(payload);
        Logger.log("Last session resumed");
    }

    reconnect(reason = "Disconnected") {
        Logger.empty();
        Logger.log(reason);
        this.disconnect();
        if(this.reconnected == 5) {
            this.reconnected = 0;
            Logger.error("Reconnected 5 times without success. Try again later");
            return;
        }
        Logger.log("Reconnecting ...")
        this.connect();
        this.reconnected++;
    }

    getGateway(callback) {
        callback("wss://gateway.discord.gg/")
        /* $.ajax({
            url: "https://discord.com/api/gateway/bot",
            dataType: "json",
            headers: {
                "access-control-allow-credentials": "true",
                "access-control-allow-methods": "POST, GET, PUT, PATCH, DELETE",
                "access-control-allow-origin": "http://localhost",
                "Authorization": "Bot " + this.token,
                "access-control-allow-headers": "Content-Type, Authorization, X-Track, X-Super-Properties, X-Context-Properties, X-Failed-Requests, X-Fingerprint, X-RPC-Proxy, X-Debug-Options, x-client-trace-id, If-None-Match, X-RateLimit-Precision"
            },
            crossDomain: true,
            success: function(data) {
                if(data) {
                    if("url" in data && callback) {
                        callback(data["url"]);
                        return
                    }
                }
                Logger.error("Couldn't retrieve gateway endpoint")
            },
            error: function(data) {
                const json = data.responseJSON;
                Logger.error("API gateway request error")
                if(json && "message" in json) {
                    Logger.error(json["message"])
                }
            }
        }) */
    }

    log(text) {
        Logger.raw("[Bot] " + text);
    }

    disconnect() {
        if(typeof this.socket == "undefined") {
            return;
        }
        status("offline");
        clearInterval(bot.heartbeat);
        servers.empty();
        this.socket.close();
    }

    exec(data, method) {
        method = methods[method]["request"];
        const type = method["type"];
        if(type == "undefined" || type == "gw") {
            //Sent to the gateway (web socket)
            this.send({
                "op": method["op"],
                "d": data
            })
            return {};
        }
        let url = this.base + method["url"];
        //Check if the property is in the url instead of body
        for(const key in data) {
            if(url.includes("{" + key + "}")) {
                url = url.replace("{" + key + "}", data[key]);
                delete data[key]
                continue
            }
        }

        let headers = {}
        if("headers" in method) {
            headers = method["headers"];
        }

        headers = Object.assign({}, headers, this.headers);
        let re = this.request("/router", "post", {
            "url": url,
            "data": JSON.stringify(data),
            "headers": JSON.stringify(headers),
            "type": type,
        });

        if(!re) {
            re = {}
        }
        return JSON.parse(re);
    }

    request(url, type, data = {}, headers={}, async=false) {

        headers = Object.assign({}, headers, this.headers);

        const results = $.ajax({
            type:type,
            url: url,
            headers: headers,
            data:data,
            async: async
        }).responseText

        return results;
    }

}

getToken(function(token) {
    setTimeout(function() {
        getBot(function(json, botParam) {
            uploadJson(json)
            window.history.replaceState(null, null, "?token=" + token + "&bot=" + botParam);
        }, function() {
            window.history.replaceState(null, null, "?token=" + token);
        });
        init(token)
    }, 1000);
})

function init(token) {

    Logger.empty()
    bot = new Bot(token);

    bot.onopen = function() {
        bot.open = true
        Logger.log("Websocket connection established")
    }
    bot.onerror = function(event) {
        Logger.error("WebSocket error observed: " + event);
    }
    bot.onclose = function(event) {
        const code = event.code;
        console.log(bot.lastMessage);
        if(code >= 4000) {
            Logger.error("Connection closed because: " + event.reason + " (" + code + ") ")
        } else {
            Logger.error("Connection closed");
        }
    }
    
    bot.onmessage = function(event) {
        const data = JSON.parse(event.data)
        bot.lastMessage = event;
        const op = data["op"]
        if("t" in data) bot.t = data["t"]
        if("s" in data) bot.s = data["s"]
        
        const d = data["d"]
    
        //Find method for op code
        if(op == 10) {
            //hello
            //Start hearbeating
            interval = d["heartbeat_interval"];
            bot.sendHeartbeat() //Send first heartbeat
            bot.identify() //Final handshake
            bot.heartbeat = setInterval(function() {
                bot.sendHeartbeat()
            }, interval)
            Logger.log("Heartbeat started, interval " + interval + "ms");
        }
        if(op == 1) {
            //Server asks for a heartbeat
            bot.sendHeartbeat();
        }

        if(op == 7) {
            //Disconnected
            bot.reconnect("Disconnected");
        }

        if(op == 9) {
            //Invalid Session
            bot.reconnect("Invalid session");
        }

        if(op == 0) {
            //EVENT
            let eventName = bot.t;
            if(eventName in bot.events) {
                const events = bot.events[eventName]
                for(let a = 0; a < events.length; a++) {
                    events[a](d);
                }
            }

            let senderId = null;
            if("author" in d) {
                senderId = d["author"]["id"]
            } else if("user" in d) {
                senderId = d["user"]["id"]
            } else {
                senderId = d["id"];
            }

            if(bot.user.id == senderId) {
                //Don't react to bots own activities. (infinite loop)
                return;
            }
            bot.log(eventName + " event received")
            if(eventName in bot.submitted) {
                const events = bot.submitted[eventName];
                let data = [d];
                for(let a = 0; a < events.length; a++) {
                    const results = events[a](data);
                    data.push(results);
                }
            }
        }
    
    }   
    
    bot.on("ready", function(data) {
        bot.reconnected = 0;
        bot.sessionId = data["session_id"]
        const clientId = data["user"]["id"];
        bot.user = data.user;
        const link = inviteLink(clientId);
        status("online");
        bot.log(data.user.username + " is now online")
        Logger.log("The following invitation link is with administrator permissions and for testing only. Generate a new link for public sharing from the discord developer portal. <a target='__blank' href='https://discord.com/developers/applications/" + clientId + "/oauth2'>Developer portal</a>");
        bot.log("Invitation link for testing: <a href='https://discord.com/api/oauth2/authorize?client_id=" + clientId + "&permissions=8&scope=bot' target='__blank'>https://discord.com/api/oauth2/authorize?client_id=" + clientId + "&permissions=8&scope=bot</a>");
    }, false)
    bot.on("guild_create", function(data) {
        if(data.id in bot.guilds) return;

        servers.add(data)
        bot.guilds[data.id] = data;
    }, false)
    bot.on("guild_update", function(data) {
        servers.update(data);
    }, false)
    bot.on("guild_delete", function(data) {
        servers.remove(data);
        if(data.id in bot.guilds) {
            delete bot.guilds[data.id];
        }
    }, false)
    bot.on("user_update", function(data) {
        bot.user = data;
    }, false)

    Logger.log("Bot initialized")

    //Connection
    bot.getGateway((gateway) => {
        Logger.log("Gateway endpoint retrieved " + gateway);
    
        bot.connect(gateway)
    })
}