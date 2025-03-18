const { analyzeEmailForInvoice } = require('../controllers/docController');

const testEmail = {
    subject: "URGENT: Invoice #INV-2025-0321 for $12,345.67 - Payment Due by 2025-03-31",
    headers: {
        from: "accounts@acmeinc.com",
        to: "payments@yourcompany.com",
        date: "2025-03-18T10:00:00Z"
    },
    body: `
    Dear Accounts Payable,

    Please find attached our invoice #INV-2025-0321 for services rendered in March 2025.

    Invoice Details:
    - Invoice Number: INV-2025-0321
    - Invoice Date: 2025-03-18
    - Due Date: 2025-03-31
    - Total Amount: $12,345.67
    - Payment Terms: Net 30

    Line Items:
    1. Widget A - 100 units @ $50.00 = $5,000.00
    2. Widget B - 200 units @ $25.00 = $5,000.00
    3. Service Charge = $2,345.67

    Payment Instructions:
    - Bank Transfer: Acme Inc, Account #123456789
    - SWIFT Code: ACMEUS33
    - Reference: INV-2025-0321

    Please contact us at accounts@acmeinc.com if you have any questions.

    Best regards,
    Acme Inc Accounts Department
    `
};

(async () => {
    try {
        const result = await analyzeEmailForInvoice(
            testEmail.subject,
            testEmail.headers,
            testEmail.body
        );
        console.log("Analysis Result:", result);
    } catch (error) {
        console.error("Error:", error);
    }
})();