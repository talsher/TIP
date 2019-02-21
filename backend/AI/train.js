const fs = require('fs');
const tmp = require('tmp');
const child_process = require('child_process');

// Train the model and return result graph
function TrainModel(img, xml, archi, modelFileLocation, pretrain_words) {
    let img_name = `${tmp.tmpNameSync()}.jpg`;
    let xml_name = `${tmp.tmpNameSync()}.xml`;
    let words_json_file = `${tmp.tmpNameSync()}.json`;
    fs.writeFileSync(img_name, img);
    fs.writeFileSync(xml_name, xml);
    fs.writeFileSync(words_json_file, JSON.stringify(pretrain_words));
    console.log(words_json_file)
    let stdout = "";
    
    let pyPromise = new Promise(function(success, nosuccess) {
        try {
            const pythonProcess = child_process.spawn('python3',["script.py", archi, img_name, xml_name, modelFileLocation, words_json_file]);

            pythonProcess.stdout.on('data', function(data) {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.log(data.toString());
            });

            pythonProcess.on('close', (exitCode) => {
                if(exitCode == 0){
                    console.log(`end with result ${stdout}`)
                    success(stdout);
                } else{
                    nosuccess(`failed with result ${stdout}`);
                }
            });
        } catch (error) {
            nosuccess(error);
        }
    });

    return pyPromise;


    return {
        res: "training..."
    };
}

module.exports = TrainModel;