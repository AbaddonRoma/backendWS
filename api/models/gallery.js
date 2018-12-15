const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: {
        type: String,
        required: true,
        enum: ['Wedding', 'LoveStory', 'NightClub', 'Nude', 'Test', 'Test1']
    },
    album: {type: String, required: true},
});

module.exports = mongoose.model('Album', albumSchema);