const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const {forwardAuthenticated} = require('../config/auth');

router.get('/',forwardAuthenticated, (req, res) => {
    res.render('index/index');
});

router.get('/login',forwardAuthenticated, (req, res) => {
    res.render('index/login');
})

router.post('/login',(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: 'dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res ,next);
})


//Register Page

router.get('/register', forwardAuthenticated,(req, res) => {
    res.render('index/register');
})

router.post('/register', (req, res) => {
    const {email, name, password, password2} = req.body;

    let errors = [];
    
    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please enter all fields'});
    }

    if(password != password2){
        errors.push({msg: 'Password Do Not Match'});
    }

    if(password.length < 6){
        errors.push({msg: 'Password Must Be At Least 6 Character'});
    }

    if(errors.length > 0){
        res.render('index/register', {
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        User.findOne({email: email}).then(user => {
            if(user){
                errors.push({msg: 'Email Already Exists'});
                res.render('index/register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
                
            }else{
                const newUser = new User({
                    name,
                    email,
                    password,
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You Are Now Reigstered')
                            res.redirect('/login');
                        })
                        .catch(err => console.log(err));
                    })
                })
            }
        })
    }
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You Are Logged Out');
    res.redirect('/');
})


module.exports = router;