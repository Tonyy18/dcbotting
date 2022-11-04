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
exports.query = query