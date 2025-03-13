"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { FileText, CheckSquare, AlertTriangle } from "lucide-react"
import { recentInvoices, processedInvoices, pendingInvoices } from "@/data/mockData"

export default function Dashboard() {
  // Calculate statistics from mock data
  const totalInvoices = recentInvoices.length + processedInvoices.length + pendingInvoices.length
  const processedCount = processedInvoices.length
  const rejectedCount = recentInvoices.filter(invoice => invoice.status === 'rejected').length
  const flaggedCount = pendingInvoices.filter(invoice => invoice.urgency === 'high').length

  // Calculate monthly data from processed invoices
  const monthlyData = processedInvoices.reduce((acc, invoice) => {
    const month = new Date(invoice.date).toLocaleString('default', { month: 'short' })
    const existingMonth = acc.find(item => item.name === month)
    if (existingMonth) {
      existingMonth.invoices++
      existingMonth.amount += invoice.amount
    } else {
      acc.push({ name: month, invoices: 1, amount: invoice.amount })
    }
    return acc
  }, [])

  // Invoice status data
  const invoiceStatusData = [
    { name: "Processed", value: processedCount, color: "#10b981" },
    { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    { name: "Flagged", value: flaggedCount, color: "#6366f1" },
  ]

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      description: `${((processedCount / totalInvoices) * 100).toFixed(0)}% processed`,
      icon: FileText,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Processed",
      value: processedCount.toString(),
      description: `${((processedCount / totalInvoices) * 100).toFixed(0)}% completion rate`,
      icon: CheckSquare,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Rejected",
      value: rejectedCount.toString(),
      description: `${((rejectedCount / totalInvoices) * 100).toFixed(0)}% of total invoices`,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Flagged Issues",
      value: flaggedCount.toString(),
      description: `${((flaggedCount / totalInvoices) * 100).toFixed(0)}% require attention`,
      icon: AlertTriangle,
      color: "bg-purple-100 text-purple-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Invoice Processing</CardTitle>
                <CardDescription>Monthly invoice volume and total amount</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="invoices" fill="#8884d8" name="Invoices" />
                    <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
                <CardDescription>Current status of all invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={invoiceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {invoiceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics will be displayed here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generated reports will be displayed here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
