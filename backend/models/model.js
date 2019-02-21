import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Model = new Schema({
    name: String,
    page_id: String,
    archi: String,
    data_file: String,
    train_res_img: Buffer,
    classes_data: JSON,
    is_saved: Boolean
    
});


export default mongoose.model('Model', Model);