const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const connection = require('../config/ConnectionClass');
// const { verifyToken } = require('./auth');

const router = express.Router();

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kcbsinfo@gmail.com",
        pass: "kcbsinfo@123"
    }
});

router.post("/user_registration", (req, res, next) => {
    try {

        var user_data = req.body;
        var user_first_name = user_data.first_name;
        var user_last_name = user_data.last_name;
        var user_email = user_data.email;
        var password = user_data.password;

        connection.query("select * from users where email=?", [user_email], function (err, result) {
            if (err) {
                res.send({
                    "response": "Failed",
                    "result": err.sqlMessage,
                    "errorMsg": "Can't Fetch Login ID"
                });
            }
            else if (result && result.length) {
                res.send({
                    "response": "Failed",
                    "result": result,
                    "errorMsg": "Email Already Exist"
                });
            }
            else {

                bcrypt.hash(password, 10, function (err, hashresult) {
                    console.log("Password:" + password + ", Hashed Value: " + hashresult);
                    if (true) {
                        connection.query("insert into users(first_name,last_name,email,password) values (?,?,?,?)", [user_first_name, user_last_name, user_email, hashresult], function (err, result) {
                            if (err) {
                                console.log("Error in inserting into users: " + err);
                                res.send({
                                    "response": "Failed",
                                    "result": err,
                                    "errorMsg": "Can't Fetch Login ID"
                                });
                            }
                            else {
                                res.send({
                                    "response": "Success",
                                    "result": [],
                                    "errorMsg": "Registration Success"
                                });

                                const message = {
                                    from: 'kcbsinfo@gmail.com', // Sender address
                                    to: user_email,         // recipients
                                    subject: 'Registration Completed', // Subject line
                                    text: 'Your password for login: ' + "\n" +  'Password: ' + password // Plain text body
                                };
                                transport.sendMail(message, function (err, info) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        res.send({
                                            "response": "Success",
                                            "result": [],
                                            "errorMsg": "Registration Success"
                                        });

                                    }
                                });
                            }
                        });
                    }
                    else {
                        console.log("Error in encrypting Password");
                    }

                });
            }

        });

    } catch (Error) {
        next(error);
    }
});

router.get("/get_all", verifyToken, (req, res, next) => {
    try {

        connection.query("select * from tbl_users where user_status<>?", ["deleted"], function (err, result) {
            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Can't Fetch users"
                });
            } else {
                res.send({
                    "response": "Success",
                    "result": result,
                    "errorMsg": "users listed Successfully"
                });
            }

        });

    } catch (error) {
        next(error);
    }
});

router.post("/get_one", verifyToken, (req, res, next) => {
    try {
        var login_id = req.body.login_id;

        connection.query("select * from tbl_users where login_id=?", [login_id], function (err, result) {
            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Can't Fetch user"
                });
            } else {
                res.send({
                    "response": "Success",
                    "result": result,
                    "errorMsg": "user listed Successfully"
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/update_user", verifyToken, (req, res, next) => {
    try {
        var dist_data = req.body;
        var dist_id = dist_data.user_id;
        var dist_name = dist_data.user_name;
        var phone = dist_data.user_phone;
        var email = dist_data.user_email;
        var address = dist_data.user_address;
        var lastmodified_by = dist_data.lastmodified_by;
        console.log("em " + email);
        connection.query("update tbl_users set user_name=? ,user_address=?, user_phone=?, user_email=?, lastmodified_by=? where user_id=?",
            [dist_name, address, phone, email, lastmodified_by, dist_id], function (err, result) {
                if (err) {
                    res.send({
                        "response": "Failed",
                        "result": [],
                        "errorMsg": "Failed to Update user"
                    });
                }
                else {
                    res.send({
                        "response": "Success",
                        "result": result,
                        "errorMsg": "user Updated Successfully"
                    });
                }
            });
    } catch (error) {
        next(error);
    }
});


router.post("/delete_user", verifyToken, (req, res, next) => {
    try {
        var dist_data = req.body;
        var lastmodified_by = dist_data.lastmodified_by;
        var dist_id = dist_data.user_id;

        connection.query("update tbl_users set user_status=?, lastmodified_by=? where user_id=?", ["deleted", lastmodified_by, dist_id], function (err, result) {
            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed to Delete user"
                });
            }
            else {


                connection.query("select login_id,user_id from tbl_users where user_id=?", [dist_id], function (err, result) {

                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to Fetch user Login Details"
                        });
                    }
                    else if (result && result.length) {
                        var lid = "";
                        Object.keys(result).forEach(function (key) {
                            var rowrole = result[key];

                            lid = rowrole.login_id;

                        });
                        connection.query("update tbl_login set login_status=? where login_id=?", ["disabled", lid], function (err, result) {

                            if (err) {
                                res.send({
                                    "response": "Failed",
                                    "result": [],
                                    "errorMsg": "Failed to Delete user Login Account"
                                });
                            }
                            else {
                                res.send({
                                    "response": "Success",
                                    "result": [],
                                    "errorMsg": "user Deleted Successfully"
                                });
                            }

                        });
                    }

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
    jwt.verify(token, "time-schedule", function (err, decoded) {
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

router.use(verifyToken);

module.exports = router;
