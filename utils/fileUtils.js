const File = require('../models/fileModel');

const checkIfFileExists  = async(fileName)=>{
    return await File.findOne({fileName});
}

module.exports = {
    checkIfFileExists
}