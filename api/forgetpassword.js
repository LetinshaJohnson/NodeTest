const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const validate = require('validatorjs');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
const connection = require('../config/ConnectionClass');
const randomstring = require('randomstring');

const router = express.Router();

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kcbsinfo@gmail.com",
        pass: "kcbsinfo@123"
    }
});


router.post("/requestusernamepassword", (req, res) => {

    var userdata = req.body;
    var login_email = userdata.login_email;
    var request = userdata.request;
    var login_id = "";
    var role_id = "";

        connection.query("select login_username,login_password,login_id,role_id from tbl_login where login_email=?", [login_email], function (err, result) {

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
                    role_id=rowrole.role_id;

                });

                connection.query("insert into tbl_requests(login_id,request,lastmodified_on,role_id) values(?,?,CURRENT_DATE(),?)", [login_id, request,role_id], function (err, result) {
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
    
});


router.post("/passwordchangeotp", (req, res) => {

    var changeData = req.body;
    var login_email = changeData.login_email;
    var login_id = "";
    var emailto = changeData.login_email;
    var toid = "";

    //getting email id

    connection.query("select login_id,login_email from tbl_login where login_email=?", [login_email],
        function (err, result) {

            if (err) {
                res.send({
                    "response": "Failed",
                    "result": err,
                    "errorMsg": "Failed to fetch request"
                });
            }
            else if (result && result.length) {

                Object.keys(result).forEach(function (key) {
                    var rowrole = result[key];

                    emailto = rowrole.login_email;
                    login_id = rowrole.login_id;

                });

                var ran = randomstring.generate({
                    length: 6,
                    charset: 'numeric'
                });
                //  var ran=1000;
                connection.query("select * from tbl_passwordotp where login_id=?", [login_id], function (err, result) {
                    if (err) {
                        res.send({
                            "response": "Failed",
                            "result": [],
                            "errorMsg": "Failed to fetch request"
                        });
                    }
                    else if (result && result.length) {

                        connection.query("update tbl_passwordotp set otp=?,otp_time=CURRENT_TIMESTAMP() WHERE login_id=?", [ran, login_id], function (err, result) {
                            if (err) {
                                res.send({
                                    "response": "Failed",
                                    "result": [],
                                    "errorMsg": "Failed to fetch request"
                                });
                            }

                            else {
                                const message = {
                                    from: 'kcbsinfo@gmail.com', // Sender address
                                    to: emailto,         // recipients
                                    subject: 'Verification OTP', // Subject line
                                    text: 'Your OTP for Changing Password:' + ran // Plain text body
                                };
                                transport.sendMail(message, function (err, info) {
                                    if (err) {
                                        console.log(err)
                                    } else {

                                        connection.query("select * from tbl_passwordotp where login_id=?", [login_id], function (err, result) {
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
                                                    "errorMsg": "Successfully OTP sent to your Registered Email"
                                                });
                                            }
                                        });


                                        console.log('Email has sent successfully.');
                                        console.log(info);
                                    }
                                });

                            }
                        });

                    }
                    else {
                        connection.query("INSERT INTO tbl_passwordotp(login_id,otp,otp_time)VALUES(?,?,CURRENT_TIMESTAMP())", [login_id, ran], function (err, result) {
                            if (err) {
                                console.log("Error:" + err);
                                res.send({
                                    "response": "Failed",
                                    "result": [],
                                    "errorMsg": "Failed to fetch request"
                                });
                            }

                            else {

                                const message = {
                                    from: 'kcbsinfo@gmail.com', // Sender address
                                    to: emailto,         // recipients
                                    subject: 'Verification OTP', // Subject line
                                    text: 'Your OTP for Changing Password:' + ran // Plain text body
                                };
                                transport.sendMail(message, function (err, info) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        connection.query("select * from tbl_passwordotp where login_id=?", [id], function (err, result) {
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
                                                    "errorMsg": "Successfully OTP sent to your Registered Email"
                                                });
                                            }
                                        });

                                        console.log('Email has sent successfully.');
                                        console.log(info);
                                    }
                                });

                            }
                        });

                    }
                });

            }
            else {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Entered Email Does not Exist"
                });
            }
        });


});


router.post("/forgetpassword", (req, res) => {
    try {
        var updatedata = req.body;
        var login_id = updatedata.login_id;
        var emailto= updatedata.login_email;
        var newpass = updatedata.password;

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
                            text: 'Your Password Has Been Changed to:' + newpass + 'Successfully' // Plain text body
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


router.post("/forgetusername", (req, res) => {
    try {
        var updatedata = req.body;
        var login_id = updatedata.login_id;
        var newusername = updatedata.username;
        var emailto=updatedata.login_email;

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


module.exports = router;