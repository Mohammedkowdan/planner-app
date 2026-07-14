"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { commitAnnualReportImport } from "@/actions/annual-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCcw, Upload, CheckCircle2, ChevronRight } from "lucide-react";

export default function AnnualReportImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importState, setImportState] = useState<"IDLE" | "UPLOADED" | "SUCCESS">("IDLE");
  const [importId, setImportId] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("الرجاء اختيار ملف التقرير");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("reportYear", year);

      const res = await fetch("/api/annual-reports/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في رفع الملف");

      toast.success("تم رفع وتحليل الملف بنجاح");
      setImportId(data.importId);
      setImportState("UPLOADED");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!importId) return;
    setIsCommitting(true);
    try {
      const result = await commitAnnualReportImport(importId);
      if (!result.success) throw new Error(result.error);
      
      toast.success("تم اعتماد التقرير السنوي وحفظه نهائياً");
      setImportState("SUCCESS");
      setTimeout(() => {
        router.push("/annual-reports");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء اعتماد التقرير");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">استيراد تقرير القطاعات (Excel)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>رفع ملف الإكسل (Template)</CardTitle>
          <CardDescription>
            قم برفع قالب التقرير السنوي الخاص بالقطاعات لتحليله واستخراج بيانات المشاريع وإحصاءاتها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importState === "IDLE" && (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>العنوان (اختياري)</Label>
                  <Input 
                    placeholder="مثال: التقرير السنوي 2025" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>سنة التقرير</Label>
                  <Input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملف التقرير (.xlsx)</Label>
                <Input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  required 
                />
              </div>
              <Button type="submit" disabled={isUploading || !file} className="w-full md:w-auto">
                {isUploading ? <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /> : <Upload className="ml-2 h-4 w-4" />}
                تحليل ورفع الملف
              </Button>
            </form>
          )}

          {importState === "UPLOADED" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100">تم تحليل الملف بانتظار الاعتماد</h3>
                  <p className="text-emerald-700 dark:text-emerald-300 max-w-md">
                    تم استخراج بيانات المشاريع بنجاح وتم تخزينها مؤقتاً. يرجى مراجعة ملخص الاستيراد ثم الاعتماد لحفظ البيانات تدريجياً في النظام.
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setImportState("IDLE")}>
                    إلغاء ورفع ملف آخر
                  </Button>
                  <Button onClick={handleCommit} disabled={isCommitting}>
                    {isCommitting ? <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /> : <ChevronRight className="ml-2 h-4 w-4" />}
                    اعتماد وحفظ البيانات
                  </Button>
                </div>
              </div>
            </div>
          )}

          {importState === "SUCCESS" && (
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-xl text-emerald-900 dark:text-emerald-100">تم استيراد التقرير بالكامل</h3>
              <p className="text-emerald-700 dark:text-emerald-300">يتم تحويلك الآن إلى قائمة التقارير...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
