// modules =================================================
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var flash = require("connect-flash");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var session = require("express-session");

// configuration ===========================================

// config files
var db = require("./config/db");
var port = process.env.PORT || 4010; // set our port
mongoose.connect(db.url, {
  useMongoClient: true
}); // connect to our mongoDB database

require("./config/passport")(passport); // pass passport for configuration

app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride("X-HTTP-Method-Override")); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users

// required for passport
app.use(session({ secret: "slippysolderpasteengine" })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//models  ==================================================
var Article = require("./app/models/Article");

// routes ==================================================
require("./app/apiroutes")(app, Article, passport);

// start app ===============================================
app.listen(port);
console.log("Magic happens on port " + port); // shoutout to the user
exports = module.exports = app; //expose app

require("dotenv").config();
