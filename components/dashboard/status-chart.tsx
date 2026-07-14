"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StatusChart({ data, title }: { data: { name: string, value: number }[], title: string }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        لا توجد بيانات
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Translate Status keys to Arabic
    const translatedData = data.map(item => {
        let name = item.name
        switch (item.name) {
            case 'ON_TRACK': name = 'في المسار'; break;
            case 'DELAYED': name = 'متأخر'; break;
            case 'COMPLETED': name = 'مكتمل'; break;
            case 'AT_RISK': name = 'في خطر'; break;
            case 'PENDING': name = 'قيد الانتظار'; break;
            case 'IN_PROGRESS': name = 'جاري التنفيذ'; break;
        }
        return { ...item, name }
    })

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-md overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <CardContent className="p-4 flex-1 flex items-center justify-center">
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={translatedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {translatedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#666' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )

}
