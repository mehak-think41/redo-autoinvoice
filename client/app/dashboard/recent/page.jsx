"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  Download,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Dummy data for recent invoices
const dummyInvoices = [
  {
    id: "INV-001",
    vendor: "Office Supplies Co.",
    date: "2025-03-10",
    amount: 1250.99,
    status: "new",
    items: 12,
  },
  {
    id: "INV-002",
    vendor: "Tech Solutions Inc.",
    date: "2025-03-09",
    amount: 3499.5,
    status: "processing",
    items: 3,
  },
  {
    id: "INV-003",
    vendor: "Furniture Depot",
    date: "2025-03-08",
    amount: 5750.0,
    status: "new",
    items: 5,
  },
  {
    id: "INV-004",
    vendor: "Marketing Services LLC",
    date: "2025-03-07",
    amount: 2100.0,
    status: "processing",
    items: 1,
  },
  {
    id: "INV-005",
    vendor: "Catering Express",
    date: "2025-03-06",
    amount: 875.25,
    status: "new",
    items: 8,
  },
  {
    id: "INV-006",
    vendor: "Cleaning Services Pro",
    date: "2025-03-05",
    amount: 450.0,
    status: "processing",
    items: 2,
  },
  {
    id: "INV-007",
    vendor: "Software Solutions",
    date: "2025-03-04",
    amount: 1899.99,
    status: "new",
    items: 1,
  },
  {
    id: "INV-008",
    vendor: "Office Furniture Inc.",
    date: "2025-03-03",
    amount: 3250.75,
    status: "processing",
    items: 7,
  },
  {
    id: "INV-009",
    vendor: "IT Support Services",
    date: "2025-03-02",
    amount: 1500.0,
    status: "new",
    items: 1,
  },
  {
    id: "INV-010",
    vendor: "Shipping & Logistics Co.",
    date: "2025-03-01",
    amount: 750.5,
    status: "processing",
    items: 4,
  },
];

export default function RecentInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(dummyInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle search
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status) => {
    return (
      <div className="flex justify-center items-center space-x-2">
        <Badge
          className={`px-3 py-1 font-medium border transition-colors rounded-lg ${
            status === "new"
              ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              : status === "processing"
              ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
              : status === "approved"
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
              : status === "rejected"
              ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Recently Received Invoices</CardTitle>
            <CardDescription>
              View and manage your latest incoming invoices
            </CardDescription>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
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
                  <TableHead
                    className="w-[100px] cursor-pointer"
                    onClick={() => requestSort("id")}
                  >
                    Invoice #
                    {sortConfig.key === "id" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("vendor")}
                  >
                    Vendor
                    {sortConfig.key === "vendor" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    Date
                    {sortConfig.key === "date" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("amount")}
                  >
                    Amount
                    {sortConfig.key === "amount" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    Status
                    {sortConfig.key === "status" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("items")}
                  >
                    Items
                    {sortConfig.key === "items" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : sortedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.vendor}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.items}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 w-48"
                          >
                            <DropdownMenuLabel className="text-gray-700 dark:text-gray-300 px-2 py-1 font-semibold">
                              Actions
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              asChild
                              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              <a
                                href={`/dashboard/invoice/${invoice.id}`}
                                className="flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                                <span>View details</span>
                              </a>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-100 dark:hover:bg-green-700 transition">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                              <span>Approve</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-700 transition">
                              <XCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                              <span>Reject</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2 border-gray-200 dark:border-gray-700" />

                            <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-700 transition">
                              <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Download PDF</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
