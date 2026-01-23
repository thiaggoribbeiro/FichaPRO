import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, History, Calendar, User, Activity, MoreHorizontal, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemLog {
    id: string;
    created_at: string;
    user_name: string;
    user_email: string;
    action: string;
    details: string;
}

interface SystemLogsProps {
    onBack: () => void;
}

const SystemLogs: React.FC<SystemLogsProps> = ({ onBack }) => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionBadgeColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('LOGIN')) return 'bg-blue-50 text-blue-600 border-blue-100';
        if (a.includes('CONFIGURAÇÃO')) return 'bg-orange-50 text-orange-600 border-orange-100';
        if (a.includes('ATUALIZAÇÃO') || a.includes('EDIT')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        if (a.includes('EXCLUSÃO') || a.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
        if (a.includes('CRIAÇÃO') || a.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        return 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Acompanhamento de Processos
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Histórico detalhado de ações realizadas no sistema.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#A64614] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por usuário, ação ou detalhe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-[400px] text-sm focus:ring-4 focus:ring-[#A64614]/10 focus:border-[#A64614] outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Data / Hora</th>
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Usuário</th>
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ação</th>
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-8 px-8 py-8">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {format(new Date(log.created_at), 'dd/MM/yyyy')}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {format(new Date(log.created_at), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{log.user_name}</span>
                                                <span className="text-xs text-slate-400">{log.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                                {log.details}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                <History className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer simple pagination/stats */}
                <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                        Mostrando {filteredLogs.length} de {logs.length} registros
                    </span>
                    <button
                        onClick={fetchLogs}
                        className="text-xs font-bold text-[#A64614] hover:text-[#8A3A10] transition-colors flex items-center gap-2"
                    >
                        <Activity className="w-3 h-3" />
                        Atualizar Histórico
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
