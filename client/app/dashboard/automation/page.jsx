"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, Settings, Clock, FileText, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AutomationPage() {
  const [automationActive, setAutomationActive] = useState(false)
  const [scanningActive, setScanningActive] = useState(false)
  const [processingActive, setProcessingActive] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanInterval, setScanInterval] = useState(null)
  const [stats, setStats] = useState({
    scanned: 0,
    processed: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
  })
  const { toast } = useToast()

  // Settings
  const [settings, setSettings] = useState({
    autoApproveBelow: 500,
    autoFlagAbove: 5000,
    scanEmailsEnabled: true,
    scanAttachmentsEnabled: true,
    autoReplyEnabled: true,
    notificationsEnabled: true,
  })

  // Recent activity log
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      type: "scan",
      message: "Started scanning for new invoices",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      type: "process",
      message: "Processed INV-201 from Office Supplies Co.",
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 3,
      type: "approve",
      message: "Auto-approved INV-205 from Catering Express ($875.25)",
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
    {
      id: 4,
      type: "flag",
      message: "Flagged INV-202 from Tech Solutions Inc. for review",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 5,
      type: "email",
      message: "Sent confirmation email for INV-201 to office.supplies@example.com",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
    },
  ])

  useEffect(() => {
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval)
      }
    }
  }, [scanInterval])

  const toggleAutomation = () => {
    const newState = !automationActive
    setAutomationActive(newState)

    if (newState) {
      startScanning()
      toast({
        title: "Automation Started",
        description: "Invoice processing automation is now active.",
      })

      // Add to activity log
      addActivityLogEntry({
        type: "system",
        message: "Invoice processing automation started",
      })
    } else {
      stopScanning()
      toast({
        title: "Automation Stopped",
        description: "Invoice processing automation has been stopped.",
      })

      // Add to activity log
      addActivityLogEntry({
        type: "system",
        message: "Invoice processing automation stopped",
      })
    }
  }

  const startScanning = () => {
    setScanningActive(true)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          // When scan completes, simulate finding invoices
          simulateInvoiceFound()
          return 0
        }
        return prev + 10
      })
    }, 1000)

    setScanInterval(interval)

    // Add to activity log
    addActivityLogEntry({
      type: "scan",
      message: "Started scanning for new invoices",
    })
  }

  const stopScanning = () => {
    setScanningActive(false)
    setProcessingActive(false)

    if (scanInterval) {
      clearInterval(scanInterval)
      setScanInterval(null)
    }

    setScanProgress(0)
  }

  const simulateInvoiceFound = () => {
    // Randomly decide if an invoice was found
    if (Math.random() > 0.3) {
      setProcessingActive(true)

      // Update stats
      setStats((prev) => ({
        ...prev,
        scanned: prev.scanned + 1,
      }))

      // Simulate processing delay
      setTimeout(() => {
        setProcessingActive(false)

        // Update stats
        setStats((prev) => ({
          ...prev,
          processed: prev.processed + 1,
        }))

        // Randomly decide the outcome
        const outcome = Math.random()
        let type, message

        if (outcome < 0.6) {
          // Approved
          type = "approve"
          message = `Auto-approved INV-${Math.floor(Math.random() * 1000)} from Vendor ${Math.floor(Math.random() * 10)}`
          setStats((prev) => ({
            ...prev,
            approved: prev.approved + 1,
          }))
        } else if (outcome < 0.8) {
          // Flagged
          type = "flag"
          message = `Flagged INV-${Math.floor(Math.random() * 1000)} from Vendor ${Math.floor(Math.random() * 10)} for review`
          setStats((prev) => ({
            ...prev,
            flagged: prev.flagged + 1,
          }))
        } else {
          // Rejected
          type = "reject"
          message = `Auto-rejected INV-${Math.floor(Math.random() * 1000)} from Vendor ${Math.floor(Math.random() * 10)} (invalid format)`
          setStats((prev) => ({
            ...prev,
            rejected: prev.rejected + 1,
          }))
        }

        // Add to activity log
        addActivityLogEntry({
          type,
          message,
        })
      }, 2000)
    }
  }

  const addActivityLogEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry,
    }

    setActivityLog((prev) => [newEntry, ...prev].slice(0, 50))
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "scan":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "process":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reject":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "flag":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "email":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))

    toast({
      title: "Setting Updated",
      description: `The ${setting} setting has been updated.`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Processing Automation</CardTitle>
          <CardDescription>Control the automated invoice scanning and processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  {automationActive ? (
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Play className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Pause className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">Automation Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {automationActive
                        ? "Active - Processing invoices automatically"
                        : "Inactive - Manual processing only"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="automation-switch" checked={automationActive} onCheckedChange={toggleAutomation} />
                  <Label htmlFor="automation-switch" className="sr-only">
                    Toggle automation
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Scanning Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {scanningActive ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                        {processingActive && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Processing</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Last scan: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {scanningActive && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Scanning for new invoices...</span>
                          <span>{scanProgress}%</span>
                        </div>
                        <Progress value={scanProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Processing Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats.scanned}</div>
                        <div className="text-xs text-muted-foreground">Scanned</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.processed}</div>
                        <div className="text-xs text-muted-foreground">Processed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                        <div className="text-xs text-muted-foreground">Approved</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.rejected}</div>
                        <div className="text-xs text-muted-foreground">Rejected</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.flagged}</div>
                        <div className="text-xs text-muted-foreground">Flagged</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {stats.processed > 0 ? Math.round((stats.approved / stats.processed) * 100) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] overflow-auto">
                  <div className="space-y-4">
                    {activityLog.map((activity) => (
                      <div key={activity.id} className="flex gap-2">
                        <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                        <div className="space-y-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Automation Settings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="rules">Processing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure how the automated invoice processing works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scanning Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="scan-emails" className="flex flex-col space-y-1">
                      <span>Scan Email Inbox</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Automatically scan email inbox for invoices
                      </span>
                    </Label>
                    <Switch
                      id="scan-emails"
                      checked={settings.scanEmailsEnabled}
                      onCheckedChange={(checked) => handleSettingChange("scanEmailsEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="scan-attachments" className="flex flex-col space-y-1">
                      <span>Scan Email Attachments</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Process PDF and image attachments in emails
                      </span>
                    </Label>
                    <Switch
                      id="scan-attachments"
                      checked={settings.scanAttachmentsEnabled}
                      onCheckedChange={(checked) => handleSettingChange("scanAttachmentsEnabled", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Processing Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-reply" className="flex flex-col space-y-1">
                      <span>Auto-Reply to Vendors</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Send automatic confirmation emails
                      </span>
                    </Label>
                    <Switch
                      id="auto-reply"
                      checked={settings.autoReplyEnabled}
                      onCheckedChange={(checked) => handleSettingChange("autoReplyEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications" className="flex flex-col space-y-1">
                      <span>Notifications</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receive notifications for flagged invoices
                      </span>
                    </Label>
                    <Switch
                      id="notifications"
                      checked={settings.notificationsEnabled}
                      onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automation Schedule</CardTitle>
              <CardDescription>Configure when the automation should run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Scheduling options will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Processing Rules</CardTitle>
              <CardDescription>Configure rules for automatic invoice processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Processing rules will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

