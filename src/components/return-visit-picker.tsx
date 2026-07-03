"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ReturnVisitPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ReturnVisitPicker({ value, onChange }: ReturnVisitPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value) : undefined;
  const timeValue = selectedDate
    ? format(selectedDate, "HH:mm")
    : "10:00";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }

    const [hours, minutes] = timeValue.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(date.toISOString());
  };

  const handleTimeChange = (time: string) => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    const [hours, minutes] = time.split(":").map(Number);
    base.setHours(hours, minutes, 0, 0);
    onChange(base.toISOString());
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-12 w-full justify-start text-left text-base font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? format(new Date(value), "yyyy/MM/dd HH:mm", { locale: ja })
              : "日時を選択（任意）"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ja}
          />
          <div className="space-y-2 border-t p-3">
            <Label htmlFor="return-visit-time" className="text-sm">
              時刻
            </Label>
            <Input
              id="return-visit-time"
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-10"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleClear}
              >
                クリア
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        次回来訪の予定がある場合に入力してください
      </p>
    </div>
  );
}
