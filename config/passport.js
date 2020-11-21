var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var configAuth = require('./auth');
var User = require('../app/models/user');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    // LOCAL SIGNUP 
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true 
        },
        function (req, email, password, done) {
            process.nextTick(function () {

                // Tìm user theo email
                // chúng ta kiểm tra xem user đã tồn tại hay không
                User.findOne({'local.email': email}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        // Nếu chưa user nào sử dụng email này
                        // tạo mới user
                        var newUser = new User();

                        // lưu thông tin cho tài khoản local
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        // lưu user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            })
        }));
    // LOCAL LOGIN 
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) { 
        User.findOne({'local.email': email}, function (err, user) {
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); 
            // all is well, return successful user
            return done(null, user);
        });
    }));

     // FACEBOOK 
    passport.use(new FacebookStrategy({

        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id','displayName','email','first_name','last_name','middle_name']
    },
    // Facebook sẽ gửi lại chuối token và thông tin profile của user
    function (token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            // tìm trong db xem có user nào đã sử dụng facebook id này chưa
            User.findOne({'facebook.id': profile.id}, function (err, user) {
                if (err)
                    return done(err);
                // Nếu tìm thấy user, cho họ đăng nhập
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // nếu chưa có, tạo mới user
                    var newUser = new User();
                    // lưu các thông tin cho user
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = token;
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; 
                    newUser.facebook.email = profile.emails[0].value; // fb có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
                    // lưu vào db
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        // nếu thành công, trả lại user
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    // GOOGLE 
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
    },
    function (token, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({'google.id': profile.id}, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();
                    // set all of the relevant information
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email
                    // save the user
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
    
};