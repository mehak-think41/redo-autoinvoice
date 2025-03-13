# **InvoiceAuto – AI-Powered Invoice Processing & Inventory Management**  

InvoiceAuto is a cloud-native AI system designed to automate invoice processing and streamline inventory management. It integrates with email systems to auto-fetch invoices, leverages AI for intelligent data extraction, and enables human approval with minimal manual intervention.

---

## **🚀 Project Goals & Objectives**  
**Primary Objectives:**  
✅ Automate invoice ingestion from email attachments.  
✅ Use AI to parse invoices, extract structured data, and validate accuracy.  
✅ Enable a one-click approval workflow for human verification.  
✅ Maintain an easy-to-use dashboard for invoice tracking.  

**Secondary Objectives (Future Expansion):**  
🔜 Automate inventory updates after approval.  
🔜 Enable auto-reordering of supplies based on stock levels.  
🔜 Generate reports and audit logs for financial insights.

## **💡 Hero Feature: AI-Powered Invoice Parsing & One-Click Approval**  
**How It Works:**  
Invoices (PDFs or images) are ingested via email.  
AI extracts key invoice details (SKU, price, quantity, vendor).  
User reviews extracted data and approves it with one click.

## **📌 Core Functionalities**  
**1️⃣ Invoice Ingestion**  
📥 Auto-fetch invoices via email (Gmail API, IMAP/SMTP)  
🖼️ Support for multiple formats: PDF, JPG, PNG  
📝 Manual upload option for users who prefer direct uploads  

**2️⃣ AI-Powered Parsing & Data Extraction**  
🔍 Text extraction via OCR (Tesseract, AWS Textract, Google Vision AI)  
🧠 AI-based invoice parsing (LLaVA at Groq – multimodal LLM)  
📦 SKU detection & validation (Meta's SAM2 / OpenCV for object extraction)  
⚠️ Confidence scores provided for extracted data  

**3️⃣ Human Review & One-Click Approval**  
👀 Users review parsed invoice data in a simple UI  
✅ Accept / 🏷️ Edit / ❌ Reject invoices easily  
♻️ Rollback mechanism for incorrect approvals  

**4️⃣ Inventory Management (Future Expansion)**  
📊 Automatic inventory updates post-approval  
🔔 Stock level alerts for low inventory  
📦 Supplier reordering automation via email notifications  

**5️⃣ Notifications & Tracking**  
📩 Email notifications for pending approvals  
🔔 Push notifications via Firebase for urgent tasks  
📜 Status tracking: Pending, Approved, Rejected  

---

## **🛠️ Tech Stack**  

### **Frontend**  
- **React** (with **Tailwind CSS** for styling).  
- **Axios** for API calls.  

### **Backend**  
- **Django** (Python) for the backend API.  
- **PostgreSQL** for database storage.     

---

## **🚀 Getting Started**  

### **Prerequisites**  
- **Node.js** and **npm** installed for React.  
- **Python 3.x** and **pip** installed for Django.  
- **Docker** installed for containerization.  
- **PostgreSQL** installed or accessible.  

### **Installation**  

1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/your-username/invoiceauto.git  
   cd invoiceauto  
   ```  

2. **Set Up Backend**  
   - Navigate to the `backend` folder:  
     ```bash  
     cd backend  
     ```  
   - Create a virtual environment:  
     ```bash  
     python -m venv venv  
     source venv/bin/activate  # On Windows: venv\Scripts\activate  
     ```  
   - Install dependencies:  
     ```bash  
     pip install -r requirements.txt  
     ```  
   - Set up the database:  
     ```bash  
     python manage.py migrate  
     ```  
   - Run the Django server:  
     ```bash  
     python manage.py runserver  
     ```  

3. **Set Up Frontend**  
   - Navigate to the `frontend` folder:  
     ```bash  
     cd ../frontend  
     ```  
   - Install dependencies:  
     ```bash  
     npm install  
     ```  
   - Start the React app:  
     ```bash  
     npm start  
     ```  

4. **Run with Docker**  
   - Build and run the Docker containers:  
     ```bash  
     docker-compose up --build  
     ```  

---

## **📂 Project Structure**  

```  
invoiceauto/  
├── backend/                  # Django backend  
│   ├── manage.py  
│   ├── requirements.txt  
│   ├── Dockerfile  
│   └── ...  
├── frontend/                 # React frontend  
│   ├── src/  
│   ├── public/  
│   ├── package.json  
│   ├── Dockerfile  
│   └── ...  
├── docker-compose.yml        # Docker configuration  
└── README.md  
```  
---

## **📈 Future Enhancements**  
- **Multi-platform integration** (QuickBooks, Xero, etc.).  
- **Success prediction** using advanced AI models.  
- **Refined invoice insights & analytics**.  
- **Mobile app** for on-the-go tracking.  

---

## **🙏 Contributing**  
Contributions are welcome! Please fork the repository and submit a pull request.  

Happy automating! 🚀