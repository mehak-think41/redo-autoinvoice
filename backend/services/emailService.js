const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email template for pending invoice notification
const getPendingInvoiceEmailTemplate = (invoice) => {
  return {
    subject: `[${process.env.COMPANY_NAME}] Pending Invoice Review Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">
          Invoice Review Required
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Hello,</p>
          <p>An invoice requires your attention:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</li>
            <li><strong>Amount:</strong> $${invoice.amount?.toFixed(2) || '0.00'}</li>
            <li><strong>Status:</strong> <span style="color: #f39c12;">Pending Review</span></li>
            <li><strong>Confidence Score:</strong> ${invoice.confidence_score}%</li>
          </ul>
          <p>This invoice has been marked for review due to low confidence score.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.APP_URL || ''}/dashboard/pending" 
               style="background-color: #3498db; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              Review Invoice
            </a>
          </div>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please do not reply to this email.
        </p>
      </div>
    `
  };
};

// Email template for flagged invoice notification
const getFlaggedInvoiceEmailTemplate = (invoice) => {
  return {
    subject: `[${process.env.COMPANY_NAME}] Flagged Invoice - Inventory Issue`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">
          Inventory Issue Detected
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Hello,</p>
          <p>An invoice has been flagged due to inventory issues:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</li>
            <li><strong>Amount:</strong> $${invoice.amount?.toFixed(2) || '0.00'}</li>
            <li><strong>Status:</strong> <span style="color: #e74c3c;">Flagged</span></li>
            <li><strong>Issue:</strong> Insufficient inventory for one or more items</li>
          </ul>
          <p>This invoice requires your immediate attention to resolve inventory discrepancies.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.APP_URL || ''}/dashboard/pending" 
               style="background-color: #e74c3c; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px;">
              Review Invoice
            </a>
          </div>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please do not reply to this email.
        </p>
      </div>
    `
  };
};

// Email template for approved invoice notification to customer
const getApprovedInvoiceCustomerTemplate = (invoice) => {
  return {
    subject: `[${process.env.COMPANY_NAME}] Order Confirmation - Invoice #${invoice.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">
          Order Confirmation
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Dear ${invoice.customerName || 'Valued Customer'},</p>
          <p>Thank you for your order. We're pleased to confirm that your invoice has been processed successfully.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</li>
            <li><strong>Amount:</strong> $${invoice.amount?.toFixed(2) || '0.00'}</li>
            <li><strong>Status:</strong> <span style="color: #27ae60;">Approved</span></li>
          </ul>
          <div style="background-color: #e8f6f3; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #27ae60;"><strong>Delivery Information</strong></p>
            <p style="margin: 10px 0 0 0;">Your order will be delivered within 3-5 business days.</p>
            <p style="margin: 10px 0 0 0;">Delivery Address:<br>${invoice.shippingAddress || 'Address not provided'}</p>
          </div>
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please do not reply to this email.
        </p>
      </div>
    `
  };
};

// Email template for delayed delivery notification to customer
const getDelayedDeliveryCustomerTemplate = (invoice) => {
  return {
    subject: `[${process.env.COMPANY_NAME}] Important: Order Delivery Update - Invoice #${invoice.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">
          Order Delivery Update
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Dear ${invoice.customerName || 'Valued Customer'},</p>
          <p>Thank you for your order. We want to inform you about an important update regarding your recent purchase.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</li>
            <li><strong>Amount:</strong> $${invoice.amount?.toFixed(2) || '0.00'}</li>
          </ul>
          <div style="background-color: #fdf2e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #e67e22;"><strong>Delivery Update</strong></p>
            <p style="margin: 10px 0 0 0;">Due to high demand, some items in your order are currently being restocked. 
            Your order will be delivered within 10-14 business days.</p>
            <p style="margin: 10px 0 0 0;">Delivery Address:<br>${invoice.shippingAddress || 'Address not provided'}</p>
          </div>
          <p>We apologize for any inconvenience and are working to fulfill your order as quickly as possible. 
          If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please do not reply to this email.
        </p>
      </div>
    `
  };
};

// Email template for missing SKU notification to customer
const getMissingSkuCustomerTemplate = (invoice, skuDetails) => {
  return {
    subject: `[${process.env.COMPANY_NAME}] Important: Order Update - Unavailable Item`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">
          Order Update Required
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Dear ${invoice.customerName || 'Valued Customer'},</p>
          <p>We regret to inform you that we are unable to process your order at this time.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</li>
            <li><strong>Amount:</strong> $${invoice.amount?.toFixed(2) || '0.00'}</li>
          </ul>
          <div style="background-color: #fee8e7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #c0392b;"><strong>Item Unavailable</strong></p>
            <p style="margin: 10px 0 0 0;">The following item in your order is no longer available in our catalog:</p>
            <ul style="margin: 10px 0; color: #c0392b;">
              <li>Item SKU: ${skuDetails.sku}</li>
              <li>Quantity Requested: ${skuDetails.quantity}</li>
            </ul>
            <p style="margin: 10px 0 0 0;">We recommend:</p>
            <ol style="margin: 5px 0;">
              <li>Reviewing your order details</li>
              <li>Checking the SKU number for accuracy</li>
              <li>Contacting our support team for assistance</li>
            </ol>
          </div>
          <p>We apologize for any inconvenience. Please contact our support team to update your order or explore alternative options.</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please do not reply to this email.
        </p>
      </div>
    `
  };
};

// Email template for supplier order
const getSupplierOrderTemplate = (skus, additionalNotes, userName, userEmail) => {
  const skuTableRows = skus.map(sku => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${sku.code}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${sku.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${sku.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${sku.specifications || '-'}</td>
    </tr>
  `).join('');

  return {
    subject: `[${process.env.COMPANY_NAME}] Purchase Order Request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center; padding: 20px 0;">Purchase Order Request</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Dear Supplier,</p>
          <p>We would like to place an order for the following items:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px;">SKU Code</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Item Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Specifications</th>
              </tr>
            </thead>
            <tbody>
              ${skuTableRows}
            </tbody>
          </table>

          ${additionalNotes ? `<p style="margin-top: 20px;"><strong>Additional Notes:</strong><br>${additionalNotes}</p>` : ''}
          
          <p style="margin-top: 20px;">Please confirm the availability and provide a quotation for the above items.</p>
          
          <p style="margin-top: 20px;">Best regards,<br>
          ${userName || 'Purchasing Team'}<br>
          ${userEmail ? `Email: ${userEmail}` : ''}</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from ${process.env.COMPANY_NAME}. Please reply to this email with your quotation.
        </p>
      </div>
    `
  };
};

const sendPendingInvoiceEmail = async (userEmail, invoice) => {
  try {
    const template = getPendingInvoiceEmailTemplate(invoice);
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Pending invoice email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending pending invoice email:', error);
    throw error;
  }
};

const sendFlaggedInvoiceEmail = async (userEmail, invoice) => {
  try {
    const template = getFlaggedInvoiceEmailTemplate(invoice);
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Flagged invoice email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending flagged invoice email:', error);
    throw error;
  }
};

const sendApprovedInvoiceCustomerEmail = async (customerEmail, invoice) => {
  try {
    const template = getApprovedInvoiceCustomerTemplate(invoice);
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Approved invoice customer email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending approved invoice customer email:', error);
    throw error;
  }
};

const sendDelayedDeliveryCustomerEmail = async (customerEmail, invoice) => {
  try {
    const template = getDelayedDeliveryCustomerTemplate(invoice);
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Delayed delivery customer email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending delayed delivery customer email:', error);
    throw error;
  }
};

const sendMissingSkuCustomerEmail = async (customerEmail, invoice, skuDetails) => {
  try {
    const template = getMissingSkuCustomerTemplate(invoice, skuDetails);
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Missing SKU customer email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending missing SKU customer email:', error);
    throw error;
  }
};

const sendSupplierOrderEmail = async (supplierEmail, skus, additionalNotes, userName, userEmail) => {
  try {
    const { subject, html } = getSupplierOrderTemplate(skus, additionalNotes, userName, userEmail);
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: supplierEmail,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending supplier order email:', error);
    throw error;
  }
};

module.exports = {
  sendPendingInvoiceEmail,
  sendFlaggedInvoiceEmail,
  sendApprovedInvoiceCustomerEmail,
  sendDelayedDeliveryCustomerEmail,
  sendMissingSkuCustomerEmail,
  sendSupplierOrderEmail
};
