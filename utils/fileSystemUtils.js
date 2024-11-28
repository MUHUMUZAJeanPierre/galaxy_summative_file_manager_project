const fs = require('fs');

const deleteFileFromSystem = (filePath)=>{
    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath)
    }
}

module.exports = {
    deleteFileFromSystem
}