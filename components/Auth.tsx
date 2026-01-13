import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail para confirmar.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#137fec] rounded-2xl shadow-lg shadow-[#137fec]/20 mb-4 animate-bounce-slow">
                        <span className="material-symbols-outlined text-4xl text-white">real_estate_agent</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        PropSheet<span className="text-[#137fec]">Pro</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Sua plataforma profissional de fichas imobiliárias</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            {isRegistering ? 'Criar nova conta' : 'Entrar na sua conta'}
                        </h2>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                <span className="material-symbols-outlined text-xl">
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {isRegistering && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all font-medium"
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all font-medium"
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#137fec] text-white rounded-xl font-bold shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90 active:scale-[0.98] transition-all disabled:opacity-70 mt-4"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                        <span>{isRegistering ? 'Cadastrando...' : 'Entrando...'}</span>
                                    </div>
                                ) : (
                                    <span>{isRegistering ? 'Cadastrar agora' : 'Entrar no sistema'}</span>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                        <p className="text-sm text-slate-600 font-medium">
                            {isRegistering ? 'Já tem uma conta?' : 'Não possui uma conta?'}
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="ml-2 text-[#137fec] font-bold hover:underline"
                            >
                                {isRegistering ? 'Fazer login' : 'Cadastre-se grátis'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
