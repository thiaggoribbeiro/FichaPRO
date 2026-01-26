import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';
import Toast, { ToastType } from './Toast';

interface LeadCaptureFormProps {
    propertyId: string;
    propertyName: string;
    onSuccess: () => void;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ propertyId, propertyName, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        company: ''
    });
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('leads')
                .insert([
                    {
                        property_id: propertyId,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        role: formData.role,
                        company: formData.company
                    },
                ]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Erro ao capturar lead:', error);
            showToast('Ocorreu um erro. Por favor, tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                <div className="relative h-40 bg-gradient-to-br from-[#C5A059] to-[#AD8B45] flex flex-col items-center justify-center overflow-hidden border-b border-white/10">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full"></div>
                    </div>
                    <div className="relative text-center px-8">
                        <h2 className="text-white text-2xl font-bold tracking-tight">Interesse no Imóvel?</h2>
                        <p className="text-white/90 text-sm mt-2 font-medium">{propertyName}</p>
                    </div>
                </div>

                <div className="p-8 bg-[#111827]">
                    <p className="text-slate-400 text-sm text-center mb-10 leading-relaxed px-2">
                        Preencha seus dados abaixo para acessar a ficha completa e fotos exclusivas deste imóvel.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NOME COMPLETO</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Seu nome"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-white placeholder:text-slate-600"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-MAIL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="seu@email.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-white placeholder:text-slate-600"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">TELEFONE (WHATSAPP)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-white placeholder:text-slate-600"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">FUNÇÃO</label>
                                    <input
                                        type="text"
                                        placeholder="Seu cargo"
                                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-white placeholder:text-slate-600"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">EMPRESA</label>
                                    <input
                                        type="text"
                                        placeholder="Sua empresa"
                                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-white placeholder:text-slate-600"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 bg-[#C5A059] hover:bg-[#AD8B45] text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-[#C5A059]/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 text-base active:scale-[0.98]"
                        >
                            {loading ? 'Processando...' : 'Ver Ficha Completa'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="text-[10px] text-slate-500 text-center mt-8 uppercase tracking-[0.2em] font-bold">
                        SEUS DADOS ESTÃO SEGUROS CONOSCO.
                    </p>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default LeadCaptureForm;
