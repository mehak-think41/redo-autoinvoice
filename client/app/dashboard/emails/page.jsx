"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Mail, Reply, Trash2, Search } from "lucide-react"

// Dummy data for return emails
const dummyEmails = [
  {
    id: "EMAIL-001",
    subject: "Invoice INV-103 Rejection Notice",
    recipient: "furniture.depot@example.com",
    date: "2025-03-08",
    status: "sent",
    content: `Dear Furniture Depot,

We regret to inform you that invoice INV-103 dated 2025-02-27 has been rejected due to the following reason(s):

- Pricing discrepancy on office chairs
- Missing purchase order reference

Please address these issues and resubmit the invoice at your earliest convenience.

Best regards,
Accounts Payable Team
InvoiceAI`,
  },
  {
    id: "EMAIL-002",
    subject: "Invoice INV-106 Rejection Notice",
    recipient: "cleaning.services@example.com",
    date: "2025-03-05",
    status: "sent",
    content: `Dear Cleaning Services Pro,

We regret to inform you that invoice INV-106 dated 2025-02-24 has been rejected due to the following reason(s):

- Service date discrepancy
- Incorrect billing address

Please address these issues and resubmit the invoice at your earliest convenience.

Best regards,
Accounts Payable Team
InvoiceAI`,
  },
  {
    id: "EMAIL-003",
    subject: "Invoice INV-109 Rejection Notice",
    recipient: "itsupport@example.com",
    date: "2025-03-02",
    status: "sent",
    content: `Dear IT Support Services,

We regret to inform you that invoice INV-109 dated 2025-02-21 has been rejected due to the following reason(s):

- Unauthorized service charges
- Missing service agreement reference

Please address these issues and resubmit the invoice at your earliest convenience.

Best regards,
Accounts Payable Team
InvoiceAI`,
  },
  {
    id: "EMAIL-004",
    subject: "Invoice Payment Confirmation: INV-101",
    recipient: "office.supplies@example.com",
    date: "2025-03-01",
    status: "sent",
    content: `Dear Office Supplies Co.,

This email confirms that payment for invoice INV-101 dated 2025-03-01 has been processed. The payment of $1,250.99 will be transferred to your account within 3-5 business days.

Thank you for your business.

Best regards,
Accounts Payable Team
InvoiceAI`,
  },
  {
    id: "EMAIL-005",
    subject: "Invoice Query: INV-202",
    recipient: "tech.solutions@example.com",
    date: "2025-03-09",
    status: "draft",
    content: `Dear Tech Solutions Inc.,

We are reviewing invoice INV-202 dated 2025-03-09 and have identified a price discrepancy on the monitors listed. According to our purchase agreement, the unit price should be $299.99 instead of $349.99.

Could you please verify this and send a corrected invoice if necessary?

Best regards,
Accounts Payable Team
InvoiceAI`,
  },
]

export default function EmailsPage() {
  const [emails, setEmails] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmails(dummyEmails)
      setLoading(false)
    }, 1000)
  }, [])

  // Handle search
  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewEmail = (email) => {
    setSelectedEmail(email)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Sent
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Draft
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Return Emails</CardTitle>
          <CardDescription>View emails sent to vendors regarding invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading emails...
                    </TableCell>
                  </TableRow>
                ) : filteredEmails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No emails found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell>{email.recipient}</TableCell>
                      <TableCell>{new Date(email.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewEmail(email)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">View</span>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Reply className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Reply</span>
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Email Details Dialog */}
      {selectedEmail && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedEmail.subject}</DialogTitle>
              <DialogDescription>
                Sent to: {selectedEmail.recipient} on {new Date(selectedEmail.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-md p-4 whitespace-pre-line">{selectedEmail.content}</div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Forward
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

