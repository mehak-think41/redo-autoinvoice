"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dummy data for pending invoices
const dummyInvoices = [
  {
    id: "INV-201",
    vendor: "Office Supplies Co.",
    date: "2025-03-10",
    amount: 1250.99,
    status: "pending",
    items: [
      { id: 1, name: "Paper (A4)", quantity: 10, price: 45.99 },
      { id: 2, name: "Pens (Box)", quantity: 5, price: 12.5 },
      { id: 3, name: "Notebooks", quantity: 20, price: 8.75 },
    ],
    flagged: false,
  },
  {
    id: "INV-202",
    vendor: "Tech Solutions Inc.",
    date: "2025-03-09",
    amount: 3499.5,
    status: "pending",
    items: [
      { id: 1, name: "Laptop", quantity: 1, price: 1299.99 },
      { id: 2, name: "Monitor", quantity: 2, price: 349.99 },
      { id: 3, name: "Keyboard", quantity: 1, price: 89.99 },
    ],
    flagged: true,
    flagReason: "Price discrepancy on monitor",
  },
  {
    id: "INV-203",
    vendor: "Furniture Depot",
    date: "2025-03-08",
    amount: 5750.0,
    status: "pending",
    items: [
      { id: 1, name: "Office Chair", quantity: 5, price: 250.0 },
      { id: 2, name: "Desk", quantity: 3, price: 450.0 },
      { id: 3, name: "Filing Cabinet", quantity: 2, price: 175.0 },
    ],
    flagged: false,
  },
  {
    id: "INV-204",
    vendor: "Marketing Services LLC",
    date: "2025-03-07",
    amount: 2100.0,
    status: "pending",
    items: [{ id: 1, name: "Social Media Campaign", quantity: 1, price: 2100.0 }],
    flagged: true,
    flagReason: "Missing contract reference",
  },
  {
    id: "INV-205",
    vendor: "Catering Express",
    date: "2025-03-06",
    amount: 875.25,
    status: "pending",
    items: [
      { id: 1, name: "Lunch Catering", quantity: 25, price: 15.99 },
      { id: 2, name: "Coffee Service", quantity: 1, price: 75.0 },
      { id: 3, name: "Snacks", quantity: 30, price: 3.5 },
    ],
    flagged: false,
  },
]

export default function PendingInvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(dummyInvoices)
      setLoading(false)
    }, 1000)
  }, [])

  // Handle search
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsDialogOpen(true)
  }

  const handleApproveInvoice = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "approved" } : invoice)),
    )

    setIsDialogOpen(false)
    toast({
      title: "Invoice Approved",
      description: `Invoice ${invoiceId} has been approved successfully.`,
    })
  }

  const handleRejectInvoice = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status: "rejected" } : invoice)),
    )

    setIsDialogOpen(false)
    toast({
      title: "Invoice Rejected",
      description: `Invoice ${invoiceId} has been rejected.`,
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve pending invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search invoices..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Invoice #</TableHead>
                  <TableHead className="text-center">Vendor</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No pending invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium text-center">
                        {invoice.id}
                        {invoice.flagged && <AlertTriangle className="h-4 w-4 text-amber-500 inline ml-1" />}
                      </TableCell>
                      <TableCell className="text-center">{invoice.vendor}</TableCell>
                      <TableCell className="text-center">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center">
                          
                          <Badge className="px-3 py-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors font-medium">
                            Pending
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-3">
                            <a href={`/dashboard/invoice/${invoice.id}`}>
                          <Button variant="outline" size="sm" className="text-black-600 border-black-200 hover:bg-black-50 p-1">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">View</span>
                          </Button>
                            </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 p-1"
                            onClick={() => handleApproveInvoice(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 p-1"
                            onClick={() => handleRejectInvoice(invoice.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Invoice Details: {selectedInvoice.id}
                {selectedInvoice.flagged && (
                  <div className="flex items-center ml-2">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Flagged
                    </Badge>
                  </div>
                )}
              </DialogTitle>
              <DialogDescription>Review invoice details before approval</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Invoice Details</TabsTrigger>
                <TabsTrigger value="items">Line Items</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Vendor</h4>
                    <p className="text-lg font-medium">{selectedInvoice.vendor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Invoice Date</h4>
                    <p className="text-lg font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total Amount</h4>
                    <p className="text-lg font-medium">${selectedInvoice.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="flex items-center mt-1">
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 transition-colors font-medium">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedInvoice.flagged && (
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
                    <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Flag Reason
                    </h4>
                    <p className="text-amber-700 mt-1">{selectedInvoice.flagReason}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="items" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Item</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Unit Price</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">${(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">${selectedInvoice.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleRejectInvoice(selectedInvoice.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Invoice
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApproveInvoice(selectedInvoice.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}