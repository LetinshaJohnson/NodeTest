const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
const connection = require('../config/ConnectionClass');
const { group } = require('console');
// const { verifyToken } = require('./auth');

const router = express.Router();


router.post("/add_event", (req, res, next) => {
    try {

        var calendar_data = req.body;
        console.log(calendar_data);
        var dem = calendar_data.days;
        var event_id = calendar_data.event_id;
        var user_id = calendar_data.user_id;
        var title = calendar_data.title;
        var category = calendar_data.category;
        var mode = calendar_data.category;
        var classN = calendar_data.classN;
        var startDate = calendar_data.startDate;
        var endDate = calendar_data.endDate;
        var details = calendar_data.details;
        var stSplit = startDate.split(", ", 3);
        var sttm = stSplit[1];
        var ndSplit = endDate.split(", ", 3);
        var ndtm = ndSplit[1];
        var stdt = new Date(startDate);
        var stdt2 = new Date(startDate);
        var nddt = new Date(stdt);
        nddt.setDate(stdt.getDate() + 90);
        console.log(dem);
        if (category == "work")
            classN = "fc-event-success"
        else if (category == "personal")
            classN = "fc-event-warning"
        else if (category == "important")
            classN = "fc-event-danger"
        else if (category == "travel")
            classN = "fc-event-primary"
        else if (category == "friends")
            classN = "fc-event-info"
        else
            classN = "nothing";
        connection.query("insert into events(id,title,startDt,endDt,mode,classN,category,details) values (?,?,?,?,?,?,?,?)", [user_id, title, stdt, nddt, mode, classN, category, details], function (err, result) {
            if (err) {
                console.log("Error in inserting into events: " + err);
                res.send({
                    "response": "Failed",
                    "result": err,
                    "errorMsg": "Can't Fetch ID"
                });
            } else {
                var event_id = result.insertId;
                for (var i = 0; i < 90; i++) {
                    var dateIndex = stdt2.getDay();
                    console.log(dateIndex);

                    Object.keys(dem).forEach(function (key) {
                        if (dem[key] == dateIndex) {
                            console.log("dateIndex");
                            connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, stdt2, stSplit[1], ndSplit[1]], function (err, result) {
                                if (err) {
                                    console.log("Error in inserting into schedule: " + err);
                                }
                                else {
                                    //stdt2.setDate(stdt2.getDate()+1);
                                }
                            });
                        }
                    });
                    stdt2.setDate(stdt2.getDate() + 1);
                }
                res.send({
                    "response": "Success",
                    "result": [],
                    "errorMsg": "Event Added Successfully"
                });
                // switch (mode) {
                //     case "Weekly":
                //         for (var i = 0; i < 7; i++) {
                //             var dateIndex = stdt2.getDay();
                //             console.log(dateIndex);

                //             Object.keys(dem).forEach(function (key) {
                //                 if (dem[key] == dateIndex) {
                //                     connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, stdt2, stSplit[1], ndSplit[1]], function (err, result) {
                //                         if (err) {
                //                             console.log("Error in inserting into schedule: " + err);
                //                         }
                //                         else {
                //                             //stdt2.setDate(stdt2.getDate()+1);
                //                         }
                //                     });
                //                 }
                //             });
                //             stdt2.setDate(stdt2.getDate()+7);
                //         }
                //     case "Daily":
                //         for (var i = 0; i < 30; i++) {
                //             connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, stdt2, stSplit[1], ndSplit[1]], function (err, result) {
                //                 if (err) {
                //                     console.log("Error in inserting into schedule: " + err);
                //                 }
                //                 else {
                //                     //stdt2.setDate(stdt2.getDate()+1);
                //                 }
                //             });
                //             stdt2.setDate(stdt2.getDate()+1);
                //         }
                //     case "Monthly":
                //         var timeDifference = Math.floor(nddt.getTime() - stdt.getTime());
                //         let differentDays = Math.floor(timeDifference / (1000 * 3600 * 24));

                //             for (var i = 0; i < 3; i++) {
                //                 Object.keys(dem).forEach(function (key) {
                //                     if (dem[key] == dateIndex) {
                //                         connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, stdt2, stSplit[1], ndSplit[1]], function (err, result) {
                //                             if (err) {
                //                                 console.log("Error in inserting into schedule: " + err);
                //                             }
                //                             else {
                //                                 stdt2.setDate(stdt2.getDate()+1);
                //                             }
                //                         });
                //                     }
                //                 });
                //                 stdt2.setMonth(stdt2.getMonth()+1);
                //                 console.log(stdt2);
                //             }
                // }
            }
        });
        
        // var timeDifference = Math.floor(nddt.getTime() - stdt.getTime());
        // let differentDays = Math.floor(timeDifference / (1000 * 3600 * 24));

        // var qry = connection.query("insert into events(id,title,startDt,endDt,mode,classN,category,details) values (?,?,?,?,?,?,?,?)", [user_id, title, stdt, nddt, mode, classN, category, details], function (err, result) {
        //     if (err) {
        //         console.log("Error in inserting into events: " + err);
        //         res.send({
        //             "response": "Failed",
        //             "result": err,
        //             "errorMsg": "Can't Fetch ID"
        //         });
        //     }
        //     else {
        //         var chk = true;
        //         var event_id = result.insertId;
        //         // console.log(stdt);
        //         // console.log(nddt.getDate() + 1);
        //         var inc = new Date();
        //         inc.setDate(stdt.getDate());
        //         if (stSplit[0] == ndSplit[0]) {
        //             var pre = dateFormat(stSplit[0], "yyyy-mm-dd");
        //             connection.query("select * from schedule where event_id=? and issuedDt=?", [event_id, pre], function (err, result) {
        //                 console.log(result.length);
        //                 if (result && result.length) {
        //                     console.log("Already Exists ");
        //                 }
        //                 else {
        //                     connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, pre, stSplit[1], ndSplit[1]], function (err, result) {
        //                         if (err) {
        //                             console.log("Error in inserting into schedule: " + err);
        //                         }
        //                         else {
        //                             //
        //                         }
        //                     });
        //                 }
        //             });
        //             stdt.setDate(inc.getDate());
        //         } else {
        //             var pre = dateFormat(stSplit[0], "yyyy-mm-dd");
        //             var n = 1;
        //             if (differentDays >= 0) {
        //                 while (n != 0) {
        //                     inc = new Date(stdt);
        //                     var timeDifference2 = Math.floor(nddt.getTime() - inc.getTime());
        //                     let differentDays2 = Math.floor(timeDifference2 / (1000 * 3600 * 24));
        //                     if (differentDays2 > -1) {
        //                         if (mode == "Weekly") {
        //                             console.log("Hii");
        //                             Object.keys(dem).forEach(function (key) {
        //                                 var row = dem[key];
        //                                 console.log(row);
        //                                 var j = 7;
        //                                 var timeDifference3;
        //                                 while (j != 0) {
        //                                     // var prevMonday = new Date();
        //                                     // prevMonday.setDate((stdt.getDate()) + (stdt.getDay() + row) % 7);

        //                                     var dayOfWeek = row;//friday
        //                                     var date = new Date(stdt);
        //                                     var diff = date.getDay() - dayOfWeek;
        //                                     if (diff > 0) {
        //                                         date.setDate(date.getDate() + 6);
        //                                     }
        //                                     else if (diff < 0) {
        //                                         date.setDate(date.getDate() + ((-1) * diff))
        //                                     }

        //                                     console.log("date1");
        //                                     console.log(date);
        //                                     timeDifference3 = Math.floor(nddt.getTime() - date.getTime());
        //                                     console.log("TmD: " + timeDifference3);
        //                                     let differentDays3 = Math.floor(timeDifference3 / (1000 * 3600 * 24));
        //                                     console.log("DyD: " + differentDays3);

        //                                     if (differentDays3 >= -1) {
        //                                         // var pre = new Date(prevMonday);
        //                                         var pre = dateFormat(date, "yyyy-mm-dd");
        //                                         var query = connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, pre, stSplit[1], ndSplit[1]], function (err1, result1) {
        //                                             console.log(result1);
        //                                             if (err1) {
        //                                                 console.log("Error in inserting into schedule: " + err);
        //                                                 j = 0;
        //                                                 n = 0;
        //                                             }
        //                                             else {
        //                                                 date.setDate(date.getDate() + 1);
        //                                                 stdt = new Date(date);
        //                                                 console.log("date2");
        //                                                 console.log(stdt);
        //                                                 j++;
        //                                             }
        //                                         });
        //                                         console.log(query.sql);
        //                                     } else {
        //                                         j = 0;
        //                                         n = 0;
        //                                     }
        //                                     // prevMonday.setDate(stdt.getDate() + 7);
        //                                 }

        //                             });
        //                             n = 0;
        //                             //inc.setDate(prevMonday.getDate());
        //                         } else {
        //                             var pre = dateFormat(inc, "yyyy-mm-dd");
        //                             connection.query("insert into schedule(event_id,issuedDt,issuedTmf,issuedTmt) values (?,?,?,?)", [event_id, pre, stSplit[1], ndSplit[1]], function (err, result) {
        //                                 if (err) {
        //                                     console.log("Error in inserting into schedule: " + err);
        //                                     chk = false;
        //                                 }
        //                                 else {
        //                                     //
        //                                 }
        //                             });
        //                             if (mode == "Daily") {
        //                                 console.log(mode);
        //                                 stdt.setDate(stdt.getDate() + 1);
        //                             } else if (mode == "Monthly") {
        //                                 stdt.setMonth(stdt.getMonth() + 1);
        //                             } else if (mode == "Yearly") {
        //                                 stdt.setFullYear(stdt.getFullYear() + 1);
        //                             } else if (mode == "None") {
        //                                 inc.setDate(nddt.getDate());
        //                                 n = 0;
        //                             } else {
        //                                 n = 0;
        //                             }
        //                         }
        //                     } else {
        //                         n = 0;
        //                     }
        //                 }
        //             }
        //         }
        //         if (chk) {
        //             res.send({
        //                 "response": "Success",
        //                 "result": [],
        //                 "errorMsg": "Insertion Success"
        //             });
        //         }
        //     }
        // });
        // console.log(qry);

    } catch (Error) {
        next(error);
    }
});


router.post("/get_all", (req, res, next) => {
    try {
        var calendar_data = req.body;
        var user_id = calendar_data.user_id;
        var query = connection.query("select * from events e inner join schedule s on e.event_id=s.event_id where e.id=?", [user_id], function (err, result) {
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
        console.log(query.sql);

    } catch (error) {
        next(error);
    }
});

router.post("/get_one", verifyToken, (req, res, next) => {
    try {
        var schedule_id = req.body.schedule_id;

        connection.query("select * from events e inner join schedule s on e.event_id=s.event_id where s.schedule_id=?", [schedule_id], function (err, result) {
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

router.post("/update_event", (req, res, next) => {
    try {
        var calendar_data = req.body;
        console.log(calendar_data);
        var dem = calendar_data.days;
        var event_id = calendar_data.event_id;
        var schedule_id = calendar_data.id;
        var title = calendar_data.title;
        var category = calendar_data.category;
        var mode = calendar_data.category;
        var classN = calendar_data.classN;
        var startDate = calendar_data.startDate;
        var endDate = calendar_data.endDate;
        var details = calendar_data.details;
        var stSplit = startDate.split(", ", 3);
        var sttm = stSplit[1];
        var ndSplit = endDate.split(", ", 3);
        var ndtm = ndSplit[1];
        var stdt = new Date(startDate);
        var nddt = new Date(endDate);
        if (category == "work")
            classN = "fc-event-success"
        else if (category == "personal")
            classN = "fc-event-warning"
        else if (category == "important")
            classN = "fc-event-danger"
        else if (category == "travel")
            classN = "fc-event-primary"
        else if (category == "friends")
            classN = "fc-event-info"
        else
            classN = "nothing";
        connection.query("update events set title=? ,classN=?,category=?,details=? where event_id=?",
            [title, classN, category, details, event_id], function (err, result) {
                if (err) {
                    res.send({
                        "response": "Failed",
                        "result": [],
                        "errorMsg": err
                    });
                }
                else {
                    var qry=connection.query("update schedule set issuedDt=? ,issuedTmf=?, issuedTmt=? where schedule_id=?",
                        [stdt, stSplit[1], ndSplit[1], schedule_id], function (err, result) {
                            if (err) {
                                res.send({
                                    "response": "Failed",
                                    "result": [],
                                    "errorMsg": err
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
                        console.log(qry);
                }
            });
            
    } catch (error) {
        next(error);
    }
});


router.post("/delete_event", (req, res, next) => {
    try {
        var dist_data = req.body;
        console.log(dist_data);
        var schedule_id = dist_data.id;

        var qry=connection.query("delete from schedule where schedule_id=?", [schedule_id], function (err, result) {
            if (err) {
                res.send({
                    "response": "Failed",
                    "result": [],
                    "errorMsg": "Failed to Delete event"
                });
            }
            else {

                res.send({
                    "response": "Success",
                    "result": [],
                    "errorMsg": "Event Deleted Successfully"
                });

            }
        });
        console.log(qry.sql)

    } catch (error) {
        next(error);
    }
});

//Middleware Concept
function verifyToken(req, res, next) {
    let authHeader = req.headers.authorization;
    console.log(req.headers.authorization);
    if (authHeader == undefined) {
        res.status(401).send({
            "response": "Failed",
            "result": "Authorization Failed",
            "errorMsg": "No Token Provided 401"
        });
    }
    let token = authHeader.split(" ").pop();
    jwt.verify(token, "time-schedule", function (err, decoded) {
        if (err) {
            res.status(500).send({
                "response": "Failed",
                "result": "Authorization Failed",
                "errorMsg": "No Token Provided 500"
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
