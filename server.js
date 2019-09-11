if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

const app = express();

require('./config/passport')(passport);

//Get Routes
const indexRouter = require('./routes/index');
const dashboardRouter = require('./routes/dashboard');
const stationRouter = require('./routes/station');
const searchRouter = require('./routes/search');
const detailRouter = require('./routes/detail');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', (err) => console.error(err));
db.once('open', () => console.log('Connected To Mongoose'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(methodOverride('_method'));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Express Session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
)

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', indexRouter);
app.use('/dashboard' ,dashboardRouter);
app.use('/station', stationRouter);
app.use('/search', searchRouter);
app.use('/detail', detailRouter);

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});