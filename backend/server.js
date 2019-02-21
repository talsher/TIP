const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Page = require('./models/page');
const Model = require('./models/model');
const TrainModel = require('./AI/train');


const app = express();
const router = express.Router();

const upload = multer({ dest: 'tmp/' }).fields(
    [
    { name: 'image', maxCount: 1 },
    { name: 'xml', maxCount: 1 }
  ]);

const archi_list = ["vgg16", "vgg19"]

app.use(cors());
app.use(bodyParser.json());

//mongoose.connect('mongodb://192.168.56.101:27017/pages');
mongoose.connect('mongodb://132.72.23.63:3011/pages');

const db_connection = mongoose.connection;

db_connection.once('open', () => {
    console.log('conected to db')
});

// view all pages by names
router.route('/pages').get((req, res) => {
    Page.find({}, {__v:false, img:false, xml:false}, (err, pages) => {
        if (err)
            console.log(err);
        else {
            res.json(pages);
        }
    });
});

router.route('/view/img/:id').get((req, res) => {
    
    Page.findById(req.params.id, (err, page) => {
        if(err)
            console.log(err);
        else {
            res.contentType('image/jpeg');
            res.send(page.img); 
        }
    });
});

router.route('/model/img/:id').get((req, res) => {
    
    Model.findById(req.params.id, (err, model) => {
        if(err)
            console.log(err);
        else {
            res.contentType('image/jpeg');
            res.send(model.train_res_img); 
        }
    });
});




// view a single page
router.route('/view/:id').get((req, res) => {
    Page.findById(req.params.id, (err, page) => {
        if (err)
            console.log(err);
        else{
            Model.find({is_saved: true}, {__v:false, page_name:false, data_file:false, classes_data:false}, (err, models) => {
                //console.log("models found: " + models);
                let res_json = {
                    name: page.name,
                    models: models,
                    archi_list: archi_list
                };
                res.json(res_json);
            });
        }
    });
});

router.route('/model/insert').post((req, res) => {

    let model = new Model(req.body);

    model.save()
            .then(page => {
                res.status(200).json({result: 'added!'});
            })
            .catch(err => {
                res.status(400).send('failed!');
            });
});

router.route('/model/save').post((req, res) => {
    Model.findById(req.body.model_id, (err, model) => {
        if(err) {
            res.status(500).send(err);
        }
        else {
            if (!model){
                res.status(400).send('model not found');
            } else {
                model.name = req.body.model_name;
                model.is_saved = true;
                model.save()
                .then((page) => {
                    console.log("model saved");
                    res.status(200).json({res: "saved successfully"});
                })
                .catch((err) => {
                    console.log("error save model");
                    console.log(err);
                    res.status(400).send(`failed! ${err}`);
                });
            }
        }
    });
});

router.route('/model/discard').post((req, res) => {
    Model.findById(req.body.model_id, (err, model) => {
        if(err){
            res.status(500).send(err);
        } else {
            if(!model) {
                res.status(400).send('model not found');
            } else {
                fs.unlinkSync(model.data_file);
                model.remove()
                .then((model) => {
                    console.log("model demoved");
                    res.status(200).json({res: "discard successfully"});
                })
                .catch((err) => {
                    console.log("error removing model");
                    console.log(err);
                    res.status(400).send(`failed! ${err}`);
                });
                
            }
        }
    
        
    });

});

router.route('/train').post((req, res) => {
    console.log("training");
    req.setTimeout(0);
    let page_id = req.body.page_id;
    let name = req.body.model_name;
    let archi = req.body.archi;
    Model.findOne({name: name, archi: archi}, (err, model) => {
        if (err)
            console.log(err);
        else{
            Page.findById(page_id, (err, page) => {
                if(err)
                    console.log(err);
                else {
                    let train_model_file, pretrain_words;
                    if (model){
                        train_model_file = model.data_file;
                        pretrain_words = model.classes_data;
                    }
                    else {
                        train_model_file = "";
                        pretrain_words = []
                    }
                    
                    //console.log("training: ", page.img, page.xml, archi, "");
                    TrainModel(page.img, page.xml, archi, train_model_file, pretrain_words)
                    .then((script_res) => {
                        console.log("success");
                        console.log(script_res);
                        let res_arr = script_res.split('\n');
                        console.log(res_arr);
                        let model_path = `AI/models/${res_arr[0]}`; 
                        let img = fs.readFileSync(`AI/data/${res_arr[1]}`);
                        let classes_data = JSON.parse(fs.readFileSync(`AI/data/${res_arr[2]}`));

                        // save the model until the user decide what to do with it
                        let model = new Model({
                            name: "tmp",
                            page_id: page_id,
                            archi: archi,
                            data_file: model_path,
                            train_res_img: img,
                            classes_data: classes_data,
                            is_saved: false
                        });

                        model.save()
                                .then(page => {
                                    console.log("model saved");
                                    res.status(200).json({model_id: model._id});
                                })
                                .catch(err => {
                                    console.log("error save model");
                                    console.log(err);
                                    res.status(400).send('internal server error while training image');
                                });

                    })
                    .catch((data) => {
                        console.log("error!");
                        console.log(data);
                        res.status(400).send(`internal server error while training image`);
                    });                    
                }
            });
        }
    });
});


router.route('/insert').post(upload, (req, res) => {
    let img_path =  req.files.image[0].path;
    let xml_path = req.files.xml[0].path;
    let page_json = {
        name: req.body.name,
        img: fs.readFileSync(img_path),
        xml: fs.readFileSync(xml_path)
    }
    let page = new Page(page_json);

    page.save()
            .then(page => {
                res.status(200).json({result: 'added!'});
            })
            .catch(err => {
                res.status(400).send('failed!');
            });
});

app.use('/', router);
app.listen(4000, () => console.log('Server running on 4000'))