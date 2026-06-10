import { useEffect, useRef } from "react";
import { AlertCircle, Bell, CheckCircle2, X } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn } from "@/lib/utils";
import type { ToastTone } from "@/types/notification";

const TOAST_DURATION_MS = 3800;           // 표시 유지 시간
const TOAST_ANIMATION_DURATION_MS = 180;  // 등장/퇴장 애니메이션 시간

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
  info: "border-slate-200 bg-white text-slate-900",
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") return <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />;
  if (tone === "error") return <AlertCircle className="mt-0.5 size-4 text-rose-600" />;
  return <Bell className="mt-0.5 size-4 text-slate-500" />;
}

function ToastCard({
  id,
  title,
  description,
  tone,
  isClosing = false,
}: {
  id: string;
  title: string;
  description: string;
  tone: ToastTone;
  isClosing?: boolean;
}) {
  const startToastExit = useNotificationStore((s) => s.startToastExit);
  const removeToast = useNotificationStore((s) => s.removeToast);
  const exitStartedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!exitStartedRef.current) {
        exitStartedRef.current = true;
        startToastExit(id);
        window.setTimeout(() => removeToast(id), TOAST_ANIMATION_DURATION_MS);
      }
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [id, startToastExit, removeToast]);

  const handleClose = () => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    startToastExit(id);
    window.setTimeout(() => removeToast(id), TOAST_ANIMATION_DURATION_MS);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-slate-950/10",
        isClosing ? `animate-[toast-out_${TOAST_ANIMATION_DURATION_MS}ms_ease-in_forwards]` : `animate-[toast-in_${TOAST_ANIMATION_DURATION_MS}ms_ease-out]`,
        toneStyles[tone]
      )}
    >
      <ToneIcon tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
        aria-label="토스트 닫기"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useNotificationStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} {...toast} />
      ))}
    </div>
  );
}