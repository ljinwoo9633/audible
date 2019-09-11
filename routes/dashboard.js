const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

const User = require('../models/User');
const Audio = require('../models/Audio');



router.get('/', ensureAuthenticated , async(req, res) => {
    const my_profile = await User.findOne({_id: req.user._id}).exec();
    const my_upload_audios = my_profile.upload_audios;
    Audio.find({_id: my_upload_audios}).then((audios) => {
        res.render('dashboard/index', {audios: audios, url_part: req.headers.host, protocol: req.protocol})
    })
})





module.exports = router;