"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react"

// Mock invoice data - in a real app, this would come from an API
const mockInvoiceData = {
  "INV-001": {
    id: "INV-001",
    invoice_number: "INV-001",
    vendor: "Office Supplies Co.",
    date: "2025-03-10",
    due_date: "2025-04-10",
    amount: 1250.99,
    status: "pending",
    confidence_score: 92,
    supplier: "Office Supplies Co.",
    supplier_address: "123 Business Ave, Suite 200, New York, NY 10001",
    supplier_email: "accounts@officesupplies.example.com",
    supplier_phone: "(555) 123-4567",
    notes: "Monthly office supplies order",
    line_items: [
      { description: "Paper (A4)", quantity: 10, unit_price: 45.99, total: 459.9 },
      { description: "Pens (Box)", quantity: 5, unit_price: 12.5, total: 62.5 },
      { description: "Notebooks", quantity: 20, unit_price: 8.75, total: 175.0 },
      { description: "Stapler", quantity: 2, unit_price: 18.5, total: 37.0 },
      { description: "Printer Ink", quantity: 3, unit_price: 65.99, total: 197.97 },
      { description: "Desk Organizer", quantity: 5, unit_price: 22.5, total: 112.5 },
      { description: "Shipping", quantity: 1, unit_price: 25.0, total: 25.0 },
      { description: "Tax", quantity: 1, unit_price: 181.12, total: 181.12 },
    ],
    approval_history: [
      {
        user: "AI System",
        action: "Flagged for review",
        date: "2025-03-10T14:30:00",
        notes: "Amount exceeds auto-approval threshold",
      },
      { user: "System", action: "Extracted data", date: "2025-03-10T14:25:00", notes: "Confidence score: 92%" },
    ],
  },
  "INV-002": {
    id: "INV-002",
    invoice_number: "INV-002",
    vendor: "Tech Solutions Inc.",
    date: "2025-03-09",
    due_date: "2025-04-09",
    amount: 3499.5,
    status: "processing",
    confidence_score: 88,
    supplier: "Tech Solutions Inc.",
    supplier_address: "456 Tech Park, Building B, San Francisco, CA 94107",
    supplier_email: "billing@techsolutions.example.com",
    supplier_phone: "(555) 987-6543",
    notes: "Quarterly IT services and equipment",
    line_items: [
      { description: "Laptop", quantity: 1, unit_price: 1299.99, total: 1299.99 },
      { description: "Monitor", quantity: 2, unit_price: 349.99, total: 699.98 },
      { description: "Keyboard", quantity: 1, unit_price: 89.99, total: 89.99 },
      { description: "IT Support (Hours)", quantity: 10, unit_price: 125.0, total: 1250.0 },
      { description: "Tax", quantity: 1, unit_price: 159.54, total: 159.54 },
    ],
    approval_history: [
      {
        user: "AI System",
        action: "Flagged for review",
        date: "2025-03-09T10:15:00",
        notes: "Price discrepancy on monitor",
      },
      { user: "System", action: "Extracted data", date: "2025-03-09T10:10:00", notes: "Confidence score: 88%" },
    ],
  },
  "INV-003": {
    id: "INV-003",
    invoice_number: "INV-003",
    vendor: "Furniture Depot",
    date: "2025-03-08",
    due_date: "2025-04-08",
    amount: 5750.0,
    status: "approved",
    confidence_score: 95,
    supplier: "Furniture Depot",
    supplier_address: "789 Industrial Blvd, Chicago, IL 60607",
    supplier_email: "sales@furnituredepot.example.com",
    supplier_phone: "(555) 456-7890",
    notes: "Office furniture for new conference room",
    line_items: [
      { description: "Conference Table", quantity: 1, unit_price: 1200.0, total: 1200.0 },
      { description: "Office Chair", quantity: 8, unit_price: 250.0, total: 2000.0 },
      { description: "Bookshelf", quantity: 2, unit_price: 350.0, total: 700.0 },
      { description: "Filing Cabinet", quantity: 3, unit_price: 175.0, total: 525.0 },
      { description: "Whiteboard", quantity: 1, unit_price: 125.0, total: 125.0 },
      { description: "Delivery & Installation", quantity: 1, unit_price: 800.0, total: 800.0 },
      { description: "Tax", quantity: 1, unit_price: 400.0, total: 400.0 },
    ],
    approval_history: [
      {
        user: "John Doe",
        action: "Approved",
        date: "2025-03-10T09:45:00",
        notes: "Approved after verification with purchasing department",
      },
      {
        user: "AI System",
        action: "Flagged for review",
        date: "2025-03-08T16:20:00",
        notes: "Amount exceeds auto-approval threshold",
      },
      { user: "System", action: "Extracted data", date: "2025-03-08T16:15:00", notes: "Confidence score: 95%" },
    ],
  },
  "INV-004": {
    id: "INV-004",
    invoice_number: "INV-004",
    vendor: "Marketing Services LLC",
    date: "2025-03-07",
    due_date: "2025-04-07",
    amount: 2100.0,
    status: "rejected",
    confidence_score: 90,
    supplier: "Marketing Services LLC",
    supplier_address: "321 Creative Way, Austin, TX 78701",
    supplier_email: "invoices@marketingservices.example.com",
    supplier_phone: "(555) 234-5678",
    notes: "Social media campaign for Q2",
    line_items: [{ description: "Social Media Campaign", quantity: 1, unit_price: 2100.0, total: 2100.0 }],
    approval_history: [
      {
        user: "Jane Smith",
        action: "Rejected",
        date: "2025-03-09T11:30:00",
        notes: "Missing contract reference number",
      },
      {
        user: "AI System",
        action: "Flagged for review",
        date: "2025-03-07T14:10:00",
        notes: "Missing purchase order reference",
      },
      { user: "System", action: "Extracted data", date: "2025-03-07T14:05:00", notes: "Confidence score: 90%" },
    ],
  },
}

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchInvoice = () => {
      setLoading(true)
      setTimeout(() => {
        const invoiceData = mockInvoiceData[params.id]
        setInvoice(invoiceData)
        setLoading(false)
      }, 500)
    }

    fetchInvoice()
  }, [params.id])

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApprove = () => {
    // In a real app, this would be an API call
    setInvoice((prev) => ({ ...prev, status: "approved" }))
  }

  const handleReject = () => {
    // In a real app, this would be an API call
    setInvoice((prev) => ({ ...prev, status: "rejected" }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading invoice details...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {invoice.status === "pending" || invoice.status === "processing" ? (
            <>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
              <p className="text-muted-foreground">
                From {invoice.vendor} • Issued on {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${invoice.amount.toFixed(2)}</span>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-muted-foreground">Due by {new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - PDF Preview */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg aspect-[3/4] flex items-center justify-center bg-gray-50">
                <div className="text-center p-4">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-muted-foreground">Invoice Preview</p>
                  <Button variant="outline" className="mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Details and Tabs */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="lineitems">Line Items</TabsTrigger>
                  <TabsTrigger value="history">Approval History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">${invoice.amount.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                      <div className="flex items-center">
                        <p className="text-lg font-semibold">{invoice.confidence_score}%</p>
                        {invoice.confidence_score >= 90 ? (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        ) : invoice.confidence_score >= 75 ? (
                          <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
                        ) : (
                          <XCircle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Supplier Information</h3>
                    <p className="text-sm font-medium">{invoice.supplier}</p>
                    <p className="text-sm text-muted-foreground">{invoice.supplier_address}</p>
                    <p className="text-sm text-muted-foreground">{invoice.supplier_email}</p>
                    <p className="text-sm text-muted-foreground">{invoice.supplier_phone}</p>
                  </div>

                  {invoice.notes && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Notes</h3>
                      <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="lineitems" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.line_items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">${invoice.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  {invoice.approval_history && invoice.approval_history.length > 0 ? (
                    <div className="space-y-4">
                      {invoice.approval_history.map((entry, index) => (
                        <div key={index} className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {entry.user} • {entry.action}
                              </p>
                              {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No approval history available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}