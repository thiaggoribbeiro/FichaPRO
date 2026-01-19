import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PasswordChangeModalProps {
    userId: string;
    onSuccess: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ userId, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            // 1. Update the password in Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });

            if (authError) throw authError;

            // 2. Update the profile to set force_password_change to false
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ force_password_change: false })
                .eq('id', userId);

            if (profileError) {
                console.warn('Senha alterada, mas erro ao atualizar perfil:', profileError.message);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao alterar a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-[#A64614] rounded-2xl mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Segurança da Conta</h2>
                        <p className="text-slate-500 mt-2">Para sua segurança, solicitamos que você altere sua senha no primeiro acesso.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-700 flex items-start gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nova Senha</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] outline-none transition-all font-medium"
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nova Senha</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] outline-none transition-all font-medium"
                                    placeholder="Repita a nova senha"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#A64614] text-white rounded-xl font-bold shadow-lg shadow-[#A64614]/20 hover:bg-[#A64614]/90 active:scale-[0.98] transition-all disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Alterando senha...</span>
                                </>
                            ) : (
                                <span>Confirmar e Entrar</span>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Sua senha protege seu acesso ao ImobLead e aos dados dos seus clientes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
