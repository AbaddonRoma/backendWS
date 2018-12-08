const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const Gallery = require('../models/gallery');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname);
        // cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 50 
    // },
    // fileFilter: fileFilter
});


router.get('/getImages', (req, res, next) => {
    Gallery.find()
        .select('_id album pictureName picture')
        .exec()
        .then(pic => {
            const pictures = {
                count: pic.length,
                pictures: pic.map(data => {
                    let img;
                    let arr;
                    if (data.picture) {
                        arr = data.picture.split("\\");
                        img = arr[0] + '/' + arr[1];
                    }
                    return {
                        _id: data._id,
                        album: data.album,
                        pictureName: data.pictureName,
                        picture: img
                    }
                })
            };
            // res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.status(200).json(pictures);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});
// checkAuth  after /route
router.post('/addImage', upload.array('picture', 10), (req, res, next) => {
    console.log(req.files);
    // res.status(200).json({
    //     files: req
    // });
    let response = null;
    let error = null;
    req.files.forEach(file => {
        const picture = new Gallery({
            _id: new mongoose.Types.ObjectId(),
            // pictureName: req.body.pictureName,
            album: req.body.album,
            picture: file.path
        });

        picture.save()
            .then(pic => {
                // res.status(200).json({
                //     message: 'Picture has been successfully posted',
                //     picture: pic
                // })
            })
            .catch(err => {
                error = err;
                // res.status(500).json({
                //     error: err
                // })
            })
    });
    if(error) {
        res.status(500).json({
            error: err
        })
    } else {
        res.status(200).json({
            message: 'Picture has been successfully posted'
        })
    }


});

router.delete('/:imageId', (req, res, next) => {
    const id = req.params.imageId;
    Gallery.remove({_id: id})
        .exec()
        .then(pic => {
            res.status(200).json({
                message: 'Image has been successfully deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});


module.exports = router;