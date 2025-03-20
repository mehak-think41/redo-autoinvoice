"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getMonthlyInvoiceStats, watchLive } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"
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

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [watchLiveCalled, setWatchLiveCalled] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call watchLive API if not already called
        if (!watchLiveCalled) {
          console.log("Calling watchLive API from dashboard...");
          const watchLiveMessage = await watchLive();
          console.log("WatchLive API response:", watchLiveMessage);
          if (watchLiveMessage?.success) {
            toast({
              title: "Success",
              description: "Live monitoring initialized successfully",
              variant: "default",
            });
          }
          setWatchLiveCalled(true);
        }

        // Fetch monthly stats
        const response = await getMonthlyInvoiceStats();
        if (response.success && response.stats) {
          setStats(response.stats);
        } else {
          toast({
            title: "Warning",
            description: "Unable to fetch monthly statistics",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Dashboard API error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-sm text-muted-foreground">Loading statistics...</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Invoices",
      value: stats?.totalInvoices || 0,
      description: "Total invoices this month",
      icon: null,
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      percentage: stats?.approvedPercentage || 0,
      description: "Approved invoices",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      percentage: stats?.pendingPercentage || 0,
      description: "Awaiting review",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Flagged",
      value: stats?.flagged || 0,
      percentage: stats?.flaggedPercentage || 0,
      description: "Requires attention",
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Rejected",
      value: stats?.rejected || 0,
      percentage: stats?.rejectedPercentage || 0,
      description: "Rejected invoices",
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ]

  const invoiceStatusData = [
    { name: "Approved", value: stats?.approved || 0, color: "#10b981" },
    { name: "Pending", value: stats?.pending || 0, color: "#f59e0b" },
    { name: "Flagged", value: stats?.flagged || 0, color: "#ef4444" },
    { name: "Rejected", value: stats?.rejected || 0, color: "#6b7280" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Monthly invoice statistics overview</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className="space-y-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon && (
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                {stat.percentage !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(stat.percentage).toFixed(0)}% of total
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Monthly Distribution</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Invoice status distribution over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Current Month",
                          approved: stats?.approved || 0,
                          pending: stats?.pending || 0,
                          flagged: stats?.flagged || 0,
                          rejected: stats?.rejected || 0,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        width={35}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(229, 231, 235, 0.2)' }}
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ 
                          fontSize: '12px',
                          marginTop: '10px'
                        }}
                      />
                      <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="rejected" name="Rejected" fill="#6b7280" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Status Distribution</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Current invoice status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invoiceStatusData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={85}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                        }
                        labelStyle={{
                          fontSize: '12px',
                          fill: '#6b7280',
                          fontWeight: 500
                        }}
                      >
                        {invoiceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ 
                          fontSize: '12px',
                          marginTop: '20px'
                        }}
                        formatter={(value) => <span className="text-gray-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Detailed Analytics</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                In-depth analysis of invoice processing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">Detailed analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
