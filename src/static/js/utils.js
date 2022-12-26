class Notice {
    constructor(dom) {
        this.dom = $(dom);
    }
    show(text) {
        this.dom.children("p").html(text)
        this.dom.fadeIn();
        setTimeout(() => {
            this.hide();
        }, 4000)
    }
    hide() {
        this.dom.fadeOut();
    }
}
function getJwt() {
    const jwt = localStorage.getItem("jwt");
    if(jwt != null && (jwt && jwt != "")) {
        return jwt
    }
    return false;
}

function logout() {
    localStorage.removeItem("jwt");
    document.cookie = "jwt=; expires=-1"
}
function isLoggedIn(success=()=>{}, error=()=>{}) {
    Requests.ping(function(res) {
        success(res)
    }, function(err) {
        error(err)
    })
}
function getJwtPayload () {
    const token = getJwt();
    if(!token) {
        return false;
    }
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
function authRequest(url, type, data, callback, error) {
    const jwt = getJwt();
    $.ajax({
        url: url,
        type: type,
        data: data,
        headers: {
            "authorization": "bearer " + jwt
        },
        success: function(e) {
            callback(e)
        },
        error: function(e) {
            error(e)
        }
    })
}

function getResponse(res) {
    console.log(res)
    if(res["message"] == undefined) {
        if(res.responseJSON == undefined || res.responseJSON["message"] == undefined) {
            return {
                code: 500,
                message: "Internal server error"
            }
        }
        return res.responseJSON;
    }
    return res;
}

function key_data_response_to_object(res) {
    const results = {}
    const data = res["message"];
    for(let a = 0; a < data.length; a++) {
        results[data[a]["name"]] = JSON.parse(data[a]["data"])
    }
    res["message"] = results
    return res;
}

class Requests {
    static ping(callback, error=()=>{}) {
        authRequest("/ping", "post", {}, (res) => {
            callback(res)
        }, (err) => {
            error(getResponse(err))
        })
    }
    static login(data, callback, error) {
        $.ajax({
            type: "POST",
            url: "/auth/login",
            data: data,
            success: function(results) {
                callback(results);
            },
            error: function(results) {
                error(getResponse(results));
            }
        })
    }
    static saveBot(data, callback, error) {
        authRequest("/api/bot", "post", data, (res) => {
            callback(res)
        }, (err) => {
            error(getResponse(err));
        })
    }
    static getBot(id, callback,error) {
        authRequest("/api/bot/" + id, "get", "", (res) => {
            callback(res)
        }, (err) => {
            error(getResponse(err));
        })
    }

    static getBotsByUserId(id, callback, error) {
        authRequest("/api/user/" + id + "/bots", "get", "", (res) => {
            callback(res)
        }, (err) => {
            error(getResponse(err));
        })
    }

    static updateBot(id, data, callback, error) {
        authRequest("/api/bot/" + id, "put", data, (res) => {
            callback(res);
        }, (err) => {
            error(getResponse(err));
        })
    }

    static getMethods(_success, _error, _async=true) {
        $.ajax({
            url: "/api/methods",
            async: _async,
            success: function(res) {
                _success(key_data_response_to_object(res))
            },
            error: function(res) {
                _error(res)
            }
        })
    }
    static getEvents(_success, _error, _async=true) {
        $.ajax({
            url: "/api/events",
            async: _async,
            success: function(res) {
                _success(key_data_response_to_object(res))
            },
            error: function(res) {
                _error(res)
            }
        })
    }
}

function showModal(id, closable = true) {
    const modal = $("#" + id);
    modal.fadeIn();
    modal.addClass("open");
    modal.find("[data-changeto]").off("click").on("click", function() {
        closeModal(id);
        showModal($(this).attr("data-changeTo"), closable);
    })
    if(closable) {
        modal.children(".module-background").on("click", function() {
            closeModal(id);
        })
    } else {
        modal.children(".module-background").off("click")
    }
}
function closeModal(id) {
    const modal = $("#" + id);
    modal.removeClass("open")
    modal.find(".main-error").empty().hide();
    modal.fadeOut();
}