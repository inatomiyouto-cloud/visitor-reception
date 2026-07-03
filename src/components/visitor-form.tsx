"use client";

import { useState, type ReactNode } from "react";
import { BellRing, Package, CalendarCheck, Briefcase, HelpCircle } from "lucide-react";

import { ReturnVisitPicker } from "@/components/return-visit-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useVisitors } from "@/hooks/use-visitors";
import { cn } from "@/lib/utils";
import { PURPOSES, type Purpose } from "@/lib/types";

const purposeIcons: Record<Purpose, ReactNode> = {
  配達: <Package className="h-6 w-6" />,
  アポあり: <CalendarCheck className="h-6 w-6" />,
  "集金・営業": <Briefcase className="h-6 w-6" />,
  その他: <HelpCircle className="h-6 w-6" />,
};

export function VisitorForm() {
  const { addVisitor } = useVisitors();
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [message, setMessage] = useState("");
  const [returnVisitAt, setReturnVisitAt] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit =
    purpose !== null && visitorName.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || purpose === null) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addVisitor({
        purpose,
        visitor_name: visitorName.trim(),
        message: message.trim(),
        return_visit_scheduled_at: returnVisitAt,
      });

      setPurpose(null);
      setVisitorName("");
      setMessage("");
      setReturnVisitAt(null);
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "呼出通知の送信に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 py-8">
        <header className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BellRing className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">来客受付</h1>
          <p className="text-sm text-muted-foreground">
            用件を選択し、必要事項を入力してください
          </p>
        </header>

        <section className="space-y-3">
          <Label className="text-base">用件</Label>
          <div className="grid grid-cols-2 gap-3">
            {PURPOSES.map((item) => (
              <Button
                key={item}
                type="button"
                variant={purpose === item ? "default" : "outline"}
                className={cn(
                  "h-24 flex-col gap-2 text-base font-semibold",
                  purpose === item && "ring-2 ring-ring ring-offset-2",
                )}
                onClick={() => setPurpose(item)}
                disabled={isSubmitting}
              >
                {purposeIcons[item]}
                {item}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitor-name" className="text-base">
              お名前
            </Label>
            <Input
              id="visitor-name"
              placeholder="例: 山田 太郎"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="h-12 text-base"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-base">
              伝言（任意）
            </Label>
            <Textarea
              id="message"
              placeholder="担当者への伝言があれば入力してください"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] text-base"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">再来訪の予定（任意）</Label>
            <ReturnVisitPicker
              value={returnVisitAt}
              onChange={setReturnVisitAt}
            />
          </div>
        </section>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <Button
          type="button"
          size="lg"
          className="h-14 w-full text-base font-semibold"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isSubmitting ? "送信中..." : "呼出を通知する"}
        </Button>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">通知完了</DialogTitle>
            <DialogDescription className="text-center text-base">
              ホストに通知しました
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowSuccess(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
