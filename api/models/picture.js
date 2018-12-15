const mongoose = require('mongoose');

const pictureSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    albumId: {type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true},
    picture: {type: String}
});

module.exports = mongoose.model('Picture', pictureSchema);