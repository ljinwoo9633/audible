const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const Audio = require('../models/Audio');
const User = require('../models/User');

router.get('/', async (req, res) => {
    let audio_query = Audio.find();
    let user_query = User.find();
    if(req.query.search != null && req.query.search != ''){
        audio_query = audio_query.regex('title', new RegExp(req.query.search, 'i'));
        user_query = user_query.regex('name', new RegExp(req.query.search, 'i'));
    }

    try{
        let searched_audios = await audio_query.sort({createdAt: 'desc'}).exec();
        let searched_users = await user_query.sort({follower_number: 'desc'}).exec();

        
        const users_total = await User.find().exec();
        const audios_total = await Audio.find().exec();

        
        res.render('search/index', {
            searched_audios: searched_audios,
            searched_users: searched_users,
            searchOptions: req.query
        })
    }catch(err){
        console.log(err);
        res.redirect('/dashboard');
    }
})

module.exports = router;