"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Download, Search, Plus, Pencil, Save, X, Trash2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getAllInventory, createInventory, updateInventory, deleteInventory, sendSupplierOrder } from "@/lib/inventoryApi"

// Add Item Modal Component
const AddItemModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newItem = {
      sku: formData.get("sku"),
      name: formData.get("name"),
      quantity: Number.parseInt(formData.get("quantity")),
      unitPrice: Number.parseFloat(formData.get("unitPrice")),
      supplierEmail: formData.get("supplierEmail"),
    };
    
    onSubmit(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-[600px] p-6">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h2 className="text-xl font-semibold">Add New Item</h2>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to add a new inventory item.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="sku" className="text-sm font-medium">
                SKU
              </label>
              <Input
                id="sku"
                name="sku"
                className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="Enter SKU"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="Enter item name"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="Enter quantity"
                required
              />
            </div>
            <div>
              <label htmlFor="unitPrice" className="text-sm font-medium">
                Unit Price
              </label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="Enter unit price"
                required
              />
            </div>
            <div>
              <label htmlFor="supplierEmail" className="text-sm font-medium">
                Supplier Email
              </label>
              <Input
                id="supplierEmail"
                name="supplierEmail"
                type="email"
                className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                placeholder="Enter supplier email"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 mt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="px-4 py-2 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Supplier Order Modal Component
const SupplierOrderModal = ({ isOpen, onClose, item, onSubmit }) => {
  if (!isOpen) return null;

  const [quantity, setQuantity] = useState(1);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      supplierEmail: item.supplierEmail,
      skus: [{
        code: item.sku,
        name: item.name,
        quantity: parseInt(quantity),
        specifications: item.specifications
      }],
      additionalNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-[500px] p-6">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h2 className="text-xl font-semibold">Order from Supplier</h2>
          <p className="text-sm text-muted-foreground">
            Send order request to supplier for {item.name}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">SKU</label>
              <Input value={item.sku} disabled className="w-full mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Item Name</label>
              <Input value={item.name} disabled className="w-full mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Supplier Email</label>
              <Input value={item.supplierEmail} disabled className="w-full mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Order Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full mt-1.5"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full mt-1.5 min-h-[100px] p-2 border rounded-md"
                placeholder="Enter any additional notes or specifications..."
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="h-4 w-4 mr-1" />
                Send Order
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "lastUpdated", direction: "desc" })
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isSupplierOrderOpen, setIsSupplierOrderOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const data = await getAllInventory()
      setItems(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      })
      console.error("Error fetching inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.quantity?.toString() || "").includes(searchTerm),
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortConfig.key) {
      case "quantity":
        return sortConfig.direction === "asc"
          ? (a.quantity || 0) - (b.quantity || 0)
          : (b.quantity || 0) - (a.quantity || 0)
      case "unitPrice":
        return sortConfig.direction === "asc"
          ? (a.unitPrice || 0) - (b.unitPrice || 0)
          : (b.unitPrice || 0) - (a.unitPrice || 0)
      case "lastUpdated":
        return sortConfig.direction === "asc"
          ? new Date(a.lastUpdated || 0) - new Date(b.lastUpdated || 0)
          : new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
      default:
        return 0
    }
  })

  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return (
        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortConfig.direction === "asc" ? "transform rotate-180" : "")} />
      )
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
  }

  const handleViewItem = (id) => {
    toast({
      title: "View Item",
      description: `Viewing details for item ${id}`,
    })
  }

  const handleDownloadReport = (id) => {
    toast({
      title: "Download Report",
      description: `Downloading report for item ${id}`,
    })
  }

  const handleAddItem = async (newItem) => {
    try {
      await createInventory(newItem)
      await fetchInventory() // Refresh the inventory list
      setIsAddItemOpen(false)
      toast({
        title: "Success",
        description: "Item added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add item",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setEditForm({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplierEmail: item.supplierEmail,
    })
  }

  const handleSave = async (id) => {
    try {
      const updatedData = {
        ...editForm,
        quantity: Number.parseInt(editForm.quantity),
        unitPrice: Number.parseFloat(editForm.unitPrice),
      }

      await updateInventory(id, updatedData)
      await fetchInventory() // Refresh the inventory list

      setEditingId(null)
      setEditForm({})

      toast({
        title: "Success",
        description: "Item updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update item",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (id) => {
    try {
      await deleteInventory(id)
      await fetchInventory() // Refresh the inventory list

      toast({
        title: "Item Deleted",
        description: "The item has been permanently removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  const exportToCSV = () => {
    toast({
      title: "Export CSV",
      description: "Exporting inventory to CSV",
    })
    const headers = ["SKU", "Name", "Quantity", "Unit Price", "Supplier Email", "Last Updated"]
    const csvData = sortedItems.map((item) => [
      item.sku,
      item.name,
      item.quantity,
      item.unitPrice,
      item.supplierEmail,
      new Date(item.lastUpdated).toLocaleDateString(),
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "inventory.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSupplierOrder = async (orderData) => {
    try {
      await sendSupplierOrder(orderData);
      setIsSupplierOrderOpen(false);
      toast({
        title: "Order Sent",
        description: "Purchase order has been sent to the supplier",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send order to supplier",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 0), 0)
  const lowStock = items.filter((item) => (item.quantity || 0) < 10).length
  const averageStock = items.length > 0 ? Math.round(totalItems / items.length) : 0
  const outOfStock = items.filter((item) => (item.quantity || 0) === 0).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">across {items.length} SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock}</div>
            <p className="text-xs text-muted-foreground">items below threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStock}</div>
            <p className="text-xs text-muted-foreground">per SKU</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStock}</div>
            <p className="text-xs text-muted-foreground">items to reorder</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => setIsAddItemOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left w-[20%]">SKU</TableHead>
                <TableHead className="text-left w-[20%]">Name</TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("quantity")}>
                  <div className="flex items-center justify-center">Quantity {getSortIcon("quantity")}</div>
                </TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("unitPrice")}>
                  <div className="flex items-center justify-center">Unit Price {getSortIcon("unitPrice")}</div>
                </TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("lastUpdated")}>
                  <div className="flex items-center justify-center">Last Updated {getSortIcon("lastUpdated")}</div>
                </TableHead>
                <TableHead className="text-center w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading inventory data...
                  </TableCell>
                </TableRow>
              ) : sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/50">
                    <TableCell className="text-left">
                      {editingId === item._id ? (
                        <Input
                          name="sku"
                          value={editForm.sku}
                          onChange={handleInputChange}
                          className="w-full border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      ) : (
                        item.sku
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      {editingId === item._id ? (
                        <Input
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === item._id ? (
                        <Input
                          name="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={handleInputChange}
                          className="w-[100px] mx-auto text-center border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      ) : (
                        <div
                          className={cn(
                            "inline-flex items-center justify-center rounded-full px-3 py-1",
                            (item.quantity || 0) === 0
                              ? "bg-gray-50 text-gray-700"
                              : (item.quantity || 0) < 10
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700",
                          )}
                        >
                          {item.quantity || 0}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === item._id ? (
                        <Input
                          name="unitPrice"
                          type="number"
                          step="0.01"
                          value={editForm.unitPrice}
                          onChange={handleInputChange}
                          className="w-[100px] mx-auto text-center border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      ) : (
                        <>${(item.unitPrice || 0).toFixed(2)}</>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        {editingId === item._id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-4 py-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              onClick={() => handleSave(item._id)}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-4 py-2 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsSupplierOrderOpen(true);
                              }}
                              title="Order from supplier"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-4 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onSubmit={handleAddItem}
      />

      <SupplierOrderModal
        isOpen={isSupplierOrderOpen}
        onClose={() => setIsSupplierOrderOpen(false)}
        item={selectedItem}
        onSubmit={handleSupplierOrder}
      />
    </div>
  )
}
