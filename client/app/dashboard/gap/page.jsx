"use client";

import { useState } from "react";
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
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gapAnalysis } from "@/data/mockData";

export default function GapAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Filter gap items based on search
  const filteredGapItems = gapAnalysis.filter((item) =>
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

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gapAnalysis.length}</div>
              <p className="text-xs text-muted-foreground">
                Categories being tracked
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Impact Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gapAnalysis.filter((item) => item.impact === "high").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Categories needing immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Gap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  gapAnalysis.reduce((acc, item) => acc + item.gap, 0) /
                    gapAnalysis.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Units per category
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gapAnalysis.reduce((acc, item) => acc + item.gap, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
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
            className="w-full pl-8 border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              {filteredGapItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
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
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
