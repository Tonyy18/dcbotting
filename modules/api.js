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

function buildUpdateParams(dict) {
    let sql = "";
    for(key in dict) {
        sql += key + "='" + dict[key] + "',";
    }
    return sql.substring(0, sql.length - 1);;
}

let updateBot = (id, data, callback, error=() => {}) => {
    const sql = buildUpdateParams(data);
    db.query("UPDATE bots SET " + sql + " WHERE id=" + id, (result) => {
        callback(result);
    }, (err) => {
        error(err);
    })
}

exports.getBot = getBot;
exports.saveBot = saveBot;
exports.updateBot = updateBot;