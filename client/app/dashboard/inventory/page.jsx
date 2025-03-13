"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { ArrowUpDown, Download, Eye, FileDown, Search, Plus, Pencil, Save, X, Trash2 } from "lucide-react"
import { useToast } from "../../../hooks/use-toast"
import { cn } from "../../../lib/utils"
import { inventory, gapAnalysis } from "../../../data/mockData"

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [gaps, setGaps] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    setItems(inventory || [])
    setGaps(gapAnalysis || [])
  }, [])

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.quantity.toString().includes(searchTerm)
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortConfig.key) {
      case "date":
        return sortConfig.direction === "asc"
          ? new Date(a.lastUpdated) - new Date(b.lastUpdated)
          : new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case "quantity":
        return sortConfig.direction === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity
      case "lastUpdated":
        return sortConfig.direction === "asc"
          ? new Date(a.lastUpdated) - new Date(b.lastUpdated)
          : new Date(b.lastUpdated) - new Date(a.lastUpdated)
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
        <ArrowUpDown
          className={cn(
            "ml-2 h-4 w-4",
            sortConfig.direction === "asc" ? "transform rotate-180" : ""
          )}
        />
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

  const handleAddItem = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newItem = {
      id: items.length + 1,
      sku: formData.get("sku"),
      name: formData.get("name"),
      quantity: parseInt(formData.get("quantity")),
      reorderPoint: parseInt(formData.get("reorderPoint")),
      description: formData.get("description"),
      lastUpdated: new Date().toISOString()
    }
    setItems([...items, newItem])
    setIsAddItemOpen(false)
    toast({
      title: "Success",
      description: "Item added successfully",
    })
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint
    })
  }

  const handleSave = (id) => {
    setItems(items.map(item => 
      item.id === id 
        ? { 
            ...item, 
            ...editForm,
            quantity: parseInt(editForm.quantity),
            reorderPoint: parseInt(editForm.reorderPoint),
            lastUpdated: new Date().toISOString()
          }
        : item
    ))
    setEditingId(null)
    setEditForm({})
    toast({
      title: "Success",
      description: "Item updated successfully"
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id))
    toast({
      title: "Item Deleted",
      description: "The item has been permanently removed.",
      variant: "destructive"
    })
  }

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const exportToCSV = () => {
    toast({
      title: "Export CSV",
      description: "Exporting inventory to CSV",
    })
    const headers = ["SKU", "Name", "Quantity", "Last Updated"]
    const csvData = sortedItems.map((item) => [
      item.sku,
      item.name,
      item.quantity,
      new Date(item.lastUpdated).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n")

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

  // Calculate statistics
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const lowStock = items.filter(item => item.quantity < (item.reorderPoint || 10)).length
  const averageStock = items.length > 0 ? Math.round(totalItems / items.length) : 0
  const outOfStock = items.filter(item => item.quantity === 0).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              across {items.length} SKUs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock}</div>
            <p className="text-xs text-muted-foreground">
              items below threshold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStock}</div>
            <p className="text-xs text-muted-foreground">
              per SKU
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              items to reorder
            </p>
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
                <TableHead className="text-left w-[25%]">Name</TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("quantity")}>
                  <div className="flex items-center justify-center">
                    Quantity {getSortIcon("quantity")}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[15%] cursor-pointer" onClick={() => requestSort("lastUpdated")}>
                  <div className="flex items-center justify-center">
                    Last Updated {getSortIcon("lastUpdated")}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[25%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="text-left">
                      {editingId === item.id ? (
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
                      {editingId === item.id ? (
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
                      {editingId === item.id ? (
                        <Input
                          name="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={handleInputChange}
                          className="w-[100px] mx-auto text-center border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        {editingId === item.id ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="px-4 py-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              onClick={() => handleSave(item.id)}
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
                              className="px-4 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() => handleDelete(item.id)}
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

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="mt-4 space-y-4">
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
                  <label htmlFor="reorderPoint" className="text-sm font-medium">
                    Reorder Point
                  </label>
                  <Input
                    id="reorderPoint"
                    name="reorderPoint"
                    type="number"
                    min="0"
                    className="w-full mt-1.5 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                    placeholder="Enter reorder point"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full mt-1.5 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
                    placeholder="Enter item description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button"
                  size="sm" 
                  variant="outline"
                  className="px-4 py-2 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => setIsAddItemOpen(false)}
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
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
