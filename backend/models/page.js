const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var PageScheme = new Schema({
    name: String,
    img: Buffer,
    xml: Buffer
    
});

var Page = mongoose.model('Page', PageScheme);
module.exports = Page;