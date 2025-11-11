// utils/generateCertificate.js
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function generateCertificate(registrationData) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Page size: A4 portrait (612 x 792 points)
  const page = pdfDoc.addPage([612, 792]);

  // Colors
  const blackColor = rgb(0, 0, 0);
  const grayColor = rgb(0.5, 0.5, 0.5);
  const greenColor = rgb(0.2, 0.6, 0.2); // Green for title
  const yellowColor = rgb(1, 0.85, 0);   // Yellow for fill bars

  // --- HEADER ---
  // Left: "BAGONG PILIPINAS" (small, top-left)
  page.drawText("BAGONG PILIPINAS", {
    x: 80,
    y: 750,
    size: 8,
    font: helveticaFont,
    color: grayColor,
  });

  // Center Header Text
  const headerText1 = "REPUBLIC OF THE PHILIPPINES";
  const headerText2 = "DEPARTMENT OF AGRICULTURE";
  const headerText3 = "PHILIPPINE COCONUT AUTHORITY";
  const headerText4 = "Elliptical Road, Diliman, Quezon City 1101 Philippines";

  let yHeader = 740;
  page.drawText(headerText1, {
    x: (page.getWidth() - helveticaFont.widthOfTextAtSize(headerText1, 10)) / 2,
    y: yHeader,
    size: 10,
    font: helveticaFont,
    color: blackColor,
  });
  yHeader -= 10;

  page.drawText(headerText2, {
    x: (page.getWidth() - helveticaFont.widthOfTextAtSize(headerText2, 12)) / 2,
    y: yHeader,
    size: 12,
    font: helveticaFont,
    color: blackColor,
  });
  yHeader -= 12;

  page.drawText(headerText3, {
    x: (page.getWidth() - helveticaBoldFont.widthOfTextAtSize(headerText3, 16)) / 2,
    y: yHeader,
    size: 16,
    font: helveticaBoldFont,
    color: blackColor,
  });
  yHeader -= 12;

  page.drawText(headerText4, {
    x: (page.getWidth() - helveticaFont.widthOfTextAtSize(headerText4, 10)) / 2,
    y: yHeader,
    size: 10,
    font: helveticaFont,
    color: grayColor,
  });

  // Right: "DEPARTMENT OF AGRICULTURE" (small, top-right)
  page.drawText("DEPARTMENT OF AGRICULTURE", {
    x: 480,
    y: 750,
    size: 8,
    font: helveticaFont,
    color: grayColor,
  });

  // Draw horizontal line under header
  page.drawLine({
    start: { x: 80, y: yHeader - 5 },
    end: { x: 532, y: yHeader - 5 },
    thickness: 1,
    color: blackColor,
  });

  // --- MAIN TITLE ---
  const mainTitle = "CERTIFICATE OF REGISTRATION";
  const titleFontSize = 48; // Large, bold, green
  const titleWidth = helveticaBoldFont.widthOfTextAtSize(mainTitle, titleFontSize);
  const titleX = (page.getWidth() - titleWidth) / 2;
  const titleY = yHeader - 40;

  page.drawText(mainTitle, {
    x: titleX,
    y: titleY,
    size: titleFontSize,
    font: helveticaBoldFont,
    color: greenColor,
  });

  // Subtitle: "This is to certify that"
  const subtitle = "This is to certify that";
  const subtitleFontSize = 12;
  const subtitleWidth = helveticaFont.widthOfTextAtSize(subtitle, subtitleFontSize);
  const subtitleX = (page.getWidth() - subtitleWidth) / 2;
  const subtitleY = titleY - 40;

  page.drawText(subtitle, {
    x: subtitleX,
    y: subtitleY,
    size: subtitleFontSize,
    font: helveticaFont,
    color: blackColor,
  });

  // --- YELLOW FILL BARS ---
  let currentY = subtitleY - 50;
  const barHeight = 20;
  const barWidth = 480;
  const barX = (page.getWidth() - barWidth) / 2;

  // Bar 1: Name of Company
  page.drawRectangle({
    x: barX,
    y: currentY,
    width: barWidth,
    height: barHeight,
    color: yellowColor,
  });

  // Center text vertically in bar
  const companyName = `"${registrationData.registeredbusinessname}"`;
  const companyNameWidth = helveticaFont.widthOfTextAtSize(companyName, 12);
  const companyNameX = barX + (barWidth - companyNameWidth) / 2;
  const companyNameY = currentY + 5; // Vertical centering

  page.drawText(companyName, {
    x: companyNameX,
    y: companyNameY,
    size: 12,
    font: helveticaFont,
    color: blackColor,
  });

  page.drawText("(Name of Company)", {
    x: barX + 10,
    y: currentY - 10,
    size: 8,
    font: helveticaObliqueFont,
    color: grayColor,
  });

  currentY -= 40;

  // Bar 2: Business Address
  page.drawRectangle({
    x: barX,
    y: currentY,
    width: barWidth,
    height: barHeight,
    color: yellowColor,
  });

  const businessAddress = registrationData.officeaddress || "Not specified";
  const businessAddressWidth = helveticaFont.widthOfTextAtSize(businessAddress, 12);
  const businessAddressX = barX + (barWidth - businessAddressWidth) / 2;
  const businessAddressY = currentY + 5;

  page.drawText(businessAddress, {
    x: businessAddressX,
    y: businessAddressY,
    size: 12,
    font: helveticaFont,
    color: blackColor,
  });

  page.drawText("(Business Address)", {
    x: barX + 10,
    y: currentY - 10,
    size: 8,
    font: helveticaObliqueFont,
    color: grayColor,
  });

  currentY -= 60;

  // Body Text (Legal Authorization Statement)
  const bodyText = "is duly registered with PCA and is hereby authorized to operate pursuant to the Implementing Rules and Regulations of Republic Act No. 8048, as amended by Republic Act No. 10593 as";
  const bodyLines = wrapText(bodyText, helveticaFont, 10, 480);
  let bodyY = currentY;

  for (let line of bodyLines) {
    page.drawText(line, {
      x: 100,
      y: bodyY,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
    bodyY -= 14;
  }

  currentY = bodyY - 20;

  // Bar 3: Business Activity
  page.drawRectangle({
    x: barX,
    y: currentY,
    width: barWidth,
    height: barHeight,
    color: yellowColor,
  });

  const businessActivity = registrationData.natureofbusiness || "Not specified";
  const businessActivityWidth = helveticaFont.widthOfTextAtSize(businessActivity, 12);
  const businessActivityX = barX + (barWidth - businessActivityWidth) / 2;
  const businessActivityY = currentY + 5;

  page.drawText(businessActivity, {
    x: businessActivityX,
    y: businessActivityY,
    size: 12,
    font: helveticaFont,
    color: blackColor,
  });

  page.drawText("(Business Activity)", {
    x: barX + 10,
    y: currentY - 10,
    size: 8,
    font: helveticaObliqueFont,
    color: grayColor,
  });

  currentY -= 40;

  // Bar 4: Tools and Equipment
  page.drawRectangle({
    x: barX,
    y: currentY,
    width: barWidth,
    height: barHeight,
    color: yellowColor,
  });

  const toolsAndEquipment = registrationData.toolsAndEquipment || "Not specified in application";
  const toolsAndEquipmentWidth = helveticaFont.widthOfTextAtSize(toolsAndEquipment, 12);
  const toolsAndEquipmentX = barX + (barWidth - toolsAndEquipmentWidth) / 2;
  const toolsAndEquipmentY = currentY + 5;

  page.drawText(toolsAndEquipment, {
    x: toolsAndEquipmentX,
    y: toolsAndEquipmentY,
    size: 12,
    font: helveticaFont,
    color: blackColor,
  });

  page.drawText("(Tools and Equipment)", {
    x: barX + 10,
    y: currentY - 10,
    size: 8,
    font: helveticaObliqueFont,
    color: grayColor,
  });

  currentY -= 60;

  // --- CERTIFICATE NO. AND DATE ISSUED ---
  const certNoLabel = "Certificate No.";
  const certNoValue = "1000505"; // Replace with dynamic logic if needed
  const dateIssuedLabel = "Date Issued:";

  const certNoLabelWidth = helveticaBoldFont.widthOfTextAtSize(certNoLabel, 12);
  const certNoValueWidth = helveticaBoldFont.widthOfTextAtSize(certNoValue, 14);
  const dateIssuedLabelWidth = helveticaBoldFont.widthOfTextAtSize(dateIssuedLabel, 12);

  const certNoX = 100;
  const certNoY = currentY;
  const dateIssuedX = certNoX + certNoLabelWidth + 20 + certNoValueWidth + 20;

  // Certificate No. Label + Value
  page.drawText(certNoLabel, {
    x: certNoX,
    y: certNoY,
    size: 12,
    font: helveticaBoldFont,
    color: blackColor,
  });

  page.drawText(certNoValue, {
    x: certNoX + certNoLabelWidth + 10,
    y: certNoY,
    size: 14,
    font: helveticaBoldFont,
    color: blackColor,
  });

  // Date Issued Label
  page.drawText(dateIssuedLabel, {
    x: dateIssuedX,
    y: certNoY,
    size: 12,
    font: helveticaBoldFont,
    color: blackColor,
  });

  // Date Issued Line + Value
  const dateLineY = certNoY - 15;
  const dateLineWidth = 200;
  page.drawLine({
    start: { x: dateIssuedX, y: dateLineY },
    end: { x: dateIssuedX + dateLineWidth, y: dateLineY },
    thickness: 1,
    color: blackColor,
  });

  const formattedDate = new Date(registrationData.dateRegistration).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  page.drawText(formattedDate, {
    x: dateIssuedX + 5,
    y: dateLineY - 5,
    size: 10,
    font: helveticaFont,
    color: blackColor,
  });

  currentY -= 50;

  // --- FOOTER DISCLAIMER ---
  const footerText1 = "This certificate is effective up to January 15, ________ only.";
  const footerText2 = "Not valid without PCA dry seal";
  const footerNoteSize = 10;

  page.drawText(footerText1, {
    x: 100,
    y: currentY,
    size: footerNoteSize,
    font: helveticaFont,
    color: blackColor,
  });

  page.drawText(footerText2, {
    x: 100,
    y: currentY - 15,
    size: footerNoteSize,
    font: helveticaFont,
    color: blackColor,
  });

  // Official Dry Seal Note (bottom left)
  page.drawText("OFFICIAL DRY SEAL", {
    x: 80,
    y: 50,
    size: 8,
    font: helveticaObliqueFont,
    color: grayColor,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

// Helper: Wrap text to fit within maxWidth
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = generateCertificate;