import PDFDocument from 'pdfkit';

export function generateInvoicePDF(orderData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', 50, 50, { align: 'right' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice #${orderData.order_id}`, 50, 80, { align: 'right' });

      doc.text(`Date: ${new Date(orderData.created_at).toLocaleDateString()}`, 50, 95, {
        align: 'right',
      });

      // Company Info (Left Side)
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('RocketDrop', 50, 50);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Your E-Commerce Store', 50, 75)
        .text('Email: support@rocketdrop.com', 50, 90)
        .text('Website: www.rocketdrop.com', 50, 105);

      // Customer Info
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, 150);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(orderData.customer_name || 'N/A', 50, 170)
        .text(orderData.customer_email || 'N/A', 50, 185);

      // Line separator
      doc
        .moveTo(50, 220)
        .lineTo(550, 220)
        .stroke();

      // Table Header
      const tableTop = 240;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Item', 50, tableTop)
        .text('Qty', 300, tableTop)
        .text('Price', 370, tableTop)
        .text('Amount', 470, tableTop, { align: 'right' });

      // Line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table Items
      let yPosition = tableTop + 25;
      orderData.items.forEach((item) => {
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(item.product_name, 50, yPosition, { width: 240 })
          .text(item.quantity.toString(), 300, yPosition)
          .text(`$${item.price.toFixed(2)}`, 370, yPosition)
          .text(`$${(item.price * item.quantity).toFixed(2)}`, 470, yPosition, {
            align: 'right',
          });

        yPosition += 20;
      });

      // Line before totals
      yPosition += 10;
      doc
        .moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      // Totals
      yPosition += 15;
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 370, yPosition)
        .text(`$${subtotal.toFixed(2)}`, 470, yPosition, { align: 'right' });

      yPosition += 20;
      if (orderData.discount_amount > 0) {
        doc
          .text('Discount:', 370, yPosition)
          .text(`-$${orderData.discount_amount.toFixed(2)}`, 470, yPosition, {
            align: 'right',
          });
        yPosition += 20;
      }

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total:', 370, yPosition)
        .text(`$${orderData.total_amount.toFixed(2)}`, 470, yPosition, {
          align: 'right',
        });

      // Payment Info
      yPosition += 40;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Payment Information', 50, yPosition);

      yPosition += 20;
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Payment Method: ${orderData.payment_method || 'Online Payment'}`, 50, yPosition)
        .text(`Payment Status: ${orderData.payment_status}`, 50, yPosition + 15)
        .text(`Order Status: ${orderData.order_status}`, 50, yPosition + 30);

      // Footer
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(
          'Thank you for your business!',
          50,
          doc.page.height - 100,
          { align: 'center', width: 500 }
        );

      doc
        .fontSize(8)
        .text(
          'For questions about this invoice, please contact support@rocketdrop.com',
          50,
          doc.page.height - 80,
          { align: 'center', width: 500 }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
