const fs = require('fs');
const tmp = require('tmp');
const child_process = require('child_process');
var path = require('path');

// Train the model and return result graph
function TrainModel(img, xml, archi, modelFileLocation, pretrain_words) {
    let img_name = `${tmp.tmpNameSync({dir: 'AI/data'})}.jpg`;
    let xml_name = `${tmp.tmpNameSync({dir: 'AI/data'})}.xml`;
    let words_json_file = `${tmp.tmpNameSync({dir: 'AI/data'})}.json`;
    fs.writeFileSync(img_name, img);
    fs.writeFileSync(xml_name, xml);
    fs.writeFileSync(words_json_file, JSON.stringify(pretrain_words));
    console.log(words_json_file)
    let stdout = "";
    
    let pyPromise = new Promise(function(success, nosuccess) {
        try {
            let train_command = ['exec', 'test_trainer', 'python3', "/AI/script.py", 
            archi, path.basename(img_name), path.basename(xml_name), path.basename(modelFileLocation), path.basename(words_json_file)];
            

            const pythonProcess = child_process.spawn('docker', train_command);

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