const mongoose = require('mongoose');

const PodcastSchema = mongoose.Schema({
    name: {type: String, index: true},
    author: {type: String, index: true},
    url: {type: String, required: true, unique: true, index: true},
    artwork: {
        width: Number, 
        height: Number,
        url: String 
      },
    contentRating: String,
    description: String,
    genreNames: [String],
}, {collection : 'Podcast'});

let PodcastModel = mongoose.model('Podcast', PodcastSchema);

PodcastModel.getAll = () => {
    return PodcastModel.find({});
}

PodcastModel.addPodcast = (podcastToAdd) => {
    return podcastToAdd.save();
}

PodcastModel.removePodcast = (podcastName) => {
    return PodcastModel.remove({name: podcastName});
}

module.exports = PodcastModel;