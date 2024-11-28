  const mongoose = require("mongoose");

  const FileSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  });

  // module.exports = mongoose.model("File", FileSchema);
  module.exports = mongoose.models.File || mongoose.model("File", FileSchema);
