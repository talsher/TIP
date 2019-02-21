import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Page = new Schema({
    name: String,
    img: Buffer,
    xml: Buffer
    
});

export default mongoose.model('Page', Page);