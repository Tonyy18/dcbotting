const mysql = require("mysql")
require("dotenv").config();
const connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
})
connection.connect();
let query = (query, success = ()=>{}, error=()=>{}) => {
    connection.query(query, (err, results, fields) => {
        if(err) {
            console.error(err);
            error(err);
            return;
        }
        success(results);
    })
}

let getRequiredCols = (table, callback) => {
    connection.query("SHOW COLUMNS FROM " + table, (err, results, fields) => {
        const re = [];
        for(let a = 0; a < results.length; a++) {
            const col = results[a];
            if(col["Null"] == "NO" && col["Key"] != "PRI") {
                re.push(col["Field"]);
            }
        }
        callback(re);
    })
}

let getCols = (table, callback) => {
    connection.query("SHOW COLUMNS FROM " + table, (err, results, fields) => {
        const re = [];
        for(let a = 0; a < results.length; a++) {
            const col = results[a];
            if(col["Key"] != "PRI") {
                re.push(col["Field"]);
            }
        }
        callback(re);
    })
}

exports.query = query
exports.getRequiredCols = getRequiredCols;
exports.getCols = getCols;