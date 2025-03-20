"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ClipboardList, AlertTriangle, Calculator, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGapAnalysis } from "@/lib/api";

export default function GapAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState({ summary: {}, categories: [] });
  const { toast } = useToast();

  useEffect(() => {
    const fetchGapAnalysis = async () => {
      try {
        const data = await getGapAnalysis();
        setGapData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch gap analysis data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGapAnalysis();
  }, [toast]);

  // Filter gap items based on search
  const filteredGapItems = gapData.categories.filter((item) =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImpactBadge = (impact) => {
    switch (impact.toLowerCase()) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 px-3 py-1 hover:bg-red-100 hover:text-red-800"
          >
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1 hover:bg-yellow-100 hover:text-yellow-800"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 hover:bg-blue-100 hover:text-blue-800"
          >
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-3 py-1">
            {impact.toUpperCase()}
          </Badge>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span>Total Categories</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gapData.summary.totalCategories}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Categories being tracked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>High Impact Gaps</span>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 bg-red-50 text-red-700 border-red-200">
                    Critical
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gapData.summary.highImpactGaps}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Categories needing immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span>Average Gap</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gapData.summary.averageGap}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Units per category
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Total Gap</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gapData.summary.totalGap}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total units needed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left w-[35%]">Category</TableHead>
                <TableHead className="text-center w-[15%]">Expected</TableHead>
                <TableHead className="text-center w-[15%]">Actual</TableHead>
                <TableHead className="text-center w-[15%]">Gap</TableHead>
                <TableHead className="text-center w-[20%]">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGapItems.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="text-left font-medium">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-center">{item.expected}</TableCell>
                  <TableCell className="text-center">{item.actual}</TableCell>
                  <TableCell className="text-center text-red-700 font-medium">
                    {item.gap}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {getImpactBadge(item.impact)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredGapItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
