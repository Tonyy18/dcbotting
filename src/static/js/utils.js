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
function isLoggedIn() {
    const jwt = getJwt();
    return jwt != false;
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

    static updateBot(id, data, callback, error) {
        authRequest("/api/bot/" + id, "put", data, (res) => {
            callback(res);
        }, (err) => {
            error(getResponse(err));
        })
    }
}

function showModal(id, closable = true) {
    const modal = $("#" + id);
    modal.fadeIn();
    modal.addClass("open");
    if(closable) {
        modal.children(".module-background").on("click", function() {
            closeModal(id);
        })
        modal.find("[data-changeto]").off("click").on("click", function() {
            closeModal(id);
            showModal($(this).attr("data-changeTo"));
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