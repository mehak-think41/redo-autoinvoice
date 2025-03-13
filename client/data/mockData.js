// Mock data for invoices
export const recentInvoices = [
  { id: 1, number: 'INV-001', date: '2025-03-15', company: 'Tech Corp', amount: 1500.00, status: 'pending' },
  { id: 2, number: 'INV-002', date: '2025-03-14', company: 'Digital Solutions', amount: 2300.00, status: 'processed' },
  { id: 3, number: 'INV-003', date: '2025-03-13', company: 'Innovation Labs', amount: 3400.00, status: 'pending' },
  { id: 4, number: 'INV-004', date: '2025-03-12', company: 'Future Systems', amount: 1200.00, status: 'processed' },
  { id: 11, number: 'INV-011', date: '2025-03-11', company: 'Tech Corp', amount: 2500.00, status: 'pending' },
  { id: 12, number: 'INV-012', date: '2025-03-10', company: 'Digital Solutions', amount: 1800.00, status: 'processed' },
  { id: 13, number: 'INV-013', date: '2025-03-09', company: 'Innovation Labs', amount: 4200.00, status: 'pending' },
  { id: 14, number: 'INV-014', date: '2025-03-08', company: 'Future Systems', amount: 3100.00, status: 'processed' },
  { id: 15, number: 'INV-015', date: '2025-03-07', company: 'Tech Corp', amount: 1700.00, status: 'pending' },
  { id: 16, number: 'INV-016', date: '2025-03-06', company: 'Digital Solutions', amount: 2900.00, status: 'processed' },
  { id: 17, number: 'INV-017', date: '2025-03-05', company: 'Innovation Labs', amount: 3600.00, status: 'pending' },
  { id: 18, number: 'INV-018', date: '2025-03-04', company: 'Future Systems', amount: 2200.00, status: 'processed' },
  { id: 19, number: 'INV-019', date: '2025-03-03', company: 'Tech Corp', amount: 4100.00, status: 'pending' },
  { id: 20, number: 'INV-020', date: '2025-03-02', company: 'Digital Solutions', amount: 1300.00, status: 'processed' },
];

export const processedInvoices = [
  { id: 5, number: 'INV-005', date: '2025-03-11', company: 'Tech Corp', amount: 4500.00, processedDate: '2025-03-12' },
  { id: 6, number: 'INV-006', date: '2025-03-10', company: 'Digital Solutions', amount: 2800.00, processedDate: '2025-03-11' },
  { id: 7, number: 'INV-007', date: '2025-03-09', company: 'Innovation Labs', amount: 3200.00, processedDate: '2025-03-10' },
  { id: 21, number: 'INV-021', date: '2025-03-08', company: 'Future Systems', amount: 1900.00, processedDate: '2025-03-09' },
  { id: 22, number: 'INV-022', date: '2025-03-07', company: 'Tech Corp', amount: 2700.00, processedDate: '2025-03-08' },
  { id: 23, number: 'INV-023', date: '2025-03-06', company: 'Digital Solutions', amount: 3300.00, processedDate: '2025-03-07' },
  { id: 24, number: 'INV-024', date: '2025-03-05', company: 'Innovation Labs', amount: 2100.00, processedDate: '2025-03-06' },
  { id: 25, number: 'INV-025', date: '2025-03-04', company: 'Future Systems', amount: 4800.00, processedDate: '2025-03-05' },
  { id: 26, number: 'INV-026', date: '2025-03-03', company: 'Tech Corp', amount: 1600.00, processedDate: '2025-03-04' },
  { id: 27, number: 'INV-027', date: '2025-03-02', company: 'Digital Solutions', amount: 3900.00, processedDate: '2025-03-03' },
  { id: 28, number: 'INV-028', date: '2025-03-01', company: 'Innovation Labs', amount: 2400.00, processedDate: '2025-03-02' },
  { id: 29, number: 'INV-029', date: '2025-02-28', company: 'Future Systems', amount: 5200.00, processedDate: '2025-03-01' },
  { id: 30, number: 'INV-030', date: '2025-02-27', company: 'Tech Corp', amount: 2000.00, processedDate: '2025-02-28' },
];

export const pendingInvoices = [
  { id: 8, number: 'INV-008', date: '2025-03-15', company: 'Tech Corp', amount: 5500.00, urgency: 'high' },
  { id: 9, number: 'INV-009', date: '2025-03-14', company: 'Digital Solutions', amount: 1800.00, urgency: 'medium' },
  { id: 10, number: 'INV-010', date: '2025-03-13', company: 'Innovation Labs', amount: 2900.00, urgency: 'low' },
  { id: 31, number: 'INV-031', date: '2025-03-12', company: 'Future Systems', amount: 3700.00, urgency: 'high' },
  { id: 32, number: 'INV-032', date: '2025-03-11', company: 'Tech Corp', amount: 1400.00, urgency: 'medium' },
  { id: 33, number: 'INV-033', date: '2025-03-10', company: 'Digital Solutions', amount: 2600.00, urgency: 'low' },
  { id: 34, number: 'INV-034', date: '2025-03-09', company: 'Innovation Labs', amount: 4300.00, urgency: 'high' },
  { id: 35, number: 'INV-035', date: '2025-03-08', company: 'Future Systems', amount: 1900.00, urgency: 'medium' },
  { id: 36, number: 'INV-036', date: '2025-03-07', company: 'Tech Corp', amount: 3100.00, urgency: 'low' },
  { id: 37, number: 'INV-037', date: '2025-03-06', company: 'Digital Solutions', amount: 2200.00, urgency: 'high' },
  { id: 38, number: 'INV-038', date: '2025-03-05', company: 'Innovation Labs', amount: 3500.00, urgency: 'medium' },
  { id: 39, number: 'INV-039', date: '2025-03-04', company: 'Future Systems', amount: 2800.00, urgency: 'low' },
  { id: 40, number: 'INV-040', date: '2025-03-03', company: 'Tech Corp', amount: 4100.00, urgency: 'high' },
];

export const returnEmails = [
  { id: 1, subject: 'Invoice Clarification Needed', sender: 'accounting@techcorp.com', date: '2025-03-15', status: 'unread' },
  { id: 2, subject: 'Missing Invoice Details', sender: 'finance@digitalsolutions.com', date: '2025-03-14', status: 'read' },
  { id: 3, subject: 'Invoice Dispute', sender: 'billing@innovationlabs.com', date: '2025-03-13', status: 'unread' },
  { id: 4, subject: 'Payment Delay Notification', sender: 'accounts@futuresystems.com', date: '2025-03-12', status: 'unread' },
  { id: 5, subject: 'Invoice Overdue', sender: 'billing@techcorp.com', date: '2025-03-11', status: 'read' },
  { id: 6, subject: 'Refund Request', sender: 'support@digitalsolutions.com', date: '2025-03-10', status: 'unread' },
  { id: 7, subject: 'Invoice Correction', sender: 'finance@innovationlabs.com', date: '2025-03-09', status: 'read' },
  { id: 8, subject: 'Payment Confirmation', sender: 'accounts@futuresystems.com', date: '2025-03-08', status: 'unread' },
  { id: 9, subject: 'Invoice Query', sender: 'billing@techcorp.com', date: '2025-03-07', status: 'read' },
  { id: 10, subject: 'Payment Receipt', sender: 'finance@digitalsolutions.com', date: '2025-03-06', status: 'unread' },
  { id: 11, subject: 'Invoice Discrepancy', sender: 'billing@innovationlabs.com', date: '2025-03-05', status: 'read' },
  { id: 12, subject: 'Overpayment Notification', sender: 'accounts@futuresystems.com', date: '2025-03-04', status: 'unread' },
  { id: 13, subject: 'Invoice Approval', sender: 'billing@techcorp.com', date: '2025-03-03', status: 'read' },
  { id: 14, subject: 'Payment Reminder', sender: 'finance@digitalsolutions.com', date: '2025-03-02', status: 'unread' },
];

export const inventory = [
  { id: 1, name: 'Laptop', sku: 'LAP-001', quantity: 50, reorderPoint: 20, lastUpdated: '2025-03-13' },
  { id: 2, name: 'Monitor', sku: 'MON-001', quantity: 15, reorderPoint: 25, lastUpdated: '2025-03-12' },
  { id: 3, name: 'Keyboard', sku: 'KEY-001', quantity: 100, reorderPoint: 30, lastUpdated: '2025-03-11' },
  { id: 4, name: 'Mouse', sku: 'MOU-001', quantity: 75, reorderPoint: 25, lastUpdated: '2025-03-10' },
  { id: 5, name: 'Printer', sku: 'PRI-001', quantity: 30, reorderPoint: 10, lastUpdated: '2025-03-09' },
  { id: 6, name: 'Scanner', sku: 'SCA-001', quantity: 20, reorderPoint: 15, lastUpdated: '2025-03-08' },
  { id: 7, name: 'Projector', sku: 'PRO-001', quantity: 10, reorderPoint: 5, lastUpdated: '2025-03-07' },
  { id: 8, name: 'Server', sku: 'SER-001', quantity: 5, reorderPoint: 2, lastUpdated: '2025-03-06' },
  { id: 9, name: 'Router', sku: 'ROU-001', quantity: 25, reorderPoint: 10, lastUpdated: '2025-03-05' },
  { id: 10, name: 'Switch', sku: 'SWI-001', quantity: 40, reorderPoint: 20, lastUpdated: '2025-03-04' },
  { id: 11, name: 'Tablet', sku: 'TAB-001', quantity: 60, reorderPoint: 30, lastUpdated: '2025-03-03' },
  { id: 12, name: 'Smartphone', sku: 'SMA-001', quantity: 100, reorderPoint: 50, lastUpdated: '2025-03-02' },
  { id: 13, name: 'Headphones', sku: 'HEA-001', quantity: 80, reorderPoint: 40, lastUpdated: '2025-03-01' },
  { id: 14, name: 'External Hard Drive', sku: 'EXT-001', quantity: 45, reorderPoint: 20, lastUpdated: '2025-02-28' },
];

export const gapAnalysis = [
  { id: 1, category: 'Electronics', expected: 100, actual: 85, gap: 15, impact: 'medium' },
  { id: 2, category: 'Office Supplies', expected: 500, actual: 450, gap: 50, impact: 'low' },
  { id: 3, category: 'Furniture', expected: 50, actual: 30, gap: 20, impact: 'high' },
  { id: 4, category: 'Software Licenses', expected: 200, actual: 180, gap: 20, impact: 'medium' },
  { id: 5, category: 'Networking Equipment', expected: 150, actual: 120, gap: 30, impact: 'high' },
  { id: 6, category: 'Accessories', expected: 300, actual: 250, gap: 50, impact: 'low' },
  { id: 7, category: 'Printers & Scanners', expected: 100, actual: 90, gap: 10, impact: 'medium' },
  { id: 8, category: 'Servers', expected: 50, actual: 40, gap: 10, impact: 'high' },
  { id: 9, category: 'Storage Devices', expected: 200, actual: 170, gap: 30, impact: 'medium' },
  { id: 10, category: 'Mobile Devices', expected: 300, actual: 280, gap: 20, impact: 'low' },
  { id: 11, category: 'Audio Equipment', expected: 150, actual: 130, gap: 20, impact: 'medium' },
  { id: 12, category: 'Security Devices', expected: 100, actual: 80, gap: 20, impact: 'high' },
  { id: 13, category: 'Power Supplies', expected: 200, actual: 180, gap: 20, impact: 'medium' },
  { id: 14, category: 'Cables & Adapters', expected: 500, actual: 450, gap: 50, impact: 'low' },
];

export const automationStats = {
  status: 'running',
  processedToday: 45,
  accuracy: 98.5,
  lastRun: '2025-03-15 10:30:00',
  queueSize: 12,
};

export const invoiceDetails = {
    1: {
      invoice_number: 'INV-001',
      date: '2025-03-15',
      due_date: '2025-04-14',
      supplier: 'Tech Corp',
      amount: 1500.00,
      tax: 150.00,
      total: 1650.00,
      supplier_address: '123 Tech Street, Silicon Valley, CA 94025',
      supplier_email: 'billing@techcorp.com',
      supplier_phone: '+1 (555) 123-4567',
      number_of_units: 3,
      confidence: 'high',
      confidence_score: 95,
      line_items: [
        {
          description: 'High-Performance Laptop',
          quantity: 1,
          unit_price: 1000.00,
          total: 1000.00
        },
        {
          description: 'Extended Warranty',
          quantity: 1,
          unit_price: 300.00,
          total: 300.00
        },
        {
          description: 'Software License',
          quantity: 1,
          unit_price: 200.00,
          total: 200.00
        }
      ],
      notes: 'Priority shipping requested'
    },
  2: {
    invoice_number: 'INV-002',
    date: '2025-03-14',
    due_date: '2025-04-13',
    supplier: 'Digital Solutions',
    amount: 2300.00,
    tax: 230.00,
    total: 2530.00,
    supplier_address: '456 Digital Lane, Tech City, TX 75001',
    supplier_email: 'billing@digitalsolutions.com',
    supplier_phone: '+1 (555) 987-6543',
    number_of_units: 5,
    confidence: 'high',
    confidence_score: 97,
    line_items: [
      {
        description: '4K Monitor',
        quantity: 2,
        unit_price: 800.00,
        total: 1600.00
      },
      {
        description: 'Ergonomic Keyboard',
        quantity: 1,
        unit_price: 150.00,
        total: 150.00
      },
      {
        description: 'Wireless Mouse',
        quantity: 2,
        unit_price: 50.00,
        total: 100.00
      }
    ],
    notes: 'Standard shipping'
  },
  3: {
    invoice_number: 'INV-003',
    date: '2025-03-13',
    due_date: '2025-04-12',
    supplier: 'Innovation Labs',
    amount: 3400.00,
    tax: 340.00,
    total: 3740.00,
    supplier_address: '789 Innovation Drive, Tech Park, NY 10001',
    supplier_email: 'billing@innovationlabs.com',
    supplier_phone: '+1 (555) 456-7890',
    number_of_units: 4,
    confidence: 'medium',
    confidence_score: 85,
    line_items: [
      {
        description: 'Gaming Laptop',
        quantity: 1,
        unit_price: 2500.00,
        total: 2500.00
      },
      {
        description: 'Gaming Mouse',
        quantity: 1,
        unit_price: 100.00,
        total: 100.00
      },
      {
        description: 'Gaming Headset',
        quantity: 1,
        unit_price: 200.00,
        total: 200.00
      },
      {
        description: 'Gaming Keyboard',
        quantity: 1,
        unit_price: 150.00,
        total: 150.00
      }
    ],
    notes: 'Express shipping requested'
  },
  4: {
    invoice_number: 'INV-004',
    date: '2025-03-12',
    due_date: '2025-04-11',
    supplier: 'Future Systems',
    amount: 1200.00,
    tax: 120.00,
    total: 1320.00,
    supplier_address: '101 Future Avenue, Tech Valley, WA 98001',
    supplier_email: 'billing@futuresystems.com',
    supplier_phone: '+1 (555) 321-6547',
    number_of_units: 2,
    confidence: 'high',
    confidence_score: 96,
    line_items: [
      {
        description: 'Smart Home Hub',
        quantity: 1,
        unit_price: 800.00,
        total: 800.00
      },
      {
        description: 'Smart Light Bulbs',
        quantity: 4,
        unit_price: 50.00,
        total: 200.00
      }
    ],
    notes: 'Standard shipping'
  },
  5: {
    invoice_number: 'INV-005',
    date: '2025-03-11',
    due_date: '2025-04-10',
    supplier: 'Tech Corp',
    amount: 4500.00,
    tax: 450.00,
    total: 4950.00,
    supplier_address: '123 Tech Street, Silicon Valley, CA 94025',
    supplier_email: 'billing@techcorp.com',
    supplier_phone: '+1 (555) 123-4567',
    number_of_units: 6,
    confidence: 'high',
    confidence_score: 98,
    line_items: [
      {
        description: 'Workstation Laptop',
        quantity: 2,
        unit_price: 1500.00,
        total: 3000.00
      },
      {
        description: 'Docking Station',
        quantity: 2,
        unit_price: 200.00,
        total: 400.00
      },
      {
        description: 'External Monitor',
        quantity: 2,
        unit_price: 300.00,
        total: 600.00
      }
    ],
    notes: 'Priority shipping requested'
  },
  6: {
    invoice_number: 'INV-006',
    date: '2025-03-10',
    due_date: '2025-04-09',
    supplier: 'Digital Solutions',
    amount: 2800.00,
    tax: 280.00,
    total: 3080.00,
    supplier_address: '456 Digital Lane, Tech City, TX 75001',
    supplier_email: 'billing@digitalsolutions.com',
    supplier_phone: '+1 (555) 987-6543',
    number_of_units: 3,
    confidence: 'high',
    confidence_score: 97,
    line_items: [
      {
        description: 'High-End Desktop',
        quantity: 1,
        unit_price: 2000.00,
        total: 2000.00
      },
      {
        description: 'Mechanical Keyboard',
        quantity: 1,
        unit_price: 150.00,
        total: 150.00
      },
      {
        description: 'Gaming Mouse',
        quantity: 1,
        unit_price: 100.00,
        total: 100.00
      }
    ],
    notes: 'Standard shipping'
  },
  7: {
    invoice_number: 'INV-007',
    date: '2025-03-09',
    due_date: '2025-04-08',
    supplier: 'Innovation Labs',
    amount: 3200.00,
    tax: 320.00,
    total: 3520.00,
    supplier_address: '789 Innovation Drive, Tech Park, NY 10001',
    supplier_email: 'billing@innovationlabs.com',
    supplier_phone: '+1 (555) 456-7890',
    number_of_units: 4,
    confidence: 'medium',
    confidence_score: 88,
    line_items: [
      {
        description: 'VR Headset',
        quantity: 2,
        unit_price: 1000.00,
        total: 2000.00
      },
      {
        description: 'VR Controllers',
        quantity: 2,
        unit_price: 150.00,
        total: 300.00
      },
      {
        description: 'VR Accessories Kit',
        quantity: 1,
        unit_price: 200.00,
        total: 200.00
      }
    ],
    notes: 'Express shipping requested'
  },
  8: {
    invoice_number: 'INV-008',
    date: '2025-03-08',
    due_date: '2025-04-07',
    supplier: 'Future Systems',
    amount: 1900.00,
    tax: 190.00,
    total: 2090.00,
    supplier_address: '101 Future Avenue, Tech Valley, WA 98001',
    supplier_email: 'billing@futuresystems.com',
    supplier_phone: '+1 (555) 321-6547',
    number_of_units: 3,
    confidence: 'high',
    confidence_score: 95,
    line_items: [
      {
        description: 'Smart Thermostat',
        quantity: 1,
        unit_price: 250.00,
        total: 250.00
      },
      {
        description: 'Smart Doorbell',
        quantity: 1,
        unit_price: 200.00,
        total: 200.00
      },
      {
        description: 'Smart Security Camera',
        quantity: 2,
        unit_price: 300.00,
        total: 600.00
      }
    ],
    notes: 'Standard shipping'
  },
  9: {
    invoice_number: 'INV-009',
    date: '2025-03-07',
    due_date: '2025-04-06',
    supplier: 'Tech Corp',
    amount: 1700.00,
    tax: 170.00,
    total: 1870.00,
    supplier_address: '123 Tech Street, Silicon Valley, CA 94025',
    supplier_email: 'billing@techcorp.com',
    supplier_phone: '+1 (555) 123-4567',
    number_of_units: 2,
    confidence: 'high',
    confidence_score: 96,
    line_items: [
      {
        description: 'Business Laptop',
        quantity: 1,
        unit_price: 1200.00,
        total: 1200.00
      },
      {
        description: 'Laptop Bag',
        quantity: 1,
        unit_price: 100.00,
        total: 100.00
      }
    ],
    notes: 'Priority shipping requested'
  },
  10: {
    invoice_number: 'INV-010',
    date: '2025-03-06',
    due_date: '2025-04-05',
    supplier: 'Digital Solutions',
    amount: 2900.00,
    tax: 290.00,
    total: 3190.00,
    supplier_address: '456 Digital Lane, Tech City, TX 75001',
    supplier_email: 'billing@digitalsolutions.com',
    supplier_phone: '+1 (555) 987-6543',
    number_of_units: 4,
    confidence: 'high',
    confidence_score: 97,
    line_items: [
      {
        description: 'Ultrawide Monitor',
        quantity: 1,
        unit_price: 800.00,
        total: 800.00
      },
      {
        description: 'Ergonomic Chair',
        quantity: 1,
        unit_price: 500.00,
        total: 500.00
      },
      {
        description: 'Desk Lamp',
        quantity: 2,
        unit_price: 50.00,
        total: 100.00
      }
    ],
    notes: 'Standard shipping'
  },
  // Add more invoice details as needed
};