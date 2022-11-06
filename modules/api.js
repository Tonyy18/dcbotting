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

let saveBot = (owner, name, data, callback) => {
    db.query("INSERT INTO bots (creator,name,data) VALUES(" + owner + ", '" + name + "', '" + data + "')", (results) => {
        callback(results);
    })
}

exports.getBot = getBot;
exports.saveBot = saveBot;