const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const validate = require('validatorjs');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
const connection = require('../config/ConnectionClass');
const randomstring = require('randomstring');
// const mailclass=require('./mail');


const router = express.Router();

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kcbsinfo@gmail.com",
        pass: "kcbsinfo@123"
    }
});


router.post("/requestusernamepassword", (req, res, next) => {

    var userdata = req.body;
    var login_email = userdata.login_email;
    var request = userdata.request;
    var login_id = "";

    try {

        connection.query("select * from tbl_login where login_email=?", [login_email], function (err, result) {

            if (err) {
                res.send({

                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed Error Occured"
                });
            }
            else if (result && result.length) {
                Object.keys(result).forEach(function (key) {
                    var rowrole = result[key];
                    login_id = rowrole.login_id;

                });

                connection.query("insert into tbl_requests(login_id,request,lastmodified_on) values(?,?,CURRENT_DATE())", [login_id, request], function (err, result) {
                    if (err) {
                        console.log("Error" + err);
                        res.send({

                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed Error Occured"
                        });
                    } else if (result && result.length) {
                        console.log("IVIDE ");
                        res.send({
                            "response": "Success",
                            "result": result,
                            "errorMsg": "Request successfully Sent"
                        });
                    }
                    else {
                        console.log("IVIDE Allla");
                        res.send({
                            "response": "Success",
                            "result": [],
                            "errorMsg": "Request successfully Sent"
                        });
                    }
                });

            }
            else {
                res.send({

                    "response": "Failed",
                    "result": [],
                    "errorMsg": "No User Found"
                });
            }
        });

    } catch (error) {
        next(error);
    }

});

router.get("/getAllRequestsByDistributor", verifyToken, (req, res, next) => {

    var role_id = "";
    var role = "";
    var login_id = "";

    try {
        connection.query("select * from tbl_requests q inner join tbl_role r on q.role_id=r.role_id where q.role_id NOT IN (?,?)",["1","4"], function (err, result) {

            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed to fetch request"
                });
            } else if (result && result.length) {
                res.send({
                    "response": "Success",
                    "result": result,
                    "errorMsg": "Fetched Request Successfully"
                });

            }
            else {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed to fetch request"
                });
            }

        });

    } catch (error) {
        next(error);
    }

});

router.post("/getUserOne", verifyToken, (req, res, next) => {

    var userdata = req.body;
    var login_id = userdata.login_id;
    var role_id = userdata.role_id;

    try {
        if (role_id == "4") {
            connection.query("SELECT * from tbl_distributors where login_id=?", [login_id],
                function (err, result) {
                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to fetch request"
                        });
                    }
                    else {
                        res.send({
                            "response": "Success",
                            "result": result,
                            "errorMsg": "Fetched Request Successfully"
                        });
                    }
                });
        }
        else if (role_id == "3") {
            connection.query("SELECT * from tbl_sub_distributors where login_id=?", [login_id],
                function (err, result) {
                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to fetch request"
                        });
                    }
                    else {
                        res.send({
                            "response": "Success",
                            "result": result,
                            "errorMsg": "Fetched Request Successfully"
                        });
                    }
                });
        }
        else if (role_id == "2") {
            connection.query("SELECT * from tbl_staff where login_id=?", [login_id],
                function (err, result) {
                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to fetch request"
                        });
                    }
                    else {
                        console.log(result);
                        res.send({
                            "response": "Success",
                            "result": result,
                            "errorMsg": "Fetched Request Successfully"
                        });
                    }
                });
        } else {
            res.send({
                "response": "Failed",
                "result": [],
                "errorMsg": "Fetched Request Failed"
            });
        }

    } catch (error) {
        next(error);
    }

});


router.post("/changepassword", verifyToken, (req, res, next) => {
    try {
        var updatedata = req.body;
        var login_id = updatedata.login_id;
        var newpass = updatedata.password;
        var emailto = updatedata.login_email;

        bcrypt.hash(newpass, 10, function (err, hashresult) {
            console.log("Password:" + newpass + ", Hashed Value: " + hashresult);
            if (true) {

                connection.query("update tbl_login set login_password=? where login_id=?", [hashresult, login_id], function (err, result) {

                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to Update Password"
                        });
                    }
                    else {

                        const message = {
                            from: 'kcbsinfo@gmail.com', // Sender address
                            to: emailto,         // recipients
                            subject: 'Password Change Notification', // Subject line
                            text: 'Your Password Has Been Changed to: ' + newpass + 'Successfully' // Plain text body
                        };
                        transport.sendMail(message, function (err, info) {
                            if (err) {
                                console.log(err)
                            } else {
                                res.send({
                                    "response": "Success",
                                    "result": [],
                                    "errorMsg": "Password Updated Successfully"
                                });
                                console.log('Email has sent successfully.');
                                console.log(info);
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

router.post("/changeusername", verifyToken, (req, res, next) => {
    try {
        var updatedata = req.body;
        var login_id = updatedata.login_id;
        var newusername = updatedata.username;
        var emailto = updatedata.login_email;

        connection.query("update tbl_login set login_username=? where login_id=?", [newusername, login_id], function (err, result) {

            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed to Update Username"
                });
            }
            else {

                const message = {
                    from: 'kcbsinfo@gmail.com', // Sender address
                    to: emailto,         // recipients
                    subject: 'Username Change Notification', // Subject line
                    text: 'Your Username Has Been Changed to :' + newusername + ' Successfully' // Plain text body
                };
                transport.sendMail(message, function (err, info) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.send({
                            "response": "Success",
                            "result": [],
                            "errorMsg": "Username Updated Successfully"
                        });
                        console.log('Email has sent successfully.');
                        console.log(info);
                    }
                });

            }
        });
    }
    catch (error) {
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
        }
    });
}

// router.use(verifyToken);

module.exports = router;