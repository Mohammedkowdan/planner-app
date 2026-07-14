"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftRight, Calendar as CalendarIcon, Moon } from "lucide-react"
import moment from "moment-hijri"

export function HijriConverter() {
  const [gregorianDate, setGregorianDate] = useState(moment().format("YYYY-MM-DD"))
  const [convertedHijri, setConvertedHijri] = useState("")

  const [hijriDay, setHijriDay] = useState(moment().format("iD"))
  const [hijriMonth, setHijriMonth] = useState(moment().format("iM"))
  const [hijriYear, setHijriYear] = useState(moment().format("iYYYY"))
  const [convertedGregorian, setConvertedGregorian] = useState("")

  const hijriMonths = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ]

  // Update Hijri when Gregorian changes
  useEffect(() => {
    if (gregorianDate) {
      const m = moment(gregorianDate, "YYYY-MM-DD")
      if (m.isValid()) {
        const hDay = m.format("iD")
        const hMonthIndex = m.iMonth() // 0 to 11
        const hYear = m.format("iYYYY")
        setConvertedHijri(`${hDay} ${hijriMonths[hMonthIndex]} ${hYear} هـ`)
      } else {
        setConvertedHijri("تاريخ غير صالح")
      }
    } else {
      setConvertedHijri("")
    }
  }, [gregorianDate])

  // Update Gregorian when Hijri changes
  useEffect(() => {
    if (hijriDay && hijriMonth && hijriYear) {
      const hDateStr = `${hijriYear}/${hijriMonth}/${hijriDay}`
      const m = moment(hDateStr, "iYYYY/iM/iD")
      if (m.isValid()) {
        setConvertedGregorian(m.format("YYYY-MM-DD"))
      } else {
        setConvertedGregorian("تاريخ غير صالح")
      }
    } else {
      setConvertedGregorian("")
    }
  }, [hijriDay, hijriMonth, hijriYear])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 animate-in fade-in duration-500">
      
      {/* الميلادي إلى هجري */}
      <Card className="shadow-lg border-t-[6px] border-t-blue-500 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b pb-5 pt-5">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-xl">
            <CalendarIcon className="w-6 h-6" />
            تحويل من ميلادي إلى هجري
          </CardTitle>
          <CardDescription className="text-base mt-1">أدخل التاريخ الميلادي ليتم تحويله فوراً</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-base text-gray-700">التاريخ الميلادي</Label>
            <Input 
              type="date"
              value={gregorianDate}
              onChange={(e) => setGregorianDate(e.target.value)}
              className="text-left h-12 text-lg rounded-xl border-gray-200 focus-visible:ring-blue-500"
              dir="ltr"
            />
          </div>
          
          <div className="bg-[#f4f8ff] p-8 rounded-2xl border border-blue-100 flex flex-col items-center justify-center space-y-3">
            <span className="text-blue-500 font-medium text-lg">التاريخ الهجري المقابل</span>
            <span className="text-4xl font-bold text-blue-700 tracking-wide">
              {convertedHijri || "---"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* هجري إلى ميلادي */}
      <Card className="shadow-lg border-t-[6px] border-t-blue-500 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b pb-5 pt-5">
          <CardTitle className="flex items-center gap-2 text-blue-600 text-xl">
            <Moon className="w-6 h-6" />
            تحويل من هجري إلى ميلادي
          </CardTitle>
          <CardDescription className="text-base mt-1">أدخل التاريخ الهجري ليتم تحويله فوراً</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label className="text-base text-gray-700">اليوم</Label>
              <Select value={hijriDay} onValueChange={setHijriDay}>
                <SelectTrigger className="h-12 text-lg rounded-xl border-gray-200 focus:ring-blue-500">
                  <SelectValue placeholder="اليوم" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base text-gray-700">الشهر</Label>
              <Select value={hijriMonth} onValueChange={setHijriMonth}>
                <SelectTrigger className="h-12 text-lg rounded-xl border-gray-200 focus:ring-blue-500">
                  <SelectValue placeholder="الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {hijriMonths.map((m, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base text-gray-700">السنة</Label>
              <Input 
                type="number"
                value={hijriYear}
                onChange={(e) => setHijriYear(e.target.value)}
                min="1300"
                max="1500"
                className="text-center h-12 text-lg rounded-xl border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="bg-[#f4f8ff] p-8 rounded-2xl border border-blue-100 flex flex-col items-center justify-center space-y-3">
            <span className="text-blue-500 font-medium text-lg">التاريخ الميلادي المقابل</span>
            <span className="text-4xl font-bold text-blue-700 tracking-wide" dir="ltr">
              {convertedGregorian || "---"}
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
