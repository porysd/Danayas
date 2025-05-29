import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Optional: adjust path or use a base64 image
import logoImage from "../Admin/assets/drevslogo.png"; // or base64 string

export function exportToPDF(
  data,
  columns,
  totalRevenue,
  title = "Transaction Report"
) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  const logoWidth = 15;
  const logoHeight = 15;

  doc.addImage(logoImage, "PNG", 14, 10, logoWidth, logoHeight);

  doc.setFontSize(18);
  doc.text(title, centerX, 20, { align: "center" });

  // Table
  const tableY = 30;
  autoTable(doc, {
    startY: tableY,
    head: [columns],
    body: data.map((row) => columns.map((key) => row[key])),
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [25, 77, 29],
    },
    didDrawPage: (data) => {
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(
        `Page ${page}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // Total Revenue row
  const finalY = doc.lastAutoTable.finalY || tableY + 10;
  doc.setFontSize(12);
  doc.text(`Total Revenue: ₱${totalRevenue.toLocaleString()}`, 14, finalY + 10);

  doc.save("transaction_report.pdf");
}
