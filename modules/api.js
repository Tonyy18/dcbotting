const db = require("./db")
const constants = require("./constants");
const fs = require("fs")
let getBot = (id, callback, error) => {
    db.query("SELECT * FROM bots WHERE id='" + id + "'", (result) => {
        if(result.length > 0) {
            result[0]["data"] = JSON.parse(result[0]["data"])
        }
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
        if(key == "public" && dict[key] == "true") {
            dict[key] = 1
        }
        if(key == "public" && dict[key] == "false") {
            dict[key] = 0
        }
        sql += key + "='" + dict[key] + "',";
    }
    return sql.substring(0, sql.length - 1);;
}

let updateBot = (id, data, callback, error=() => {}) => {
    function insertSql() {
        const sql = buildUpdateParams(data);
        db.query("UPDATE bots SET " + sql + " WHERE id=" + id, (result) => {
            callback(result);
        }, (err) => {
            error(err);
        })
    }

    if("picture" in data && typeof data["picture"] == "object" && typeof data["picture"]["data"] == "object") {
        //Image
        let imageType = data["picture"]["mimetype"].split("/")[1];
        const imagePath = constants.botPicturesPath + "/" + id + "." + imageType
        fs.writeFile(imagePath, data["picture"]["data"], "binary", (err) => {
            if(err) {
                error(err);
                return
            } else {
                data["picture"] = constants.botPictureAccessPath + "/" + id + "." + imageType;
                insertSql();
            }
        });
    } else {
        insertSql();
    }
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