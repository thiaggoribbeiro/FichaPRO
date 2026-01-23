import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Lead, Property } from '../types';
import {
    User, Mail, Phone, Calendar, Home,
    Download, Search, Plus, MoreHorizontal,
    Filter, X, Check, ArrowRight, UserPlus,
    ArrowLeft, Eye, Edit2, Trash2, ChevronDown
} from 'lucide-react';

interface LeadWithProperty extends Lead {
    properties: Property | null;
}

interface LeadsListViewProps {
    onBack?: () => void;
    userRole?: string;
    onLogAction?: (action: string, details: string) => void;
}

const LeadsListView: React.FC<LeadsListViewProps> = ({ onBack, userRole = 'Visitante', onLogAction }) => {
    const [leads, setLeads] = useState<LeadWithProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadWithProperty | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<LeadWithProperty | null>(null);
    const [allProperties, setAllProperties] = useState<Property[]>([]);

    // Form state for new lead
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        level: 'Frio',
        marking: '',
        role: '',
        company: ''
    });

    useEffect(() => {
        fetchLeads();
        fetchProperties();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*, properties (*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('Leads buscados:', data?.length, 'itens. Exemplo do primeiro item:', data?.[0]);
            setLeads(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar leads:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('name');
            if (!error) setAllProperties(data || []);
        } catch (error) {
            console.error('Erro ao buscar imóveis:', error);
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!['Administrador', 'Gestor', 'Usuário'].includes(userRole)) {
            alert('Acesso Negado: Apenas Administradores, Gestores e Usuários podem criar/editar leads.');
            return;
        }

        try {
            console.log('Dados sendo salvos:', {
                id: isEditMode ? selectedLead?.id : 'novo',
                ...newLead
            });

            if (isEditMode && selectedLead) {
                const { data, error } = await supabase
                    .from('leads')
                    .update({
                        name: newLead.name,
                        email: newLead.email,
                        phone: newLead.phone,
                        property_id: newLead.property_id || null,
                        level: newLead.level,
                        marking: newLead.marking,
                        role: newLead.role,
                        company: newLead.company
                    })
                    .eq('id', selectedLead.id)
                    .select();

                if (error) throw error;
                console.log('Update result:', data);
            } else {
                const { data, error } = await supabase
                    .from('leads')
                    .insert([{
                        name: newLead.name,
                        email: newLead.email,
                        phone: newLead.phone,
                        property_id: newLead.property_id || null,
                        level: newLead.level,
                        marking: newLead.marking,
                        role: newLead.role,
                        company: newLead.company
                    }])
                    .select();

                if (error) throw error;
                console.log('Insert result:', data);

                // Log the action for creation
                if (onLogAction) {
                    onLogAction(
                        'CRIAÇÃO DE LEAD',
                        `Lead: ${newLead.name}, Email: ${newLead.email}`
                    );
                }
            }

            setIsModalOpen(false);
            setIsEditMode(false);
            setSelectedLead(null);
            setNewLead({ name: '', email: '', phone: '', property_id: '', level: 'Frio', marking: '', role: '', company: '' });
            fetchLeads();
        } catch (error: any) {
            alert('Erro ao salvar lead: ' + error.message);
        }
    };

    const handleDeleteLead = async () => {
        if (!leadToDelete) return;

        if (!['Administrador', 'Gestor'].includes(userRole)) {
            alert('Acesso Negado: Apenas Administradores e Gestores podem excluir leads.');
            setIsDeleteModalOpen(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', leadToDelete.id);

            if (error) throw error;
            setIsDeleteModalOpen(false);
            setLeadToDelete(null);
            fetchLeads();
        } catch (error: any) {
            alert('Erro ao excluir lead: ' + error.message);
        }
    };

    const confirmDelete = (lead: LeadWithProperty) => {
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
        setOpenMenuId(null);
    };

    const openEditModal = (lead: LeadWithProperty) => {
        setSelectedLead(lead);
        setIsEditMode(true);
        setNewLead({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            property_id: lead.property_id || '',
            level: lead.level || 'Frio',
            marking: lead.marking || '',
            role: lead.role || '',
            company: lead.company || ''
        });
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const openViewModal = (lead: LeadWithProperty) => {
        setSelectedLead(lead);
        setIsViewModalOpen(true);
        setOpenMenuId(null);
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'Quente':
                return <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span> Quente</span>;
            case 'Morno':
                return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-orange-600"></span> Morno</span>;
            case 'Frio':
            default:
                return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-600"></span> Frio</span>;
        }
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Nome', 'Email', 'Telefone', 'Imóvel', 'Função', 'Empresa', 'Nível', 'Marcação'];
        const rows = filteredLeads.map(lead => [
            formatDate(lead.created_at),
            lead.name,
            lead.email,
            lead.phone || '',
            lead.properties?.name || '',
            lead.role || '',
            lead.company || '',
            lead.level || 'Frio',
            lead.marking || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Lead</h1>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleExportCSV}
                        className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar CSV
                    </button>
                    {['Administrador', 'Gestor', 'Usuário'].includes(userRole) && (
                        <button
                            onClick={() => {
                                setIsEditMode(false);
                                setNewLead({ name: '', email: '', phone: '', property_id: '', level: 'Frio', marking: '', role: '', company: '' });
                                setIsModalOpen(true);
                            }}
                            className="h-10 px-4 rounded-xl bg-[#A64614] text-white font-semibold text-xs flex items-center gap-2 hover:bg-[#8A3A10] transition-all shadow-md shadow-orange-900/10"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar Lead
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Procurar Lead..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>Mostrar </span>
                    <div className="relative">
                        <select className="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 outline-none text-slate-700 font-bold focus:ring-1 focus:ring-[#A64614] transition-all cursor-pointer shadow-sm appearance-none min-w-[60px]">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <span className="ml-1 tracking-normal NormalCase">Lead De {filteredLeads.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="overflow-x-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contato</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Nível</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Função</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empresa</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criado em</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">Carregando leads...</td>
                                </tr>
                            ) : filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{lead.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                                        {lead.email}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold tabular-nums">
                                        {lead.phone || 'S/ Telefone'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getLevelBadge(lead.level || 'Frio')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.role ? (
                                            <span className="text-xs font-semibold text-slate-600">{lead.role}</span>
                                        ) : <span className="text-slate-300 text-[10px]">---</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.company ? (
                                            <span className="text-xs font-bold text-[#A64614]">{lead.company}</span>
                                        ) : <span className="text-slate-300 text-[10px]">---</span>}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {formatDate(lead.created_at)}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuId === lead.id && (
                                            <>
                                                <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)}></div>
                                                <div className="absolute right-6 top-10 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={() => openViewModal(lead)}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 group/item"
                                                    >
                                                        <Eye className="w-4 h-4 text-blue-500 group-hover/item:scale-110 transition-transform" />
                                                        Visão Geral
                                                    </button>
                                                    {['Administrador', 'Gestor', 'Usuário'].includes(userRole) && (
                                                        <button
                                                            onClick={() => openEditModal(lead)}
                                                            className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 group/item"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-orange-500 group-hover/item:scale-110 transition-transform" />
                                                            Editar
                                                        </button>
                                                    )}
                                                    {['Administrador', 'Gestor'].includes(userRole) && (
                                                        <button
                                                            onClick={() => {
                                                                confirmDelete(lead);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50 mt-1 pt-2 group/item"
                                                        >
                                                            <Trash2 className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                                                            Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        Nenhum lead encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Adição/Edição de Lead */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                {isEditMode ? <Edit2 className="w-5 h-5 text-orange-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                                {isEditMode ? 'Editar Lead' : 'Adicionar Novo Lead'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                        placeholder="Nome do Lead"
                                        value={newLead.name}
                                        onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                        placeholder="email@empresa.com"
                                        value={newLead.email}
                                        onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                        placeholder="(00) 00000-0000"
                                        value={newLead.phone}
                                        onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Função</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                        placeholder="Ex: Diretor, Gestor..."
                                        value={newLead.role}
                                        onChange={e => setNewLead({ ...newLead, role: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                        placeholder="Nome da Empresa"
                                        value={newLead.company}
                                        onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Imóvel Relacionado</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm bg-white"
                                        value={newLead.property_id}
                                        onChange={e => setNewLead({ ...newLead, property_id: e.target.value })}
                                    >
                                        <option value="">Nenhum (Manual)</option>
                                        {allProperties.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lead Nível</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm bg-white"
                                        value={newLead.level}
                                        onChange={e => setNewLead({ ...newLead, level: e.target.value })}
                                    >
                                        <option value="Frio">Frio</option>
                                        <option value="Morno">Morno</option>
                                        <option value="Quente">Quente</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marcação/Tag</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/10 focus:border-[#A64614] transition-all text-sm"
                                    placeholder="Ex: Investidor, Direto..."
                                    value={newLead.marking}
                                    onChange={e => setNewLead({ ...newLead, marking: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#A64614] text-white font-bold text-xs hover:bg-[#8A3A10] transition-all shadow-lg shadow-orange-900/10"
                                >
                                    {isEditMode ? 'Atualizar Lead' : 'Salvar Lead'}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}

            {/* Modal de Detalhes do Lead */}
            {
                isViewModalOpen && selectedLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#A64614]" />
                                    Detalhes do Lead
                                </h2>
                                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#A64614] text-2xl font-bold border border-slate-200">
                                        {selectedLead.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{selectedLead.name}</h3>
                                        <p className="text-slate-500 text-sm">{selectedLead.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contato</p>
                                        <p className="text-sm font-semibold text-slate-700">{selectedLead.phone || 'Não informado'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Nível</p>
                                        <div>{getLevelBadge(selectedLead.level || 'Frio')}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Função</p>
                                        <p className="text-sm font-semibold text-slate-700">{selectedLead.role || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empresa</p>
                                        <p className="text-sm font-bold text-[#A64614]">{selectedLead.company || '---'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marcação/Tag</p>
                                        <p className="text-sm font-semibold text-slate-700">{selectedLead.marking || 'Nenhuma'}</p>
                                    </div>
                                    {selectedLead.properties && (
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imóvel de Interesse</p>
                                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Home className="w-3.5 h-3.5" />
                                                {selectedLead.properties.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        openEditModal(selectedLead);
                                    }}
                                    className="px-6 py-2 rounded-xl bg-[#A64614] text-white font-bold text-xs hover:bg-[#8A3A10] transition-all"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="px-6 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 transition-all"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && leadToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Lead</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Tem certeza que deseja excluir o lead <span className="font-bold text-slate-700">{leadToDelete.name}</span>? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setLeadToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteLead}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
                                >
                                    Sim, Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default LeadsListView;
