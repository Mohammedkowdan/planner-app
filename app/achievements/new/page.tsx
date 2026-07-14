"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createProjectStatistic, getMainGoalsAndSubGoals } from "@/actions/project-statistics";
import { Save, Loader2, ArrowRight, FolderKanban, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorProgressForm } from "@/components/indicator-progress-form";
import Link from "next/link";

export default function NewAchievementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [goalsData, setGoalsData] = useState<any[]>([]);
    
    // Form state
    const [projectName, setProjectName] = useState("");
    const [mainGoalId, setMainGoalId] = useState("");
    const [subGoalId, setSubGoalId] = useState("");
    const [governorate, setGovernorate] = useState("");
    const [familiesCount, setFamiliesCount] = useState(0);
    const [boysCount, setBoysCount] = useState(0);
    const [girlsCount, setGirlsCount] = useState(0);
    const [menCount, setMenCount] = useState(0);
    const [womenCount, setWomenCount] = useState(0);
    const [budgetUsd, setBudgetUsd] = useState(0);

    const governorates = [
        "حضرموت", "شبوة", "المهرة", "سقطرى", "عدن", "أبين", "لحج", 
        "الضالع", "تعز", "الحديدة", "مأرب", "الجوف", "صنعاء", "أخرى"
    ];

    useEffect(() => {
        async function fetchGoals() {
            const res = await getMainGoalsAndSubGoals();
            if (res.success) {
                setGoalsData(res.data);
            } else {
                toast.error(res.error);
            }
        }
        fetchGoals();
    }, []);

    const selectedMainGoal = goalsData.find(g => g.id === mainGoalId);
    const subGoals = selectedMainGoal?.subGoals || [];

    const totalBeneficiaries = boysCount + girlsCount + menCount + womenCount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!mainGoalId || !subGoalId || !governorate || !projectName) {
            toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
            return;
        }

        setLoading(true);
        try {
            const res = await createProjectStatistic({
                projectName,
                mainGoalId,
                subGoalId,
                governorate,
                familiesCount: Number(familiesCount),
                boysCount: Number(boysCount),
                girlsCount: Number(girlsCount),
                menCount: Number(menCount),
                womenCount: Number(womenCount),
                budgetUsd: Number(budgetUsd)
            });

            if (res.success) {
                toast.success("تم حفظ إنجازات المشروع بنجاح!");
                
                // Reset numeric fields to allow entering another governorate for same project
                setGovernorate("");
                setFamiliesCount(0);
                setBoysCount(0);
                setGirlsCount(0);
                setMenCount(0);
                setWomenCount(0);
                setBudgetUsd(0);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">إدخال إنجازات المشاريع</h2>
                        <p className="text-muted-foreground">قم بربط المشروع بالأهداف الرئيسية والفرعية وإدخال الإحصائيات</p>
                    </div>
                    <Link href="/statistics">
                        <Button variant="outline">
                            عرض الإحصائيات <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="projects" className="w-full" dir="rtl">
                    <TabsList className="bg-muted/50 p-1 flex-wrap h-auto mb-6">
                        <TabsTrigger value="projects" className="flex items-center gap-2">
                            <FolderKanban className="w-4 h-4" />
                            إنجازات المشاريع
                        </TabsTrigger>
                        <TabsTrigger value="indicators" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            تقدم المؤشرات
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="projects">
                        <form onSubmit={handleSubmit}>
                    <Card className="shadow-lg border-t-4 border-t-primary rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-muted/20 border-b pb-4">
                            <CardTitle>بيانات المشروع والأهداف</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>اسم المشروع</Label>
                                    <Input 
                                        required 
                                        value={projectName} 
                                        onChange={e => setProjectName(e.target.value)} 
                                        placeholder="مثال: مشروع مياه الشرب" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>المحافظة / الموقع</Label>
                                    <Select value={governorate} onValueChange={setGovernorate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المحافظة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {governorates.map(gov => (
                                                <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>الهدف الرئيسي</Label>
                                    <Select value={mainGoalId} onValueChange={(val) => {
                                        setMainGoalId(val);
                                        setSubGoalId(""); // reset subgoal when main goal changes
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الهدف الرئيسي" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {goalsData.map(goal => (
                                                <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>
                                            ))}
                                            {goalsData.length === 0 && <SelectItem value="none" disabled>لا توجد أهداف رئيسية مضافة</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>الهدف الفرعي</Label>
                                    <Select value={subGoalId} onValueChange={setSubGoalId} disabled={!mainGoalId || subGoals.length === 0}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الهدف الفرعي" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subGoals.map((sub: any) => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold text-lg mb-4 text-primary">إحصائيات المستفيدين</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>عدد الأسر</Label>
                                        <Input type="number" min="0" value={familiesCount} onChange={e => setFamiliesCount(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>أطفال (ذكور)</Label>
                                        <Input type="number" min="0" value={boysCount} onChange={e => setBoysCount(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>أطفال (إناث)</Label>
                                        <Input type="number" min="0" value={girlsCount} onChange={e => setGirlsCount(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>رجال</Label>
                                        <Input type="number" min="0" value={menCount} onChange={e => setMenCount(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>نساء</Label>
                                        <Input type="number" min="0" value={womenCount} onChange={e => setWomenCount(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>موازنة المشروع (دولار)</Label>
                                        <Input type="number" min="0" step="0.01" value={budgetUsd} onChange={e => setBudgetUsd(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2 bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex flex-col justify-center items-center">
                                        <Label className="text-emerald-700 font-semibold mb-1">إجمالي المستفيدين الأفراد</Label>
                                        <span className="text-2xl font-bold text-emerald-600">{totalBeneficiaries.toLocaleString("ar-SA")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={loading} className="px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105">
                                    {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                                    حفظ الإنجاز
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
                </TabsContent>

                <TabsContent value="indicators">
                    <IndicatorProgressForm goals={goalsData} />
                </TabsContent>
            </Tabs>
            </div>
        </DashboardLayout>
    );
}
