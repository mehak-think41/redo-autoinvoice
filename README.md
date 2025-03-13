# InvoiceAuto - AI-Powered Invoice Processing & Inventory Management

InvoiceAuto is an AI-driven system designed to automate invoice processing and inventory management. It monitors a Gmail inbox for incoming invoice emails, uses AI to extract invoice data, and processes invoices based on current inventory levels. Depending on the validation, invoices are automatically approved, flagged for GAP analysis, or left pending for human review. This single-page README provides detailed instructions for setup, usage, and development.

---

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [Usage](#usage)
8. [API Endpoints](#api-endpoints)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)
13. [Acknowledgements](#acknowledgements)

---

## Overview
InvoiceAuto automates invoice processing by:
- **Fetching Invoice Emails:** Monitors a Gmail inbox for new invoice emails.
- **AI Processing:** Uses OCR and AI models to extract details (SKU, quantity, price, vendor) from invoices.
- **Inventory Verification:** Checks if the invoice items can be fulfilled based on current inventory.
- **Decision Logic:**
  - **Approved:** Invoice is automatically approved if inventory is sufficient.
  - **Flagged:** Invoice is flagged for GAP analysis if inventory is insufficient.
  - **Pending:** Invoices with low-confidence extraction are marked for human review.
- **GAP Analysis:** Analyzes flagged invoices to determine inventory shortfalls.
- **Dashboard & Controls:** Provides a user dashboard for managing invoices, inventory, and scanning automation.

---

## Features
- **Authentication & User Management**
  - Google OAuth2 for login/signup.
  - Session management with JWT and `localStorage` (mocked for demo purposes).
- **Email Integration**
  - Fetch Gmail inbox messages and receive real-time notifications via a pub/sub mechanism.
  - Live inbox watch functionality.
- **Invoice Processing**
  - AI-powered extraction of invoice details from PDFs/images.
  - Confidence scoring for extracted data.
- **Inventory Management & GAP Analysis**
  - Automatic inventory check and update upon invoice approval.
  - GAP analysis to determine shortages for flagged invoices.
- **Automated Scanning Controls**
  - Start/stop automated email scanning.
- **User Dashboard**
  - View recently received emails, processed invoices, pending approvals, return emails, and perform inventory management.

---

## Architecture
- **Frontend:** Built with Next.js for server-side rendering, static site generation, and a responsive user interface.
- **Backend:** Developed with Express.js, providing RESTful APIs for authentication, invoice processing, inventory management, and pub/sub event handling.
- **AI & OCR Processing:** Integrates tools like Tesseract OCR, LLaVA/OpenCV for invoice data extraction.
- **Email Integration:** Uses the Gmail API and Google Cloud Pub/Sub to monitor and process incoming emails.
- **Database:** PostgreSQL stores user, invoice, and inventory data.
- **Asynchronous Tasks:** (Optional) Background processing using Node.js queues or a similar mechanism.

---

## Technology Stack
- **Frontend:** Next.js, React, TailwindCSS or Material UI
- **Backend:** Express.js, Node.js, PostgreSQL
- **Authentication:** Google OAuth2, JWT
- **Invoice Processing:** OCR (Tesseract/AWS Textract), LLaVA/OpenCV
- **Email Integration:** Gmail API, Google Cloud Pub/Sub
- **Deployment:** Docker, Kubernetes, AWS/GCP/Azure

---

## Project Structure
```
InvoiceAuto/
├── frontend/                # Next.js frontend
│   ├── components/          # Reusable React components
│   ├── pages/               # Next.js pages (login, dashboard, etc.)
│   ├── public/              # Static assets (images, fonts)
│   ├── styles/              # Global CSS / Tailwind configuration
│   └── package.json         # Frontend dependencies & scripts
├── backend/                 # Express.js backend
│   ├── controllers/         # API controllers (authController, docController, userController)
│   ├── models/              # Database models (User, Invoice, Inventory)
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic (invoice processing, inventory check, GAP analysis)
│   ├── app.js               # Main Express app setup
│   └── package.json         # Backend dependencies & scripts
└── README.md                # This file
```

---

## Installation & Setup

### Prerequisites
- **Node.js** (v14 or later)
- **npm** or **yarn**
- **PostgreSQL** database
- **Docker** (optional, for containerized deployment)
- **Google Cloud account** for OAuth credentials and Gmail API
- **Google Cloud Pub/Sub** or similar for event notifications

### Environment Variables
Create a `.env` file in both `backend/` and `frontend/`.

**Backend `.env`:**
```
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/invoiceauto
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
PUBSUB_PROJECT_ID=your_pubsub_project_id
PUBSUB_TOPIC=your_pubsub_topic_name
```

**Frontend `.env`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/invoiceauto.git
   cd invoiceauto
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Set up your PostgreSQL database and run migrations if needed
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Usage
1. **Login** using your Google account.
2. **Dashboard** will show your recent emails, processed invoices, and inventory status.
3. **Start/Stop Scanning** to control the automated email monitoring.
4. **Manage Invoices** by reviewing pending invoices, approving/rejecting them, or viewing GAP analysis.
5. **Inventory Management** allows you to view and update current inventory levels.

---

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth2 authentication
- `GET /api/auth/logout` - Logout user

### Email Management
- `GET /api/emails` - Get all emails
- `POST /api/emails/watch` - Start watching inbox
- `DELETE /api/emails/watch` - Stop watching inbox

### Invoice Processing
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id/approve` - Approve invoice
- `PUT /api/invoices/:id/reject` - Reject invoice
- `GET /api/invoices/:id/gap` - Get GAP analysis for invoice

### Inventory Management
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

---

## Testing
Run tests using the following commands:

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## Deployment
InvoiceAuto can be deployed using Docker and Kubernetes:

1. **Build Docker images:**
   ```bash
   docker-compose build
   ```

2. **Deploy to Kubernetes:**
   ```bash
   kubectl apply -f k8s/
   ```

3. **Alternative deployment options:**
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - Azure App Service

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgements
- [Gmail API](https://developers.google.com/gmail/api)
- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)