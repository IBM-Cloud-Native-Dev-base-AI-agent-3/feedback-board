import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-lg shadow-lg transition-all duration-300 transform animate-fade-in text-xs font-semibold">
      <Sparkles className="w-4 h-4 text-slate-300" />
      <span>{message}</span>
    </div>
  );
};
