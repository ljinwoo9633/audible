const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const Audio = require('../models/Audio');
const User = require('../models/User');

//Detail Author
router.get('/author/:id', ensureAuthenticated ,async (req, res) => {
    const detail_user = await User.findOne({_id: req.params.id}).exec();
    let i = 0;
    let checked_follow = false;
    while(i < detail_user.follower.length){
        if(String(detail_user.follower[i]) === String(req.user._id)){
            checked_follow = true;
            break;
        }
        i = i + 1;
    }
    const detail_audios = await Audio.find({author: detail_user._id}).exec();
    res.render('detail/detailAuthor', {detail_user: detail_user, me: req.user._id, checked_follow: checked_follow, detail_audios: detail_audios});
})

//Detail Author Follow
router.post('/author/follow/:id', async(req, res) => {
    try{
        User.findOne({_id: req.params.id}).then((user) => {
            user.follower_number = user.follower_number + 1;
            user.follower.push(req.user._id);
            user.save().then(() => {
                User.findOne({_id: req.user._id}).then((me) => {
                    me.follow.push(req.params.id);
                    me.save().then(() => {
                        res.redirect(`/detail/author/${req.params.id}`);
                    })
                })
            })
        })
    }catch(err){
        console.log(err);
        res.redirect('/search');
    }
})

//Detail Author Unfollow
router.post('/author/unfollow/:id', async(req, res) => {
    try{
        User.findOne({_id: req.params.id}).then((user) => {
            if(user.follower_number <= 0){
                user.follower_number = 0;
            }else{
                user.follower_number = user.follower_number - 1;
            }

            //User 안에 me 찾기
            let i = 0;
            while(i < user.follower.length){
                if(String(user.follower[i]) === String(req.user._id)){
                    break;
                }
                i = i + 1;
            }
            user.follower.splice(i,1);
            user.save().then(() => {
                User.findOne({_id: req.user._id}).then((me) => {
                    //me안에 User 찾기
                    let i = 0;
                    while(i < me.follow.length){
                        if(String(me.follow[i]) === String(req.params.id)){
                            break;
                        }
                        i = i + 1;
                    }
                    me.follow.splice(i,1);
                    me.save().then(() => {
                        res.redirect(`/detail/author/${req.params.id}`);
                    })
                })
            })
        })
    }catch(err){
        console.log(err);
        res.redirect('/search');
    }
})



//Detail Audio
router.get('/audio/:id', ensureAuthenticated , async(req, res) => {
    try{
        Audio.findOne({_id: req.params.id}).then(async(audio) => {
            audio.views = audio.views + 1;
            audio.save();
            let i = 0;
            let checked_like = false;
            while(i < audio.like.length){
                if(String(req.user._id) === String(audio.like[i])){
                    checked_like = true;
                }
                i = i + 1;
            }
            const detail_audio = await Audio.findOne({_id: req.params.id}).exec();
            const user_get_audio = await User.findOne({_id: detail_audio.author}).exec();
            const author_name = user_get_audio.name;

            res.render('detail/detailAudio', {detail_audio: detail_audio, author_name: author_name, checked_like: checked_like});
        })
    }catch(err){
        console.log(err);
        res.redirect('/search');
    }
})

//Add Audio
router.post('/audio/:id', ensureAuthenticated, async(req, res) => {
    try{
        User.findOne({_id: req.user._id}).then((me) => {
            me.upload_audios.push(req.params.id);
            me.save().then((edited_me) => {
                Audio.findOne({_id: req.params.id}).then((audio) => {
                    audio.upload_number = audio.upload_number + 1;
                    audio.save(() => {
                        res.redirect('/dashboard');
                    })
                })
            })
        })
    }catch(err){
        console.log(err);
        res.redirect('/search');
    }
});

//Like Audio
router.post('/audio/like/:id', async(req, res) => {
    try{
        Audio.findOne({_id: req.params.id}).then((audio) => {
            audio.views = audio.views - 1;
            audio.like_number = audio.like_number + 1;
            audio.like.push(req.user._id);
            audio.save().then(() => {
                User.findOne({_id: req.user._id}).then((me) => {
                    me.like.push(req.params.id);
                    me.save(() => {
                        res.redirect(`/detail/audio/${req.params.id}`);
                    })
                })
            })
        })
    }catch(err){
        console.log(err);
        res.redirect('/search');
    }
})

router.post('/audio/dislike/:id', async(req, res) => {
    try{
        Audio.findOne({_id: req.params.id}).then((audio) => {
            audio.views = audio.views - 1;
            if(audio.like_number === 0){
                audio.like_number = 0
            }else{
                audio.like_number = audio.like_number - 1;
            }
            //Audio 안에서 user 찾기
            let i = 0;
            while(i < audio.like.length){
                if(String(audio.like[i]) === String(req.user._id)){
                    break;
                }
                i = i + 1;
            }
            audio.like.splice(i, 1);
            audio.save(() => {
                User.findOne({_id: req.user._id}).then((me) => {
                    //User안에서 Audio찾기
                    let i = 0;
                    while(i < me.like.length){
                        if(String(me.like[i]) === String(req.params.id)){
                            break;
                        }
                        i = i + 1;
                    }
                    me.like.splice(i,1);
                    me.save().then(() => {
                        res.redirect(`/detail/audio/${req.params.id}`)
                    })
                })
            })
        })
    }catch(err){

    }
})

module.exports = router;