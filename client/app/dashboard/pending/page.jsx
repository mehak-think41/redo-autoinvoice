"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Download, Eye, CheckCircle, XCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPendingInvoices } from "@/lib/api"
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

  const handleApproveInvoice = async (id) => {
    try {
      await approveInvoice(id);
      toast({
        title: "Success",
        description: "Invoice approved successfully",
        variant: "default",
      });
      const data = await getPendingInvoices();
      setInvoices(data.invoices || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve invoice",
        variant: "destructive",
      });
    }
  }

  const handleRejectInvoice = async (id) => {
    try {
      await rejectInvoice(id);
      toast({
        title: "Success",
        description: "Invoice rejected successfully",
        variant: "default",
      });
      const data = await getPendingInvoices();
      setInvoices(data.invoices || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject invoice",
        variant: "destructive",
      });
    }
  }

  // Calculate statistics
  const totalPending = invoices.length
  const totalAmount = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">pending approval</p>
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
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[25%]">Invoice Number</TableHead>
                <TableHead className="w-[25%]">Customer Email</TableHead>
                <TableHead className="w-[15%] text-center cursor-pointer" onClick={() => requestSort("date")}>
                  <div className="flex items-center justify-center">
                    Date {getSortIcon("date")}
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-center cursor-pointer" onClick={() => requestSort("amount")}>
                  <div className="flex items-center justify-center">
                    Amount {getSortIcon("amount")}
                  </div>
                </TableHead>
                <TableHead className="w-[20%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice) => (
                  <TableRow key={invoice._id} className="hover:bg-muted/50">
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_details?.email}</TableCell>
                    <TableCell className="text-center">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      ${invoice.total?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        {invoice.pdf_url && (
                          <Button
                            onClick={() => handleViewInvoice(invoice._id)}
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          onClick={() => handleApproveInvoice(invoice._id)}
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectInvoice(invoice._id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
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

        {/* Status Badge Legend */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
              Pending
            </Badge>
            <span className="ml-2 text-muted-foreground">Low confidence score</span>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
              Flagged
            </Badge>
            <span className="ml-2 text-muted-foreground">No approved because of shortage in inventory</span>
          </div>
        </div>
      </div>
    </div>
  )
}