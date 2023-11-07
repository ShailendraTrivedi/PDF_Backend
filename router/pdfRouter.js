const { Router } = require("express");
const multer = require("multer");
const PDFDocument = require("pdf-lib").PDFDocument;
const fs = require("fs").promises;
const path = require("path");

const pdfModel = require("../schema/pdfSchema");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

const pdfRouter = Router();

pdfRouter.post("/upload-file", upload.single("pdfFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const newPDF = new pdfModel({
    userName: req.body.userName,
    pdfName: req.body.pdfName,
    originalPdfName: req.file.filename,
  });
  const result = await newPDF.save();
  return res.json({ message: result });
});

pdfRouter.post("/fetch-files", async (req, res) => {
  const { userName } = req.body;
  const result = await pdfModel.find({ userName });
  const resume = await pdfModel.find({ userName: "myresume@gmail.com" });
  const value = [...resume, ...result];
  return res.json({ message: value });
});

async function generatePDF(pdfName, selectedPages, originalPdfBytes) {
  try {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const newPdfDoc = await PDFDocument.create();

    for (const pageNumber of selectedPages) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
      newPdfDoc.addPage(copiedPage);
    }

    const newPdfBytes = await newPdfDoc.save();
    pdfName = `new_${Date.now()}.pdf`;

    const newPdfFilePath = path.join(__dirname, "../uploads", pdfName);
    await fs.writeFile(newPdfFilePath, newPdfBytes);

    return pdfName;
  } catch (error) {
    throw new Error("Error generating PDF");
  }
}

pdfRouter.post("/generate-pdf", async (req, res) => {
  let originalPdfPath;

  try {
    const { userName, pdfName, selectedPages } = req.body;

    originalPdfPath = path.join(__dirname, "../uploads", pdfName);

    const originalPdfBytes = await fs.readFile(originalPdfPath);

    const newPdfFileName = await generatePDF(
      pdfName,
      selectedPages,
      originalPdfBytes
    );

    const newPDF = new pdfModel({
      userName: userName,
      pdfName: `new_${pdfName}`,
      originalPdfName: `${newPdfFileName}`,
    });

    await newPDF.save();

    res.send(newPDF);
  } catch (error) {
    res.status(500).json({ error: "Error generating and storing PDF" });
  }
});

/** This is for personal use only to delete all the pdf from the database. */

// async function deleteAll(req, res) {
//   try {
//     await pdfModel.deleteMany({});
//     res.status(200).json({ message: "All PDF details deleted." });
//   } catch (error) {
//     res.status(500).json({ error: "Error deleting PDF details" });
//   }
// }
// deleteAll();

module.exports = pdfRouter;

// const { Router } = require("express");
// const multer = require("multer");
// const PDFDocument = require("pdf-lib").PDFDocument;
// const fs = require("fs").promises;
// const path = require("path");

// const pdfModel = require("../schema/pdfSchema");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// const pdfRouter = Router();

// pdfRouter.post("/upload-file", upload.single("pdfFile"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded." });
//   }
//   const newPDF = new pdfModel({
//     pdfName: req.body.pdfName,
//     originalPdfName: req.file.filename,
//   });
//   const result = await newPDF.save();
//   return res.json({ message: result });
// });

// pdfRouter.get("/fetch-files", async (req, res) => {
//   const result = await pdfModel.find({});
//   return res.json({ message: result });
// });

// async function generatePDF(pdfName, selectedPages, originalPdfBytes) {
//   try {
//     const pdfDoc = await PDFDocument.load(originalPdfBytes);
//     const newPdfDoc = await PDFDocument.create();

//     for (const pageNumber of selectedPages) {
//       const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
//       newPdfDoc.addPage(copiedPage);
//     }

//     // Serialize the new PDF document to a byte array
//     const newPdfBytes = await newPdfDoc.save();
//     pdfName = `new_${Date.now()}.pdf`
//     // Save the new PDF to a file in the "uploads" folder
//     const newPdfFilePath = path.join(
//       __dirname,
//       "../uploads",
//       `${pdfName}`
//     );
//     await fs.writeFile(newPdfFilePath, newPdfBytes);

//     return pdfName;
//   } catch (error) {
//     throw new Error("Error generating PDF");
//   }
// }

// pdfRouter.post("/generate-pdf", async (req, res) => {
//   let originalPdfPath;

//   try {
//     const { pdfName, selectedPages } = req.body;

//     originalPdfPath = path.join(__dirname, "../uploads", pdfName);

//     const originalPdfBytes = await fs.readFile(originalPdfPath);

//     const newPdfFileName = await generatePDF(
//       pdfName,
//       selectedPages,
//       originalPdfBytes
//     );

//     // Store the new PDF name in MongoDB
//     const newPDF = new pdfModel({
//       pdfName: `new_${pdfName}`, // Create a unique name for the new PDF
//       originalPdfName: `${newPdfFileName}`, // Store the path to the new PDF
//     });

//     await newPDF.save();

//     // Send the new PDF as a response
//     res.send(newPDF);
//   } catch (error) {
//     res.status(500).json({ error: "Error generating and storing PDF" });
//   }
// });

// // You might want to remove this function or protect it from public use.
// // Uncomment the line below if you want to delete all PDF details from the database.
// // const deleteAll = async (req, res) => {
// //   await pdfModel.deleteMany({});
// // };
// // deleteAll();

// module.exports = pdfRouter;
