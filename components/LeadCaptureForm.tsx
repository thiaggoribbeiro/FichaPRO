import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';

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
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Por favor, preencha nome e e-mail.');
            return;
        }

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
                    },
                ]);

            if (error) throw error;

            // Save in localStorage to "remember" this visitor for a while
            localStorage.setItem(`lead_captured_${propertyId}`, 'true');
            onSuccess();
        } catch (error: any) {
            console.error('Erro ao salvar lead:', error.message);
            alert('Erro ao processar seus dados. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                <div className="relative h-32 bg-[#C5A059] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full"></div>
                    </div>
                    <div className="relative text-center px-6">
                        <h2 className="text-white text-xl font-bold">Interesse no Imóvel?</h2>
                        <p className="text-white/80 text-sm mt-1">{propertyName}</p>
                    </div>
                </div>

                <div className="p-8">
                    <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-8">
                        Preencha seus dados abaixo para acessar a ficha completa e fotos exclusivas deste imóvel.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Seu nome"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-slate-800 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-slate-800 dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Telefone (WhatsApp)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-slate-800 dark:text-white"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : 'Ver Ficha Completa'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest font-medium">
                        Seus dados estão seguros conosco.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeadCaptureForm;
