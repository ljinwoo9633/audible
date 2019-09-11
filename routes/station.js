if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Audio = require('../models/Audio');
const mongoose = require('mongoose');


const conn = mongoose.createConnection(process.env.MONGODB_URL);

let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//Create Storage Engine
const storage = new GridFsStorage({
    url: process.env.MONGODB_URL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err){
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            })
        })
    }
})

const upload = multer({storage});

/* gridfs install */

const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const User = require('../models/User');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];



router.get('/',ensureAuthenticated ,async (req, res) =>{
    const my_profile = await User.findOne({_id: req.user._id});
    const my_id = my_profile._id;
    const my_name = req.user.name;
    Audio.find({author: my_id}).then((audios) => {
        /*
        let my_audios = [];
        let my_audios_titles = [];
        let i = 0;
        while(i < audios.length){
            my_audios_titles.push(audios[i].title);
            my_audios.push(audios[i].source);
            i = i + 1;
        }
        */

        res.render('station/index', {audios: audios, url_part: req.headers.host, protocol: req.protocol, my_name: my_name});
    })
    
})

router.get('/upload', ensureAuthenticated,(req, res) => {
    res.render('station/upload');
})

router.post('/upload', upload.single('file'), (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if(!files || files.length === 0){
            return res.status(404).json({
                err: 'No Files Exists'
            })
        }
        const newAudio = new Audio({
            title: req.body.title,
            description: req.body.description,
            author: req.user._id,
            source: files[files.length - 1]
        })

        saveCover(newAudio, req.body.cover);

        newAudio.save().then(async (audio) => {
            await User.findOne({_id: req.user._id}).then((me) => {

                me.my_audios.push(newAudio);
                
                me.save().then(() => {
                    res.redirect('/station')
                })
            })
        })
        
    })
})

//save Cover
function saveCover(audio, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        audio.coverImage = new Buffer.from(cover.data, 'base64');
        audio.coverImageType = cover.type;
    }
}


router.delete('/audio/:id',async (req, res) => {
    const audio = await Audio.findOne({source: req.params.id});
    const audio_id = audio._id;
    const my_profile = await User.findOne({_id: req.user._id});

    const my_profile_audios = my_profile.my_audios; //array
    //my_profile에서 삭제

    let i = 0;
    while(i < my_profile_audios.length){
        if(String(my_profile_audios[i]) === String(audio_id)){
            break;
        }
        i = i + 1;
    }

    my_profile_audios.splice(i, 1);
    
    User.findOne({_id: req.user._id}).then((user) => {
        user.my_audios = my_profile_audios;
        user.save()
    })

    //gfs, Audio 삭제

    gfs.remove({_id: req.params.id, root: 'uploads'}, async(err, gridStore) => {
        if(err){
            return res.status(404).json({err: err});
        }

        try{
            await Audio.findOne({source: req.params.id}).remove();
            res.redirect('/');
        }catch(err){
            console.log(err);
        }
    })
    
})


//admin 일 경우만 들어가고 나머지는 /station 으로 redirect 처리하기 

router.get('/audio/:id', ensureAuthenticated, (req, res) => {
    Audio.find({source: req.params.id})
    .then((mongo_file) => {
        gfs.files.findOne({_id: mongo_file[0].source}, (err, file) => {
            if(!file || file.length === 0){
                return res.status(404).json({
                    err: 'No File Exist'
                })
            }
    
            //Check If Audio
            if(file.contentType === 'audio/mp3'){
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            }else{
                res.status(404).json({
                    err: 'Not An Audio'
                })
            }
        })
    })
})



module.exports = router;