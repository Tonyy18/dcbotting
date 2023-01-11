const db = require("./db")
const constants = require("./constants");
let getBot = (id, callback, error) => {
    db.query("SELECT * FROM bots WHERE id='" + id + "'", (result) => {
        callback(result[0])
    }, (err) => {
        error(err);
    })
}

let getBotsByUserId = (id, callback, error) => {
    db.query("SELECT * FROM bots WHERE creator='" + id + "'", (result) => {
        callback(result)
    }, (err) => {
        error(err);
    })
}

let saveBot = (owner, name, data, callback, error) => {
    db.query("INSERT INTO bots (creator,name,data,picture) VALUES(" + owner + ", '" + name + "', '" + data + "', '" + constants.defaultAvatar + "')", (results) => {
        callback(results);
    }, (err) => {
        error(err);
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

let deleteBot = (id, callback, error=()=>{}) => {
    db.query("DELETE FROM bots WHERE id=" + id, (result) => {
        callback(result);
    }, (err) => {
        error(err)
    })
}

let getMethods = (success, error) => {
    db.query("SELECT * FROM methods ORDER BY name", (results) => {
        success(results)
    }, (err) => {
        error(err)
    })
}
let getEvents = (success, error) => {
    db.query("SELECT * FROM events ORDER BY name", (results) => {
        success(results)
    }, (err) => {
        error(err)
    })
}

exports.getEvents = getEvents
exports.getMethods = getMethods
exports.getBot = getBot;
exports.saveBot = saveBot;
exports.updateBot = updateBot;
exports.deleteBot = deleteBot;
exports.getBotsByUserId = getBotsByUserId