"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, MoreVertical, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dummy data for inventory
const dummyInventory = [
  {
    id: "ITEM-001",
    name: "Office Chair",
    sku: "FURN-001",
    category: "Furniture",
    quantity: 15,
    reorderLevel: 5,
    unitPrice: 250.0,
    supplier: "Furniture Depot",
  },
  {
    id: "ITEM-002",
    name: "Desk",
    sku: "FURN-002",
    category: "Furniture",
    quantity: 8,
    reorderLevel: 3,
    unitPrice: 450.0,
    supplier: "Furniture Depot",
  },
  {
    id: "ITEM-003",
    name: "Laptop",
    sku: "TECH-001",
    category: "Electronics",
    quantity: 12,
    reorderLevel: 5,
    unitPrice: 1299.99,
    supplier: "Tech Solutions Inc.",
  },
  {
    id: "ITEM-004",
    name: "Monitor",
    sku: "TECH-002",
    category: "Electronics",
    quantity: 20,
    reorderLevel: 8,
    unitPrice: 349.99,
    supplier: "Tech Solutions Inc.",
  },
  {
    id: "ITEM-005",
    name: "Keyboard",
    sku: "TECH-003",
    category: "Electronics",
    quantity: 25,
    reorderLevel: 10,
    unitPrice: 89.99,
    supplier: "Tech Solutions Inc.",
  },
  {
    id: "ITEM-006",
    name: "Paper (A4)",
    sku: "SUPP-001",
    category: "Office Supplies",
    quantity: 50,
    reorderLevel: 20,
    unitPrice: 45.99,
    supplier: "Office Supplies Co.",
  },
  {
    id: "ITEM-007",
    name: "Pens (Box)",
    sku: "SUPP-002",
    category: "Office Supplies",
    quantity: 30,
    reorderLevel: 15,
    unitPrice: 12.5,
    supplier: "Office Supplies Co.",
  },
  {
    id: "ITEM-008",
    name: "Notebooks",
    sku: "SUPP-003",
    category: "Office Supplies",
    quantity: 40,
    reorderLevel: 20,
    unitPrice: 8.75,
    supplier: "Office Supplies Co.",
  },
  {
    id: "ITEM-009",
    name: "Filing Cabinet",
    sku: "FURN-003",
    category: "Furniture",
    quantity: 6,
    reorderLevel: 2,
    unitPrice: 175.0,
    supplier: "Furniture Depot",
  },
  {
    id: "ITEM-010",
    name: "Mouse",
    sku: "TECH-004",
    category: "Electronics",
    quantity: 18,
    reorderLevel: 8,
    unitPrice: 45.99,
    supplier: "Tech Solutions Inc.",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    supplier: "",
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInventory(dummyInventory)
      setLoading(false)
    }, 1000)
  }, [])

  // Handle search
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddItem = () => {
    setIsEditMode(false)
    setFormData({
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      reorderLevel: 0,
      unitPrice: 0,
      supplier: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item) => {
    setIsEditMode(true)
    setCurrentItem(item)
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteItem = (itemId) => {
    setInventory((prevInventory) => prevInventory.filter((item) => item.id !== itemId))
    toast({
      title: "Item Deleted",
      description: "The inventory item has been deleted successfully.",
      variant: "destructive",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "reorderLevel" || name === "unitPrice" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditMode) {
      // Update existing item
      setInventory((prevInventory) =>
        prevInventory.map((item) => (item.id === currentItem.id ? { ...item, ...formData } : item)),
      )
      toast({
        title: "Item Updated",
        description: `${formData.name} has been updated successfully.`,
      })
    } else {
      // Add new item
      const newItem = {
        id: `ITEM-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        ...formData,
      }
      setInventory((prev) => [...prev, newItem])
      toast({
        title: "Item Added",
        description: `${formData.name} has been added to inventory.`,
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Manage your product inventory</CardDescription>
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search inventory..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                        {item.quantity <= item.reorderLevel && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 inline ml-1" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.reorderLevel}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
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

      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of the inventory item"
                : "Fill in the details to add a new inventory item"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reorderLevel" className="text-right">
                  Reorder Level
                </Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitPrice" className="text-right">
                  Unit Price ($)
                </Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditMode ? "Save Changes" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

