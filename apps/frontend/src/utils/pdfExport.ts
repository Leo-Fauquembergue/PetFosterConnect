import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface ExportToPDFOptions {
  elementId: string;
  fileName: string;
  logoUrl?: string;
  qrCodeUrl?: string;
  excludeClass?: string;
}

/**
 * Utility to export an HTML element to a PDF file with optional logo and QR code.
 */
export const exportElementToPDF = async ({
  elementId,
  fileName,
  logoUrl,
  qrCodeUrl,
  excludeClass = "no-print",
}: ExportToPDFOptions) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  // 1. Add Logo if provided
  if (logoUrl) {
    const logoWidth = 40;
    const logoX = (pageWidth - logoWidth) / 2;
    // We assume PNG for simplicity, could be enhanced
    pdf.addImage(logoUrl, "PNG", logoX, 10, logoWidth, 40);
  }

  // 2. Hide excluded elements
  const excludedElements = document.querySelectorAll(`.${excludeClass}`);
  excludedElements.forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

  try {
    // 3. Capture element to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // 4. Restore excluded elements
    excludedElements.forEach((el) => {
      (el as HTMLElement).style.display = "";
    });

    // 5. Add QR Code if provided
    if (qrCodeUrl) {
      const qrData = await QRCode.toDataURL(qrCodeUrl);
      pdf.addImage(qrData, "PNG", pageWidth - 40 - 10, 250, 40, 40);
    }

    // 6. Add Captured Image to PDF
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth * 0.9;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;

    // Position it below the logo (starts at 60mm)
    pdf.addImage(imgData, "PNG", x, 60, imgWidth, imgHeight);

    // 7. Save the PDF
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Ensure elements are restored even on error
    excludedElements.forEach((el) => {
      (el as HTMLElement).style.display = "";
    });
  }
};
