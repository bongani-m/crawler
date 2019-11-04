const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {type: String, required: true, unique: true, index: true},
    url: {type: String, required: true, unique: true, index: true},
    topPodcasts: [String]
}, {collection : 'Category'});

let CategoryModel = mongoose.model('Category', CategorySchema);

CategoryModel.getAll = () => {
    return CategoryModel.find({});
}

CategoryModel.addCategory = (categoryToAdd) => {
    return categoryToAdd.save();
}

CategoryModel.removeCategory = (categoryName) => {
    return CategoryModel.remove({name: categoryName});
}

module.exports = CategoryModel;
