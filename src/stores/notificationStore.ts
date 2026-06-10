import { create } from "zustand";
import type { ToastItem, ToastTone } from "@/types/notification";

type ToastState = {
    toasts: ToastItem[];
    pushToast: (toast: Omit<ToastItem, "id" | "isClosing">) => void;
    startToastExit: (id: string) => void;
    removeToast: (id: string) => void;
};

export const useNotificationStore = create<ToastState>((set) => ({
    toasts: [],

    pushToast: (toast) =>
        set((state) => ({
        toasts: [{ id: crypto.randomUUID(), isClosing: false, ...toast }, ...state.toasts].slice(0, 4),
        })),

    startToastExit: (id) =>
        set((state) => ({
        toasts: state.toasts.map((toast) =>
            toast.id === id ? { ...toast, isClosing: true } : toast
        ),
        })),

    removeToast: (id) =>
        set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}));

export function showToast(input: {
    title: string;
    description: string;
    tone?: ToastTone;
}) {
    useNotificationStore.getState().pushToast({
        title: input.title,
        description: input.description,
        tone: input.tone ?? "info",
    });
}