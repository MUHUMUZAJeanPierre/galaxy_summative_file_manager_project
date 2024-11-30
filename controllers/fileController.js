const fs = require("fs");
const path = require("path");
const File = require("../models/fileModel");
const { validateFile } = require('../utils/fileValidation');
const { checkIfFileExists } = require("../utils/fileUtils");
const { deleteFileFromSystem } = require("../utils/fileSystemUtils");

const createFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: req.t('file.errors.noFileUploaded') });
  }

  try {
    const { fileName } = validateFile(req.body);

    if (!fileName) {
      return res.status(400).send({ error: req.t('file.errors.fileNameRequired') });
    }

    const { path: filePath } = req.file;

    const existingFile = await checkIfFileExists(fileName);
    if (existingFile) {
      return res.status(409).send({ error: req.t('file.errors.fileAlreadyExists') });
    }

    const fileData = {
      fileName,
      filePath,
    };

    const newFile = new File(fileData);
    await newFile.save();

    res.status(201).send({
      message: req.t('file.success.fileUploadSuccess'),
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
    return res.status(400).send({ error: req.t('file.errors.idRequired') });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: req.t('file.errors.fileNotFound') });
    }

    res.send({
      message: req.t('file.success.fileRetrieved'),
      file: file
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: req.t('file.errors.errorRetrievingFiles') });
  }
};

const readFile = async (req, res) => {
  try {
    const files = await File.find();
    if (!files || files.length === 0) {
      return res.status(404).send({ error: req.t('file.errors.noFilesFound') });
    }
    res.send({
      message: req.t('file.success.filesRetrieved'),
      files: files
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: req.t('file.errors.errorRetrievingFiles') });
  }
};

const updateFile = async (req, res) => {
  const { id } = req.params;
  const { fileName, filePath } = validateFile(req.body);

  if (!id || !fileName || !filePath) {
    return res.status(400).send({ error: req.t('file.errors.requiredFieldsMissing') });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: req.t('file.errors.fileNotFound') });
    }
    file.fileName = fileName;
    file.filePath = filePath;
    file.updatedAt = new Date();

    const updatedFile = await file.save();
    res.send({
      message: req.t('file.success.fileUpdated'),
      file: updatedFile,
    });
  } catch (err) {
    console.error("Error updating file:", err.message);
    res.status(500).send({ error: req.t('file.errors.errorUpdatingFile') });
  }
};

const deleteFile = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: req.t('file.errors.idRequired') });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).send({ error: req.t('file.errors.fileNotFound') });
    }

    deleteFileFromSystem(file.filePath);
    
    await file.deleteOne();
    res.send({
      file: file,
      message: req.t('file.success.fileDeleted')
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: req.t('file.errors.errorDeletingFile') });
  }
};

module.exports = {
  createFile,
  deleteFile,
  readFile,
  updateFile,
  readFileById
};