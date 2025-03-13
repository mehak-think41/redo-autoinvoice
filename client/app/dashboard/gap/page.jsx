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
import { AlertTriangle, CheckCircle, FileText, Search, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dummy data for GAP analysis
const dummyGapItems = [
  {
    id: "GAP-001",
    invoiceId: "INV-202",
    item: "Monitor",
    requiredQuantity: 5,
    availableQuantity: 2,
    shortageQuantity: 3,
    unitPrice: 349.99,
    totalShortageValue: 1049.97,
    status: "pending",
    vendor: "Tech Solutions Inc.",
  },
  {
    id: "GAP-002",
    invoiceId: "INV-203",
    item: "Office Chair",
    requiredQuantity: 10,
    availableQuantity: 5,
    shortageQuantity: 5,
    unitPrice: 250.0,
    totalShortageValue: 1250.0,
    status: "ordered",
    vendor: "Furniture Depot",
  },
  {
    id: "GAP-003",
    invoiceId: "INV-205",
    item: "Paper (A4)",
    requiredQuantity: 30,
    availableQuantity: 20,
    shortageQuantity: 10,
    unitPrice: 45.99,
    totalShortageValue: 459.9,
    status: "pending",
    vendor: "Office Supplies Co.",
  },
  {
    id: "GAP-004",
    invoiceId: "INV-204",
    item: "Laptop",
    requiredQuantity: 3,
    availableQuantity: 1,
    shortageQuantity: 2,
    unitPrice: 1299.99,
    totalShortageValue: 2599.98,
    status: "ordered",
    vendor: "Tech Solutions Inc.",
  },
  {
    id: "GAP-005",
    invoiceId: "INV-201",
    item: "Pens (Box)",
    requiredQuantity: 20,
    availableQuantity: 15,
    shortageQuantity: 5,
    unitPrice: 12.5,
    totalShortageValue: 62.5,
    status: "pending",
    vendor: "Office Supplies Co.",
  },
]

// Dummy data for purchase orders
const dummyPurchaseOrders = [
  {
    id: "PO-001",
    vendor: "Tech Solutions Inc.",
    date: "2025-03-08",
    status: "sent",
    items: [
      { name: "Monitor", quantity: 10, unitPrice: 349.99 },
      { name: "Laptop", quantity: 5, unitPrice: 1299.99 },
    ],
    total: 9999.85,
  },
  {
    id: "PO-002",
    vendor: "Furniture Depot",
    date: "2025-03-07",
    status: "sent",
    items: [
      { name: "Office Chair", quantity: 8, unitPrice: 250.0 },
      { name: "Desk", quantity: 5, unitPrice: 450.0 },
    ],
    total: 4250.0,
  },
  {
    id: "PO-003",
    vendor: "Office Supplies Co.",
    date: "2025-03-06",
    status: "draft",
    items: [
      { name: "Paper (A4)", quantity: 20, unitPrice: 45.99 },
      { name: "Pens (Box)", quantity: 15, unitPrice: 12.5 },
      { name: "Notebooks", quantity: 30, unitPrice: 8.75 },
    ],
    total: 1307.3,
  },
]

export default function GapAnalysisPage() {
  const [gapItems, setGapItems] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGapItems(dummyGapItems)
      setPurchaseOrders(dummyPurchaseOrders)
      setLoading(false)
    }, 1000)
  }, [])

  // Handle search
  const filteredGapItems = gapItems.filter(
    (item) =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateOrder = (item) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handlePlaceOrder = () => {
    // Update the status of the selected item
    setGapItems((prevItems) =>
      prevItems.map((item) => (item.id === selectedItem.id ? { ...item, status: "ordered" } : item)),
    )

    // Create a new purchase order (in a real app, this would be more complex)
    const newPO = {
      id: `PO-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      vendor: selectedItem.vendor,
      date: new Date().toISOString().split("T")[0],
      status: "sent",
      items: [{ name: selectedItem.item, quantity: selectedItem.shortageQuantity, unitPrice: selectedItem.unitPrice }],
      total: selectedItem.totalShortageValue,
    }

    setPurchaseOrders((prev) => [...prev, newPO])

    setIsDialogOpen(false)
    toast({
      title: "Purchase Order Created",
      description: `Order for ${selectedItem.shortageQuantity} ${selectedItem.item}(s) has been created.`,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ordered
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="shortages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shortages">Inventory Shortages</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="shortages">
          <Card>
            <CardHeader>
              <CardTitle>GAP Analysis</CardTitle>
              <CardDescription>Identify inventory shortages for flagged invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shortages..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Required</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">Shortage</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          Loading shortages...
                        </TableCell>
                      </TableRow>
                    ) : filteredGapItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No shortages found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGapItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.invoiceId}</TableCell>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell className="text-right">{item.requiredQuantity}</TableCell>
                          <TableCell className="text-right">{item.availableQuantity}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{item.shortageQuantity}</TableCell>
                          <TableCell className="text-right">${item.totalShortageValue.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            {item.status === "pending" ? (
                              <Button variant="outline" size="sm" onClick={() => handleCreateOrder(item)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Order
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ordered
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>View and manage purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading purchase orders...
                        </TableCell>
                      </TableRow>
                    ) : purchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No purchase orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.vendor}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                order.status === "sent"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {order.status === "sent" ? "Sent" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>Order additional inventory to fulfill the shortage</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Item</h4>
                    <p className="text-lg font-medium">{selectedItem.item}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Vendor</h4>
                    <p className="text-lg font-medium">{selectedItem.vendor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Quantity to Order</h4>
                    <p className="text-lg font-medium">{selectedItem.shortageQuantity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Unit Price</h4>
                    <p className="text-lg font-medium">${selectedItem.unitPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total</h4>
                    <p className="text-lg font-medium">${selectedItem.totalShortageValue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Note
                  </h4>
                  <p className="text-amber-700 mt-1">
                    This will create a purchase order for {selectedItem.shortageQuantity} {selectedItem.item}(s) from{" "}
                    {selectedItem.vendor}.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePlaceOrder}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Place Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

