import React from "react";
import { Toast } from "../types";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast flex items-start gap-4 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "bg-[#FAF8FC]/95 border-emerald-500/20 shadow-emerald-950/10 text-emerald-800"
              : toast.type === "error"
              ? "bg-[#FAF8FC]/95 border-rose-500/20 shadow-rose-950/10 text-rose-800"
              : "bg-[#FAF8FC]/95 border-purple-500/20 shadow-purple-950/10 text-purple-900"
          }`}
        >
          <div className="mt-0.5">
            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-purple" />}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed font-sans">{toast.message}</p>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-900 transition-colors p-0.5 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
