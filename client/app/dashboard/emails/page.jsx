"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Mail, Reply, Trash2, Search } from "lucide-react"
import { returnEmails } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"

export default function EmailsPage() {
  const [emails, setEmails] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Use mock data instead of dummy data
    setEmails(returnEmails)
    setLoading(false)
  }, [])

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewEmail = (email) => {
    setSelectedEmail(email)
    setIsDialogOpen(true)
    toast({
      title: "Opening Email",
      description: `Opening email #${email.id}`,
    })
  }

  const handleReplyEmail = (email) => {
    toast({
      title: "Composing Reply",
      description: `Replying to email #${email.id}`,
    })
  }

  const handleDeleteEmail = (email) => {
    toast({
      title: "Email Deleted",
      description: `Email #${email.id} has been deleted`,
      variant: "destructive",
    })
  }

  const getStatusBadge = (status) => {
    return (
      <Badge
        variant={status === "unread" ? "default" : "secondary"}
        className={`px-3 py-1 ${
          status === "unread"
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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
            <Button
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => setIsComposeOpen(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left w-[30%]">Subject</TableHead>
                  <TableHead className="text-left w-[25%]">Sender</TableHead>
                  <TableHead className="text-center w-[15%]">Date</TableHead>
                  <TableHead className="text-center w-[15%]">Status</TableHead>
                  <TableHead className="text-center w-[15%]">Actions</TableHead>
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
                      <TableCell className="text-left font-medium">{email.subject}</TableCell>
                      <TableCell className="text-left">{email.sender}</TableCell>
                      <TableCell className="text-center">{new Date(email.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(email.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                            onClick={() => handleViewEmail(email)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-4 py-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleReplyEmail(email)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-4 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                            onClick={() => handleDeleteEmail(email)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {selectedEmail?.subject}
              </DialogTitle>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>{selectedEmail?.sender}</span>
                <span>{selectedEmail && new Date(selectedEmail.date).toLocaleDateString()}</span>
              </div>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="text-sm">
                {selectedEmail?.content}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="px-4 py-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                  onClick={() => {
                    handleReplyEmail(selectedEmail)
                    setIsDialogOpen(false)
                  }}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="px-4 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                  onClick={() => {
                    handleDeleteEmail(selectedEmail)
                    setIsDialogOpen(false)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Compose New Email
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="to" className="text-sm font-medium">
                  To
                </label>
                <Input
                  id="to"
                  className="mt-1.5"
                  placeholder="Enter recipient email"
                />
              </div>
              <div>
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  className="mt-1.5"
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full mt-1.5 min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                size="sm" 
                variant="outline"
                className="px-4 py-2 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setIsComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                onClick={() => {
                  toast({
                    title: "Email Sent",
                    description: "Your email has been sent successfully.",
                  })
                  setIsComposeOpen(false)
                }}
              >
                <Mail className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
