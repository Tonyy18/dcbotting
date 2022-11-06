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

function authRequest(url, type, data, callback, error) {
    const jwt = getJwt();
    if(!jwt) {
        error({
            code: 401,
            message: "Unauthorized"
        })
        return;
    }
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

class Requests {
    static ping(callback, error=()=>{}) {
        authRequest("/ping", "post", {}, (res) => {
            callback(res)
        }, (err) => {
            error(err.responseJSON)
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
                error(results.responseJSON);
            }
        })
    }
    static saveBot(data, callback, error) {
        authRequest("/api/bot", "post", data, (res) => {
            callback(res)
        }, (err) => {
            error(err.responseJSON);
        })
    }
    static getBot(id, callback,error) {
        authRequest("/api/bots/" + id, "get", "", (res) => {
            callback(res)
        }, (err) => {
            error(err.responseJSON);
        })
    }
}