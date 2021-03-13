var mysql = require('mysql')

var connection = mysql.createConnection({
	port: "3306",  
    host: "localhost",
    user: "root",
    password: "root",
    database: "time_schedule",
    timeout : "60000",
    multipleStatements: true
});

connection.connect(function (err) {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log("Connection to database was successful");

    }
});

module.exports = connection;