const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const Album = require('../models/gallery');
const Picture = require('../models/picture');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname);
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
    limits: {
        fileSize: 1024 * 1024 * 50
    },
    fileFilter: fileFilter
});

router.post('/addAlbum', (req, res, next) => {
    Album.find({album: req.body.album, category: req.body.category})
        .exec()
        .then(data => {
            if (!data.length) {
                const newAlbum = new Album({
                    _id: new mongoose.Types.ObjectId(),
                    category: req.body.category,
                    album: req.body.album
                });
                newAlbum.save()
                    .then(data => {
                        res.status(200).json({
                            message: 'Album has been created',
                            album: {
                                id: data._id,
                                category: data.category,
                                album: data.album
                            }
                        })
                    })
                    .catch(err => {
                        error = err;
                        res.status(500).json({
                            error: err
                        })
                    })
            } else {
                console.log('data: ', data);
                res.status(200).json({
                    created: false,
                    message: 'Sorry this album is already exists please add another name',
                    data: data.length
                })
            }
        });

});

router.get('/getAlbums', (req, res, next) => {
    Album.find()
        .select('_id category album')
        .exec()
        .then(result => {
            const album = {
                count: result.length,
                albums: result.map(data => {
                    return {
                        _id: data._id,
                        category: data.category,
                        album: data.album
                    }
                }),
            };
            res.status(200).json(album);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.get('/getAlbumsByCategory/:category', (req, res, next) => {
    const category = req.params.category;
    Album.find({category: category})
        .select('_id category album')
        .exec()
        .then(result => {
            const album = {
                count: result.length,
                albums: result.map(data => {
                    return {
                        _id: data._id,
                        category: data.category,
                        album: data.album
                    }
                }),
            };
            res.status(200).json(album);
        })

});

router.post('/addPictures', upload.array('picture', 10), (req, res, next) => {
    console.log(req.files);
    let response = null;
    let error = null;
    req.files.forEach(file => {
        const picture = new Picture({
            _id: new mongoose.Types.ObjectId(),
            albumId: req.body.album,
            picture: file.path
        });
        picture.save()
            .then(pic => {
                response = pic
            })
            .catch(err => {
                error = err;
            })
    });
    if (error) {
        res.status(500).json({
            error: err
        })
    } else {
        res.status(200).json({
            message: 'Pictures has been successfully posted',
        })
    }
});

router.get('/getPictures', (req, res, next) => {
    Picture.find()
        .select('_id albumId picture')
        .populate('albumId', '_id category album')
        .exec()
        .then(result => {
            const picture = {
                count: result.length,
                category: result.map(data => {
                    const arr = data.picture.split('\\');
                    const picture = arr[0] + '/' + arr[1];
                    return {
                        _id: data._id,
                        picture: picture,
                        album: data.albumId
                    }
                }),
            };
            res.status(200).json(picture);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.get('/getPicturesByAlbum/:albumId/', (req, res, next) => {
    const albumId = req.params.albumId;
    Picture.find({albumId: albumId})
        .select('_id albumId picture')
        .populate('albumId', '_id category album')
        .exec()
        .then(result => {
            const picture = {
                count: result.length,
                category: result.map(data => {
                    const arr = data.picture.split('\\');
                    const picture = arr[0] + '/' + arr[1];
                    return {
                        _id: data._id,
                        picture: picture,
                        album: data.albumId
                    }
                }),
            };
            res.status(200).json(picture);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});


router.delete('/picture/:pictureId', (req, res, next) => {
    const pictureId = req.params.pictureId;
    console.log(pictureId);
    Picture.remove({_id: pictureId})
        .exec()
        .then(pic => {
            console.log('FOUND ID');
            console.log(pic);
            res.status(200).json({
                message: 'Album has been successfully deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.delete('/album/:albumId', (req, res, next) => {
    const albumId = req.params.albumId;
    console.log(albumId);
    Album.remove({_id: albumId})
        .exec()
        .then(pic => {
            console.log('FOUND ID');
            console.log(pic);
            res.status(200).json({
                message: 'Album has been successfully deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;