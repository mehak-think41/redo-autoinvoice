"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowUpDown, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileDown,
  ClipboardList,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPendingInvoices, updateInvoiceStatus } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PendingApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getPendingInvoices();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        toast({
          title: "Error",
          description: "Failed to load pending invoices.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      (invoice.invoice_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (invoice.customer_details?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      invoice.total?.toString().includes(searchTerm)
  )

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortConfig.key) {
      case "date":
        return sortConfig.direction === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      case "amount":
        return sortConfig.direction === "asc"
          ? a.total - b.total
          : b.total - a.total
      default:
        return 0
    }
  })

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />
  }

  const exportToCSV = () => {
    const headers = ["Invoice Number", "Customer Email", "Date", "Amount"]
    const csvData = sortedInvoices.map((invoice) => [
      invoice.invoice_number,
      invoice.customer_details?.email,
      new Date(invoice.created_at).toLocaleDateString(),
      invoice.total.toFixed(2)
    ])

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "pending_invoices.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewInvoice = (id) => {
    window.location.href = `/dashboard/invoice/${id}`
  }

  const handleDownloadInvoice = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  }

  const handleApproveInvoice = async (id) => {
    try {
      const result = await updateInvoiceStatus(id, "Approved");
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Invoice approved successfully",
          variant: "default",
        });
        // Refresh the invoice list
        const data = await getPendingInvoices();
        setInvoices(data.invoices || []);
      } else {
        throw new Error(result.message || "Failed to approve invoice");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve invoice. Please check inventory levels.",
        variant: "destructive",
      });
    }
  }

  const handleRejectInvoice = async (id) => {
    try {
      const result = await updateInvoiceStatus(id, "Rejected");
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Invoice rejected successfully",
          variant: "default",
        });
        // Refresh the invoice list
        const data = await getPendingInvoices();
        setInvoices(data.invoices || []);
      } else {
        throw new Error(result.message || "Failed to reject invoice");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invoice",
        variant: "destructive",
      });
    }
  }

  // Calculate statistics
  const pendingInvoices = invoices.filter(inv => inv.invoice_status === "Pending")
  const flaggedInvoices = invoices.filter(inv => inv.invoice_status === "Flagged")
  
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const flaggedAmount = flaggedInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const totalPendingValue = pendingAmount + flaggedAmount

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span>Total Invoices</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Pending</span>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                  Low Confidence
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              ${pendingAmount.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Flagged</span>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-red-50 text-red-700 border-red-200">
                  Inventory Issue
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              ${flaggedAmount.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Total Amount</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Pending Approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            onClick={exportToCSV}
            size="sm"
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 px-4 py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left w-[20%]">Invoice Number</TableHead>
                <TableHead className="text-left w-[25%]">Customer Email</TableHead>
                <TableHead className="text-center w-[15%]">Status</TableHead>
                <TableHead className="text-center w-[15%]">Date</TableHead>
                <TableHead className="text-center w-[15%]">Amount</TableHead>
                <TableHead className="text-center w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_details.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={`px-3 py-1 ${
                          invoice.invoice_status === "Pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {invoice.invoice_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      ${invoice.total?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                        {invoice.pdf_url && (
                          <>
                            <Button
                              onClick={() => handleViewInvoice(invoice._id)}
                              size="sm"
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 px-4 py-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                          </>
                        )}
                        <Button
                          onClick={() => handleApproveInvoice(invoice._id)}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 px-4 py-2"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectInvoice(invoice._id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 px-4 py-2"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}