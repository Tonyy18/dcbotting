const db = require("./db")

let getBot = (id, callback) => {
    db.query("SELECT * FROM bots WHERE id='" + id + "'", (result) => {
        if(result.length == 0) {
            callback(false)
            return;
        }
        callback(result[0])
    })
}

exports.getBot = getBot;