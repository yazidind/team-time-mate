import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, formatRupiah } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payroll")({
  component: AdminPayroll;
});
