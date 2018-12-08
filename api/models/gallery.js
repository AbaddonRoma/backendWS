const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  // pictureName: {type: String, required: true},
  album: {
    type: String,
    required: true,
    enum: ['Wedding', 'LoveStory', 'NightClub', 'Nude', 'Test', 'Test1']
  },
  picture: {type: String}
});

module.exports = mongoose.model('Gallery', gallerySchema);