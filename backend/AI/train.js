import {readFileSync, writeFileSync} from 'fs';
import { tmpNameSync } from 'tmp';
import { spawn } from 'child_process';

// Train the model and return result graph
function TrainModel(img, xml, archi, modelFileLocation, pretrain_words) {
    let img_name = `${tmpNameSync()}.jpg`;
    let xml_name = `${tmpNameSync()}.xml`;
    let words_json_file = `${tmpNameSync()}.json`;
    writeFileSync(img_name, img);
    writeFileSync(xml_name, xml);
    writeFileSync(words_json_file, JSON.stringify(pretrain_words));
    console.log(words_json_file)
    let stdout = "";
    
    let pyPromise = new Promise(function(success, nosuccess) {
        try {
            const pythonProcess = spawn('python3',["script.py", archi, img_name, xml_name, modelFileLocation, words_json_file]);

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

export default TrainModel;