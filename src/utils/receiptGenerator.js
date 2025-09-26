// receiptGenerator.js - Utility for generating downloadable receipts

// Load image helper function
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const generateReceiptImage = (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size (A4-like proportions)
      canvas.width = 800;
      canvas.height = 1000;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Company branding section
      ctx.fillStyle = "#F3B921"; // Boosty Yellow
      ctx.fillRect(0, 0, canvas.width, 80);

      // Load and draw logo
      try {
        const logo = await loadImage("/boosty_logo.svg");
        const logoHeight = 50;
        const logoWidth = (logo.width * logoHeight) / logo.height;
        ctx.drawImage(logo, 50, 15, logoWidth, logoHeight);
      } catch (logoError) {
        console.log("Logo not found, using text fallback");
      }

      // Company name
      ctx.fillStyle = "#202D2D";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("BOOSTY", canvas.width / 2, 50);

      let yPos = 120;

      // Order title
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Order #${orderDetails.orderNumber}`, 50, yPos);

      yPos += 50;

      // Pricing section
      ctx.fillStyle = "#3D3E3E";
      ctx.font = "16px Arial";

      const pricingItems = [
        {
          label: "Items + installation:",
          value: `₦${pricing.subtotal.toLocaleString()}`,
        },
        {
          label: "Total before tax:",
          value: `₦${pricing.subtotal.toLocaleString()}`,
        },
        { label: "Tax (7.5%):", value: `₦${pricing.vat.toLocaleString()}` },
      ];

      pricingItems.forEach((item) => {
        ctx.fillText(item.label, 50, yPos);
        ctx.textAlign = "right";
        ctx.fillText(item.value, canvas.width - 50, yPos);
        ctx.textAlign = "left";
        yPos += 25;
      });

      // Line separator
      ctx.strokeStyle = "#E5E5E5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, yPos + 10);
      ctx.lineTo(canvas.width - 50, yPos + 10);
      ctx.stroke();

      yPos += 35;

      // Order total
      ctx.fillStyle = "#C42424";
      ctx.font = "bold 18px Arial";
      ctx.fillText("Order Total:", 50, yPos);
      ctx.textAlign = "right";
      ctx.fillText(
        `₦${pricing.totalAmount.toLocaleString()}`,
        canvas.width - 50,
        yPos
      );
      ctx.textAlign = "left";

      yPos += 50;

      // Company address
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Boosty Solar", 50, yPos);
      yPos += 25;

      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";
      const address = userAddress
        ? userAddress.fullAddress ||
          `${userAddress.street}, ${userAddress.city}, ${userAddress.state}, ${userAddress.country}`
        : "888 Abundance Rd, Ikeja, Lagos, 11222";
      ctx.fillText(address, 50, yPos);

      yPos += 50;

      // Order details in two columns
      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";

      // Left column
      ctx.fillText("Date created:", 50, yPos);
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 14px Arial";
      ctx.fillText(orderDetails.dateCreated, 50, yPos + 20);

      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";
      ctx.fillText("Date initiated:", 50, yPos + 50);
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 14px Arial";
      ctx.fillText(orderDetails.dateInitiated, 50, yPos + 70);

      // Right column
      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";
      ctx.fillText("Invoice number:", 400, yPos);
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 14px Arial";
      ctx.fillText(orderDetails.invoiceNumber, 400, yPos + 20);

      yPos += 120;

      // Components section
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 18px Arial";
      ctx.fillText("System Components:", 50, yPos);
      yPos += 30;

      const components = [
        {
          name: recommendation.components.inverter.name,
          qty: recommendation.components.inverter.quantity,
          warranty: recommendation.components.inverter.warranty,
        },
        {
          name: recommendation.components.battery.name,
          qty: recommendation.components.battery.quantity,
          warranty: recommendation.components.battery.warranty,
        },
        {
          name: recommendation.components.solarPanels.name,
          qty: recommendation.components.solarPanels.quantity,
          warranty: recommendation.components.solarPanels.warranty,
        },
      ];

      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";

      components.forEach((component) => {
        ctx.font = "bold 14px Arial";
        ctx.fillText(`${component.qty}x ${component.name}`, 50, yPos);
        yPos += 20;
        ctx.font = "12px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(component.warranty, 70, yPos);
        ctx.fillStyle = "#3D3E3E";
        yPos += 25;
      });

      yPos += 20;

      // Installation details
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Installation Details:", 50, yPos);
      yPos += 25;

      ctx.fillStyle = "#3D3E3E";
      ctx.font = "14px Arial";
      ctx.fillText(
        "• Installation timeline: 1-2 weeks (subject to change)",
        50,
        yPos
      );
      yPos += 20;
      ctx.fillText(
        "• Final schedule will be discussed by assigned specialist",
        50,
        yPos
      );
      yPos += 20;
      ctx.fillText("• Installation dates will be sent to your email", 50, yPos);

      yPos += 40;

      // Terms section
      ctx.fillStyle = "#2B2D2C";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Terms & Conditions:", 50, yPos);
      yPos += 25;

      ctx.fillStyle = "#666666";
      ctx.font = "12px Arial";
      const terms = [
        "• All prices include installation and VAT",
        "• Warranty terms apply as specified for each component",
        "• Installation subject to site survey and accessibility",
        "• Payment terms and conditions apply as agreed",
        "• Customer support: contact@boostysolar.com",
      ];

      terms.forEach((term) => {
        ctx.fillText(term, 50, yPos);
        yPos += 18;
      });

      // Convert canvas to blob and resolve
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate receipt image"));
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
};

// Generate PDF using jsPDF (install with: npm install jspdf)
export const generateReceiptPDF = async (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  try {
    // Check if jsPDF is available
    const jsPDF = await import("jspdf")
      .then((module) => module.jsPDF)
      .catch(() => null);

    if (!jsPDF) {
      console.warn("jsPDF not installed. Run: npm install jspdf");
      return null;
    }

    const doc = new jsPDF();

    // Set font
    doc.setFont("helvetica");

    // Company header
    doc.setFillColor(243, 185, 33); // Boosty Yellow
    doc.rect(0, 0, 210, 25, "F");

    // Company name
    doc.setFontSize(22);
    doc.setTextColor(32, 45, 45);
    doc.text("BOOSTY SOLAR", 105, 16, { align: "center" });

    let yPos = 40;

    // Order title
    doc.setFontSize(18);
    doc.setTextColor(43, 45, 44);
    doc.text(`Order #${orderDetails.orderNumber}`, 20, yPos);

    yPos += 20;

    // Pricing section
    doc.setFontSize(12);
    doc.setTextColor(61, 62, 62);

    const pricingItems = [
      {
        label: "Items + installation:",
        value: `₦${pricing.subtotal.toLocaleString()}`,
      },
      {
        label: "Total before tax:",
        value: `₦${pricing.subtotal.toLocaleString()}`,
      },
      { label: "Tax (7.5%):", value: `₦${pricing.vat.toLocaleString()}` },
    ];

    pricingItems.forEach((item) => {
      doc.text(item.label, 20, yPos);
      doc.text(item.value, 190, yPos, { align: "right" });
      yPos += 8;
    });

    // Line
    doc.line(20, yPos + 3, 190, yPos + 3);
    yPos += 10;

    // Order total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Total:", 20, yPos);
    doc.text(`₦${pricing.totalAmount.toLocaleString()}`, 190, yPos, {
      align: "right",
    });

    yPos += 20;

    // Company details
    doc.setFont("helvetica", "bold");
    doc.text("Boosty Solar", 20, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const address = userAddress
      ? userAddress.fullAddress ||
        `${userAddress.street}, ${userAddress.city}, ${userAddress.state}, ${userAddress.country}`
      : "888 Abundance Rd, Ikeja, Lagos, 11222";
    doc.text(address, 20, yPos);

    yPos += 20;

    // Order details
    doc.setFontSize(10);
    doc.text("Date created:", 20, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(orderDetails.dateCreated, 20, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.text("Invoice number:", 105, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(orderDetails.invoiceNumber, 105, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.text("Date initiated:", 20, yPos + 15);
    doc.setFont("helvetica", "bold");
    doc.text(orderDetails.dateInitiated, 20, yPos + 21);

    yPos += 35;

    // Components
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("System Components:", 20, yPos);
    yPos += 10;

    const components = [
      {
        name: recommendation.components.inverter.name,
        qty: recommendation.components.inverter.quantity,
        warranty: recommendation.components.inverter.warranty,
      },
      {
        name: recommendation.components.battery.name,
        qty: recommendation.components.battery.quantity,
        warranty: recommendation.components.battery.warranty,
      },
      {
        name: recommendation.components.solarPanels.name,
        qty: recommendation.components.solarPanels.quantity,
        warranty: recommendation.components.solarPanels.warranty,
      },
    ];

    doc.setFontSize(11);
    components.forEach((component) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${component.qty}x ${component.name}`, 25, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(component.warranty, 30, yPos);
      doc.setFontSize(11);
      yPos += 8;
    });

    yPos += 8;

    // Installation details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Installation Details:", 20, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "• Installation timeline: 1-2 weeks (subject to change)",
      25,
      yPos
    );
    yPos += 6;
    doc.text(
      "• Final schedule will be discussed by assigned specialist",
      25,
      yPos
    );
    yPos += 6;
    doc.text("• Installation dates will be sent to your email", 25, yPos);

    yPos += 15;

    // Terms
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 20, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const terms = [
      "• All prices include installation and VAT",
      "• Warranty terms apply as specified for each component",
      "• Installation subject to site survey and accessibility",
      "• Payment terms and conditions apply as agreed",
      "• Customer support: contact@boostysolar.com",
    ];

    terms.forEach((term) => {
      doc.text(term, 25, yPos);
      yPos += 5;
    });

    return doc;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return null;
  }
};

export const downloadReceiptImage = async (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  try {
    console.log("🧾 Generating receipt image...");

    const blob = await generateReceiptImage(
      orderDetails,
      pricing,
      recommendation,
      userAddress
    );

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Boosty_Solar_Receipt_${orderDetails.orderNumber}.png`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);

    console.log("✅ Receipt image downloaded successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to download receipt image:", error);
    return false;
  }
};

export const downloadReceiptPDF = async (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  try {
    console.log("📄 Generating receipt PDF...");

    const doc = await generateReceiptPDF(
      orderDetails,
      pricing,
      recommendation,
      userAddress
    );

    if (doc) {
      doc.save(`Boosty_Solar_Receipt_${orderDetails.orderNumber}.pdf`);
      console.log("✅ Receipt PDF downloaded successfully");
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Failed to download receipt PDF:", error);
    return false;
  }
};

// Download both image and PDF at the same time
export const downloadBothReceipts = async (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  try {
    console.log("📦 Downloading both receipt formats...");

    // Download both simultaneously
    const [imageSuccess, pdfSuccess] = await Promise.all([
      downloadReceiptImage(orderDetails, pricing, recommendation, userAddress),
      downloadReceiptPDF(orderDetails, pricing, recommendation, userAddress),
    ]);

    if (imageSuccess && pdfSuccess) {
      console.log("✅ Both receipts downloaded successfully");
      return { success: true, image: true, pdf: true };
    } else if (imageSuccess) {
      console.log("⚠️ Image downloaded, PDF failed");
      return { success: true, image: true, pdf: false };
    } else if (pdfSuccess) {
      console.log("⚠️ PDF downloaded, Image failed");
      return { success: true, image: false, pdf: true };
    } else {
      console.log("❌ Both downloads failed");
      return { success: false, image: false, pdf: false };
    }
  } catch (error) {
    console.error("❌ Failed to download receipts:", error);
    return { success: false, image: false, pdf: false };
  }
};

// Alternative: Generate receipt as data URL for preview
export const generateReceiptDataURL = async (
  orderDetails,
  pricing,
  recommendation,
  userAddress
) => {
  try {
    const blob = await generateReceiptImage(
      orderDetails,
      pricing,
      recommendation,
      userAddress
    );
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to generate receipt preview:", error);
    return null;
  }
};
