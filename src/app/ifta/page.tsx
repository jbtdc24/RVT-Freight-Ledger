"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calculator, MapPin, Fuel, Download } from "lucide-react";
import { usStates, type IFTAQuarter } from "@/lib/ifta-types";

export default function IFTAPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState<IFTAQuarter>("Q1");
  const [activeTab, setActiveTab] = useState("trips");

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());
  const quarters: IFTAQuarter[] = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IFTA Fuel Tax</h1>
          <p className="text-muted-foreground mt-1">
            Track mileage and fuel by jurisdiction for quarterly IFTA reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Trip
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quarter:</span>
              <Select value={selectedQuarter} onValueChange={(v) => setSelectedQuarter(v as IFTAQuarter)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            <Button variant="outline" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Tax
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Miles</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Fuel className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fuel</p>
                <p className="text-2xl font-bold">0 gal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Calculator className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg MPG</p>
                <p className="text-2xl font-bold">0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jurisdictions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass">
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Purchases</TabsTrigger>
          <TabsTrigger value="report">Tax Report</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Trip Log</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trips recorded for this period</p>
              <p className="text-sm mt-1">Add trips to track mileage by jurisdiction</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jurisdictions">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Mileage by Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {usStates.slice(0, 12).map((state) => (
                  <div
                    key={state.code}
                    className="p-4 border border-white/5 rounded-lg text-center hover:bg-white/5 transition-colors"
                  >
                    <p className="font-bold text-lg">{state.code}</p>
                    <p className="text-xs text-muted-foreground">{state.name}</p>
                    <p className="text-sm mt-2">0 miles</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-muted-foreground mt-4 text-sm">
                Showing 12 of 48 jurisdictions. Add trips to populate data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Fuel Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No fuel purchases recorded</p>
              <p className="text-sm mt-1">Add fuel purchases to track tax paid by state</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>IFTA Tax Report</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate your quarterly IFTA report</p>
              <p className="text-sm mt-1 mb-4">Add trips and fuel purchases to calculate tax owed/refund</p>
              <Button>Generate Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
