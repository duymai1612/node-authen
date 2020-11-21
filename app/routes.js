module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // Xử lý thông tin khi có người đăng nhập
    app.post('/login', passport.authenticate("local-login", {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // Xử lý thông tin khi có người đăng ký
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', 
        failureRedirect: '/signup', 
        failureFlash: true 
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // FACEBOOK ROUTES 

    // yêu cầu xác thực bằng facebook
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

    // xử lý sau khi user cho phép xác thực với facebook
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
         successRedirect: '/profile',
            failureRedirect: '/'
        }));
};

//Route middleware check user log in?
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

