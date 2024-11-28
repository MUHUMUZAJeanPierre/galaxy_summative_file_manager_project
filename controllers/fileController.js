const fs = require("fs");
const path = require("path");
const File = require("../models/fileModel");
const { validateFile } = require('../utils/fileValidation');
const { checkIfFileExists } = require("../utils/fileUtils");
const { deleteFileFromSystem } = require("../utils/fileSystemUtils");


const createFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }

  try {
    const { fileName } = validateFile(req.body);

    if (!fileName) {
      return res.status(400).send({ error: "fileName is required" });
    }

    const { path: filePath } = req.file;

    // const existingFile = await File.findOne({ fileName });
    const existingFile = await checkIfFileExists(fileName);
    if (existingFile) {
      return res.status(409).send({ error: "A file with the same name already exists" });
    }

    const fileData = {
      fileName,
      filePath,
    };

    const newFile = new File(fileData);
    await newFile.save();

    res.status(201).send({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: err.message });
  }
};

const readFileById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: "ID is required" });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: "File not found" });
    }

    res.send({
      message: "File retrieved by id successfully",
      file: file
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error retrieving file metadata" });
  }
};


const readFile = async (req, res) => {
  try {
    const files = await File.find();
    if (!files || files.length === 0) {
      return res.status(404).send({ error: "No files found" });
    }
    res.send({
      message: "Files retrieved successfully",
      files: files
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error retrieving files or metadata" });
  }
};

const updateFile = async (req, res) => {
  const { id } = req.params;
  const { fileName, filePath } = validateFile(req.body);

  if (!id || !fileName || !filePath) {
    return res.status(400).send({ error: "id, fileName, and filePath are required" });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: "File not found" });
    }
    file.fileName = fileName;
    file.filePath = filePath;
    file.updatedAt = new Date();

    const updatedFile = await file.save();
    res.send({
      message: "File updated successfully",
      file: updatedFile,
    });
  } catch (err) {
    console.error("Error updating file:", err.message);
    res.status(500).send({ error: "Error updating file" });
  }
};



const deleteFile = async (req, res) => {
  const { id } = req.params;


  if (!id) {
    return res.status(400).send({ error: "id is required" });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: "File metadata not found" });
    }

    // if (fs.existsSync(file.filePath)) {
    //   fs.unlinkSync(file.filePath);
    // }
    deleteFileFromSystem(file.filePath);
    
    await file.deleteOne();
    res.send({
      file: file,
      message: "File deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error deleting file or metadata" });
  }
};

module.exports = {
  createFile,
  deleteFile,
  readFile,
  updateFile,
  readFileById
};
