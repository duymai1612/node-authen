var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');


// connect to db
mongoose.connect(configDB.url);

require('./config/passport')(passport);

// cài đặt express
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

//cài đặt passport
app.use(session({secret: 'lifeisbeautiful'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require('./app/routes.js') (app, passport);

//launch
app.listen(port);
console.log('The magic happens on port ' + port);