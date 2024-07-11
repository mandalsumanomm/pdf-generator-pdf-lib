const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs').promises;

async function generatePDF() {
  try {
    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;

    // Create a new PDF document with A4 dimensions
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); 
    const { width, height } = page.getSize();

    // Fetch the logo image
    const logoUrl = 'https://brandroute.s3.ap-south-1.amazonaws.com/christmas_2012_new_6456.jpg';
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedJpg(logoBytes);

    // Fetch the signature image
    const signatureUrl = 'https://s3-ap-south-1.amazonaws.com/brandroute/c24f1a1b-ec74-41d8-861c-fd65d09a121d.pdf';
    const signatureBytes = await fetch(signatureUrl).then(res => res.arrayBuffer());
    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    // Set up fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Define margins
    const margin = 40;
    let y = height - margin;

    // Function to draw text with specific alignment
    const drawText = (text, x, y, fontSize, font, options = {}) => {
      page.drawText(text, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: options.color || rgb(0, 0, 0),
        maxWidth: options.maxWidth || width - margin * 2,
        lineHeight: options.lineHeight || fontSize + 4,
      });
    };

    // Draw the logo at the top middle with specified size
    const logoWidth = 90;
    const logoHeight = 90;
    page.drawImage(logoImage, {
      x: (width - logoWidth) / 2,
      y: height - logoHeight - 15, 
      width: logoWidth,
      height: logoHeight,
    });

    y -= logoHeight + 10; 

    // Draw the title centered with top and bottom margin
    const title = "Registration Details";
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, 14);
    y -= 5;
    drawText(title, (width - titleWidth) / 2, y, 14, helveticaBoldFont, { color: rgb(0.2, 0.6, 0.8) });

    y -= 40; 
    

    y -= 10;

    // Draw the registration details
    const details = [
      { label: "Full Name", value: "Suman Mandal" },
      { label: "Email", value: "suman@gmail.com" },
      { label: "Describes You", value: "Artist" },
      { label: "Region", value: "India" },
      { label: "Terms Accepted", value: "true" },
      { label: "Legal Name", value: "Suman" },
      { label: "Label Name", value: "Suman Mandal" },
      { label: "Government Id", value: "Aadhar Card" },
      { label: "Government Address", value: "Aadhar Card" },
      { label: "Mobile Number", value: "8656543234" },
    ];

    const detailFontSize = 8;
    details.forEach((detail) => {
      drawText(`${detail.label}:`, margin, y, detailFontSize, helveticaBoldFont);
      drawText(detail.value, margin + 100, y, detailFontSize, helveticaFont);
      y -= detailFontSize + 6; 
    });

    // Draw a thin line before the terms section
    
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: width - margin, y: y },
      thickness: 0.5, 
      color: rgb(0.2, 0.6, 0.8),
    });

    y -= 30;

    // Draw the Terms of Service content starting from the left margin
    const termsContent = `
    ZWWLLC Digital Distribution Terms Of Service
    This Terms of Service Agreement (hereinafter the “Agreement”) is made between you, acting on your own behalf or as the legal representative for a band, group, company, corporation or label (hereinafter referred to as the “Company”) and Zojak World Wide, LLC (hereinafter referred to as “ZWWLLC”). ZWWLLC is a digital music distribution company that facilitates the offering of sound recordings to other third party distributors and digital music retailers (collectively, the “Resellers”) for the purpose of selling music downloads to consumers over the Internet. The Company hereby certifies that it owns or has the right to distribute, publish, sell, copy, transfer, convert, encode, integrate, digitally modify and deliver over the Internet all recordings provided to ZWWLLC in connection with ZWWLLC’s services (collectively, the “Content”).
    
    TERMS OF SERVICE AGREEMENT
    Company hereby grants ZWWLLC the exclusive right worldwide, during the Term, to: 1.1.1. act as the licensor and digital distributor of Company’s Content to Resellers worldwide, and authorize such Resellers to promote, sell, distribute and deliver encoded versions of the Content to individual consumers (collectively, the “Service Users”) in digital form. 1.1.2. Act as the digital asset manager of Company’s Content to YouTube worldwide, fingerprint, and monetize digital assets. 1.1.3. reproduce and convert Company’s Content into digitally encoded files in any format now known or hereafter devised, including the assignment and insertion of ISRC codes; and collect, administer and distribute proceeds from Resellers’ use of Company’s Content, in accordance with this Agreement. Associated Rights. Company hereby grants ZWWLLC the right during the Term, to authorize Resellers to perform preview clips of the Content and to use the artwork, track and/or album names associated with the Masters. Promotional Rights. Subject to Company’s consent, ZWWLLC shall have the right to repackage Company’s Content with other digital media content in the form of branded or co-branded compilations and other such forms.
    
    COMPANY’S OBLIGATIONS
    Company shall clear all rights to the Content necessary for ZWWLLC to reproduce works of the Content. Company shall notify ZWWLLC in writing of any restrictions that may apply to the sales of Company’s Content, including any territorial resale restrictions. Company shall be responsible for all royalties payable to publishers of compositions and any other royalties payable with respect to the Content.`;

    const termsFontSize = 6;
    drawText(termsContent, margin, y, termsFontSize, helveticaFont);

    // Draw a thin line before the social media section
    y -= termsFontSize * Math.ceil(termsContent.length / 80) + 20; 
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: width - margin, y: y },
      thickness: 0.5, 
      color: rgb(0.2, 0.6, 0.8),
    });

    // Draw social media profile links
    const socialTitle = "Social Media Profile Links";
    y -= 30;
    drawText(socialTitle, margin, y, 10, helveticaBoldFont, { color: rgb(0.2, 0.6, 0.8) });

    y -= 30;
    const socialLinks = [
      "YT Media",
      "Name - Suman",
      "Channel Link - YouTube"
    ];

    socialLinks.forEach((link) => {
      drawText(link, margin, y, detailFontSize, helveticaFont);
      y -= detailFontSize + 12; 
    });

    // Draw signature image above the "Creator’s Signature" text
    const signatureWidth = 50;
    const signatureHeight = 20;
    y -= 60;
    page.drawImage(signatureImage, {
      x: margin,
      y: y,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Draw signature section
    const signature = "Creator’s Signature";
    const date = "Date: 11/7/2024";
    y -= signatureHeight + 10; 
    drawText(signature, margin, y, detailFontSize, helveticaFont);
    drawText(date, width - margin - 100, y, detailFontSize, helveticaFont);

    
    const pdfBytes = await pdfDoc.save();

    
    await fs.writeFile('output.pdf', pdfBytes);

    console.log('PDF generated successfully!');
  } catch (err) {
    console.log('Error:', err);
  }
}

generatePDF();
