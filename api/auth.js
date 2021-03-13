const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createErrors = require('http-errors');
const connection = require('../config/ConnectionClass');

const router = express.Router();

router.post("/login", (req, res, next) => {
    try {

        var login_data = req.body;
        console.log(login_data);
        var user_email = login_data.user_email;
        var user_password = login_data.user_password;
        var proles;
        var user_id;
        var token;

        connection.query("select * from users where email=?", [user_email], function (err, result) {
            console.log(result.length);
            if (err) {
                console.log("Invalid Username/Password");
                res.send({
                    "Response": "Failed",
                    "Result": [],
                    "Error": "Invalid Data Entered"
                });
            }
            else if (result && result.length) {
                Object.keys(result).forEach(function (key) {
                    var row = result[key];
                    console.log("passwordbcrypt:" + row.password);

                    var hashpassword = row.password;
                    user_id = row.id;

                    bcrypt.compare(user_password, hashpassword, function (err, result) {

                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        else if (!result) {
                            res.send({
                                "Response": "Failed",
                                "Result": [],
                                "Error": "Password Does not Match"
                            });
                        }
                        else {
                            console.log("result is: " + result);
                            let resp = {
                                id: user_id
                            }
                            console.log("Token s");
                            token = jwt.sign(resp, "time-schedule", { expiresIn: 86400 });
                            console.log("Token :" + token);

                            //update token to tbl_login

                            connection.query("update users set remember_token=? where id=?", [token, user_id], function (err, result) {
                                if (err) {
                                    console.log("Token Updation Falied")
                                    res.send({
                                        "Response": "Failed",
                                        "Result": err.sqlMessage,
                                        "Error": "Can't Access Role"
                                    });

                                }
                                else {
                                    console.log("Token Updation Success")
                                    res.send({
                                        "Response": "Success",
                                        "Result": [
                                            {
                                                "role": proles,
                                                "token": token,
                                                "user_id": user_id
                                            }
                                        ],
                                        "Error": "Login successful"
                                    });
                                }
                            });

                        }
                    });
                });
            } else {
                console.log("Not found")
                res.send({
                    "Response": "Success",
                    "Result": [],
                    "Error": "Email Updated"
                });
            }
        });

    } catch (error) {
        next(error);
    }
});

//Middleware Concept
function verifyToken(req, res, next) {
    let authHeader = req.headers.authorization;

    if (authHeader == undefined) {
        res.status(401).send({
            "response": "Failed",
            "result": "Authorization Failed",
            "errorMsg": "No Token Provided"
        });
    }
    let token = authHeader.split(" ").pop();
    jwt.verify(token, "cablevision", function (err, decoded) {
        if (err) {
            res.status(500).send({
                "response": "Failed",
                "result": "Authorization Failed",
                "errorMsg": "No Token Provided"
            });
        }
        else {
            next();
            // res.send({
            //     "response": "Success",
            //     "result": "Authorization Success",
            //     "errorMsg": "Authorized User"
            // });
        }
    });
}
module.exports = router;