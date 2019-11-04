const mongoose = require('mongoose');

const PodcastEpisodeSchema = mongoose.Schema({
    title: {type: String, index: true},
    author: {type: String, index: true},
    podcast: {type: String, required: true, index: true},
    artwork: {
        height: Number,
        width: Number,
        url: String
    },
    pubDate: Date,
    media: {
        url: String,
        fileType: String,
        duration: Number,
        length: String,
    },
    description: String,
}, {collection : 'PodcastEpisode'});

let PodcastEpisodeModel = mongoose.model('PodcastEpisode', PodcastEpisodeSchema);

PodcastEpisodeModel.getAll = () => {
    return PodcastEpisodeModel.find({});
}

PodcastEpisodeModel.addPodcastEpisode = (podcastEpisodeToAdd) => {
    return podcastEpisodeToAdd.save();
}

PodcastEpisodeModel.removePodcastEpisode = (PodcastEpisodeTitle) => {
    return PodcastEpisodeModel.remove({title: PodcastEpisodeTitle});
}

module.exports = PodcastEpisodeModel;
