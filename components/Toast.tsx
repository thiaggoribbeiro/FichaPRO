import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <AlertCircle className="w-5 h-5 text-red-500" />
        },
        warning: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-800',
            icon: <AlertCircle className="w-5 h-5 text-orange-500" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-500" />
        }
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-10 fade-in duration-300`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} shadow-xl min-w-[300px] max-w-md`}>
                <div className="shrink-0">
                    {currentStyle.icon}
                </div>
                <p className="flex-1 text-sm font-bold leading-tight">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                    title="Fechar"
                >
                    <X className="w-4 h-4 opacity-50" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
