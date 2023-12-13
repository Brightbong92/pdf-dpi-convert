const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const PDFImage = require("pdf-image").PDFImage;

async function changeDPI(inputPDFPath, outputPDFPath, newDPI) {
  // Load the PDF
  const pdfDoc = await PDFDocument.load(fs.readFileSync(inputPDFPath));

  // Extract images
  const imageExtractor = new PDFImage(inputPDFPath, {
    convertOptions: {
      "-units": "PixelsPerInch",
      "-density": newDPI,
    },
  });

  const totalPages = pdfDoc.getPageCount();

  const images = [];
  for (let i = 0; i < totalPages; i++) {
    const imagePath = await imageExtractor.convertPage(i);
    const imageBytes = fs.readFileSync(imagePath);
    const e = await pdfDoc.embedPng(imageBytes);
    images.push(e);
  }

  images.forEach((image, index) => {
    pdfDoc.removePage(index); // Remove the existing page
    const newPage = pdfDoc.insertPage(index, [image.width, image.height]); // Insert new page
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  });

  // Save the modified PDF
  const modifiedPDFBytes = await pdfDoc.save();
  fs.writeFileSync(outputPDFPath, modifiedPDFBytes);
}

const inputPDFPath = "input1.pdf";
const outputPDFPath = "output1.pdf";
const newDPI = "600";

changeDPI(inputPDFPath, outputPDFPath, newDPI)
  .then(() => {
    console.log("PDF DPI 변경 및 저장완료!");
  })
  .catch((error) => {
    console.error("Error:", error);
  });
