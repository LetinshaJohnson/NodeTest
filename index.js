const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const router = express.Router();

const connection = require('./config/ConnectionClass');


const authRoutes = require('./api/auth');
const userRoutes = require('./api/user');
const demoRoutes = require('./api/demo');
const calendarRoutes = require('./api/calendar');
const changePasswordRoutes=require('./api/changepassword');
const forgetPasswordRoutes=require('./api/forgetpassword');


const randtoken = require('rand-token');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cors = require('cors');

const refreshTokens = {};
const SECRET = 'VERY_SECRET_KEY!';
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
};

const app = express();
app.use(morgan('short'));
app.use(bodyParser.json());  //Accept JSON Params
app.use(bodyParser.urlencoded({ extended: true }));  //Accept URL Encoded Params
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());


app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/demo', demoRoutes);
app.use('/calendar', calendarRoutes);
app.use('/changepassword',changePasswordRoutes);
app.use('/forgetpassword',forgetPasswordRoutes);

module.exports = router;

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Allow-Headers", "content-type","Authorization");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");


});

app.use((err, req, res, next) => {
  return  res.status(err.status || 500)
    res.send({
        "Response": "Error",
        "Result": err.message,
        "Error": "Error Occured"
    });
});



app.listen(8000, () => {
    console.log("Server is up and Listening to Port 8000..")

});
