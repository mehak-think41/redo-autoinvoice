"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, ArrowLeft } from "lucide-react"
import { getInvoiceById } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InvoiceDetailsPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoiceById(id)
        setInvoice(data.invoice)
      } catch (error) {
        console.error("Failed to fetch invoice:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [id, toast])

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-50 text-green-700"
      case "pending":
        return "bg-yellow-50 text-yellow-700"
      case "flagged":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p>Loading invoice details...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p>Invoice not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/processed">
          <Button variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
        {invoice.pdf_url && (
          <Button
            onClick={() => window.open(invoice.pdf_url, '_blank')}
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Invoice Number:</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date:</span>
              <span>{new Date(invoice.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={`px-3 py-1 capitalize hover:bg-${invoice.invoice_status.toLowerCase() === 'approved' ? 'green' : invoice.invoice_status.toLowerCase() === 'pending' ? 'yellow' : invoice.invoice_status.toLowerCase() === 'flagged' ? 'red' : 'gray'}-100 hover:text-${invoice.invoice_status.toLowerCase() === 'approved' ? 'green' : invoice.invoice_status.toLowerCase() === 'pending' ? 'yellow' : invoice.invoice_status.toLowerCase() === 'flagged' ? 'red' : 'gray'}-800 ${getStatusBadgeStyle(invoice.invoice_status)}`}>
                {invoice.invoice_status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Confidence Score:</span>
              <span>{invoice.confidence_score}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span>{invoice.customer_details.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span>{invoice.customer_details.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone:</span>
              <span>{invoice.customer_details.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-right">{invoice.customer_details.shipping_address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>List of items in this invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left w-[25%]">SKU</TableHead>
                <TableHead className="text-left w-[25%]">Item Name</TableHead>
                <TableHead className="text-center w-[15%]">Quantity</TableHead>
                <TableHead className="text-center w-[15%]">Unit Price</TableHead>
                <TableHead className="text-center w-[20%]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.line_items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">${item.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">${item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tax:</span>
              <span>${invoice.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}