const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  pdfName: { type: String, required: true },
  originalPdfName: { type: String, required: true },
});

const pdfModel = mongoose.model("Pdf", pdfSchema);
module.exports = pdfModel;
