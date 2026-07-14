"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReportFilters({ years }: { years: number[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year && year !== "all") {
      params.set("year", year);
    } else {
      params.delete("year");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-2xl">
      <div className="relative flex-1 w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في التقارير..."
          className="pr-10"
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Select 
        defaultValue={searchParams.get("year")?.toString() || "all"} 
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="السنة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل السنوات</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <div className="text-xs text-muted-foreground animate-pulse">جاري التصفية...</div>}
    </div>
  );
}
