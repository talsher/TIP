const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let ModelScheme = new Schema({
    name: String,
    page_id: String,
    archi: String,
    data_file: String,
    train_res_img: Buffer,
    classes_data: JSON,
    is_saved: Boolean
    
});


module.exports =  mongoose.model('Model', ModelScheme);