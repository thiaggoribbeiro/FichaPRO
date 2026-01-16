import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, Property } from '../types';
import { User, Mail, Phone, Calendar, Home, Download, Search } from 'lucide-react';

const LeadsListView: React.FC = () => {
    const [leads, setLeads] = useState<(Lead & { properties: Property })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*, properties (*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar leads:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.properties?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Nome', 'Email', 'Telefone', 'Imóvel'];
        const rows = filteredLeads.map(lead => [
            formatDate(lead.created_at),
            lead.name,
            lead.email,
            lead.phone || '',
            lead.properties?.name || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_imobpro_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-[#A64614] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Carregando leads...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou imóvel..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Imóvel de Interesse</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Captura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#A64614] flex items-center justify-center font-bold">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-800">{lead.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="w-3.5 h-3.5" />
                                                {lead.email}
                                            </div>
                                            {lead.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {lead.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <Home className="w-4 h-4 text-slate-400" />
                                            {lead.properties?.name || 'Imóvel removido'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(lead.created_at)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum lead encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadsListView;
