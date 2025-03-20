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

module.exports = {
  sendPendingInvoiceEmail,
  sendFlaggedInvoiceEmail
};
