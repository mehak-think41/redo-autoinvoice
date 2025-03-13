"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Download, Eye, Search, CheckCircle, XCircle } from "lucide-react"
import { pendingInvoices } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"

export default function PendingInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const { toast } = useToast()

  const filteredInvoices = pendingInvoices.filter(
    (invoice) =>
      (invoice.number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (invoice.company?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      invoice.amount?.toString().includes(searchTerm)
  )

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortConfig.key) {
      case "date":
        return sortConfig.direction === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      case "amount":
        return sortConfig.direction === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount
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
      return (
        <ArrowUpDown className="h-4 w-4 ml-2" />
      )
    }
    return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />
  }

  const exportToCSV = () => {
    const headers = ["Invoice Number", "Vendor", "Date", "Amount"]
    const csvData = sortedInvoices.map((invoice) => [
      invoice.number,
      invoice.company,
      new Date(invoice.date).toLocaleDateString(),
      invoice.amount.toFixed(2)
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

  const handleApproveInvoice = (id) => {
    toast({
      title: "Invoice Approved",
      description: `Invoice ${id} has been approved successfully.`,
    })
  }

  const handleRejectInvoice = (id) => {
    toast({
      title: "Invoice Rejected",
      description: `Invoice ${id} has been rejected.`,
      variant: "destructive",
    })
  }

  const handleViewInvoice = (id) => {
    // Navigate to invoice details
    window.location.href = `/dashboard/invoice/${id}`
  }

  // Calculate statistics
  const totalAmount = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0)
  const averageAmount = totalAmount / pendingInvoices.length
  const oldestInvoice = Math.max(...pendingInvoices.map(inv => {
    const diffTime = Math.abs(new Date() - new Date(inv.date))
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }))
  const highPriority = pendingInvoices.filter(inv => inv.amount > 10000).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {highPriority} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(averageAmount).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oldest Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oldestInvoice}</div>
            <p className="text-xs text-muted-foreground">days pending</p>
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
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left w-[25%]">Invoice Number</TableHead>
                <TableHead className="text-left w-[25%]">Vendor</TableHead>
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
                <TableHead className="text-center w-[20%]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-left w-[25%]">
                      {invoice.number}
                    </TableCell>
                    <TableCell className="text-left w-[25%]">{invoice.company}</TableCell>
                    <TableCell className="text-center w-[15%]">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center w-[15%]">${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center w-[20%]">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                          onClick={() => handleApproveInvoice(invoice.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-4 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                          onClick={() => handleRejectInvoice(invoice.id)}
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