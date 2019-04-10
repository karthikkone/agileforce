const fs = require('fs');

module.exports = {
    createZipFrom: function(base64String,saveToFile) {
        return new Promise((resolve,reject) => {
            if (saveToFile && base64String) {
                var buf = Buffer.from(base64String,'base64');
                fs.writeFile(saveToFile, buf, 'binary', (err)=>{
                    reject(err);
                });
                //file read succesfully resolve full path of written zipfile
                console.log(`${saveToFile} saved succesfully`);
                resolve(saveToFile);
            } else {
                console.log(`failed to write file ${saveToFile}`);
                reject(new Error('missing file path or base64 string'));
            }
        });
    },

    readZipFrom: function(zipfileLocation, encformat='base64') {
        return new Promise((resolve, reject) => {
            if (zipfileLocation) {
                var zip;
                fs.readFile(zipfileLocation, (err,data) => {
                    if (!err) {
                        console.log(`file at ${zipfileLocation} read succesfully`);
                        resolve(Buffer.from(data,'binary').toString(encformat));
                    } else {
                        console.log(`failed to read file at ${zipfileLocation}`);
                        reject(err);
                    }
                });
            } else {
                reject(new Error('missing file path to read zip file'));
            }
        });
    }
}