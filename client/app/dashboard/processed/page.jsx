"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Download, Eye, FileDown, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProcessedInvoices } from "@/lib/api"

export default function ProcessedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch processed invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getProcessedInvoices();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        toast({
          title: "Error",
          description: "Failed to load processed invoices.",
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
      (invoice.vendor_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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
    const headers = ["Invoice Number", "Vendor", "Date", "Amount"]
    const csvData = sortedInvoices.map((invoice) => [
      invoice.invoice_number,
      invoice.vendor_name,
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
    link.setAttribute("download", "processed_invoices.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewInvoice = (id) => {
    window.location.href = `/dashboard/invoice/${id}`
  }

  const handleDownloadInvoice = (invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "PDF not available for this invoice.",
        variant: "destructive",
      });
    }
  }

  // Calculate statistics
  const approvedInvoices = invoices.filter(inv => inv.invoice_status === "Approved")
  const rejectedInvoices = invoices.filter(inv => inv.invoice_status === "Rejected")
  
  const totalApprovedAmount = approvedInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const averageApprovedAmount = approvedInvoices.length ? totalApprovedAmount / approvedInvoices.length : 0
  const totalRejectedAmount = rejectedInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const totalProcessed = invoices.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {approvedInvoices.length} approved, {rejectedInvoices.length} rejected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(averageApprovedAmount).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per approved invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalApprovedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">approved value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (Rejected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRejectedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">rejected value</p>
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
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
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
                <TableHead className="text-left w-[20%]">Customer</TableHead>
                <TableHead className="text-center w-[15%]">Status</TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("date")}>
                  <div className="flex items-center justify-center">
                    Date {getSortIcon("date")}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("amount")}>
                  <div className="flex items-center justify-center">
                    Amount {getSortIcon("amount")}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[15%]">Actions</TableHead>
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
                        variant={invoice.invoice_status === "Approved" ? "success" : "destructive"}
                        className={`px-3 py-1 ${
                          invoice.invoice_status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                          onClick={() => handleViewInvoice(invoice._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          Download
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