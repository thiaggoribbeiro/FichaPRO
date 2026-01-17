import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Negotiation, NegotiationStage, Property } from '../types';
import NegotiationCard from './NegotiationCard';
import PageHeader from './PageHeader';
import { Plus, Search, Filter, Layout as LayoutIcon, List, ChevronDown } from 'lucide-react';

const NegotiationKanban: React.FC = () => {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggingCard, setDraggingCard] = useState<Negotiation | null>(null);

    useEffect(() => {
        fetchNegotiations();
    }, []);

    const fetchNegotiations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('negotiations')
                .select('*, properties(*)');

            if (error) throw error;
            setNegotiations(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar negociações:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, negotiation: Negotiation) => {
        setDraggingCard(negotiation);
        e.dataTransfer.setData('text/plain', negotiation.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetStage: NegotiationStage) => {
        e.preventDefault();
        if (!draggingCard || draggingCard.stage === targetStage) return;

        // Impede mover de "Perdido" ou "Ganho" para estágios iniciais se necessário (lógica simples por enquanto)
        // if (draggingCard.stage === NegotiationStage.CLOSED_LOST || draggingCard.stage === NegotiationStage.CLOSED_WON) {
        //   alert('Negociações finalizadas não podem ser movidas.');
        //   return;
        // }

        const updatedNegotiations = negotiations.map(n =>
            n.id === draggingCard.id ? { ...n, stage: targetStage } : n
        );
        setNegotiations(updatedNegotiations);

        try {
            const { error } = await supabase
                .from('negotiations')
                .update({ stage: targetStage })
                .eq('id', draggingCard.id);

            if (error) throw error;
        } catch (error: any) {
            console.error('Erro ao atualizar estágio:', error.message);
            fetchNegotiations(); // Reverte em caso de erro
        } finally {
            setDraggingCard(null);
        }
    };

    const stages = Object.values(NegotiationStage);

    const filteredNegotiations = negotiations.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-8 pb-0">
                <PageHeader
                    title="Canal de Negociação"
                    subtitle="Gerencie seu funil de vendas e acompanhe o progresso de cada oportunidade."
                    actions={[
                        { label: 'Adicionar Etapa', onClick: () => { }, variant: 'secondary' },
                        { label: 'Adicionar Negociação', onClick: () => { }, icon: <Plus className="w-4 h-4" />, variant: 'primary' }
                    ]}
                />

                <div className="mt-8 flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button className="p-2 bg-white shadow-sm rounded-lg text-[#A64614]">
                                <LayoutIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600">
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative ml-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Procurar Negociação"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#A64614]/20 w-64 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest px-4">
                        <span>Mostrar </span>
                        <div className="relative">
                            <select className="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 outline-none text-slate-700 font-bold appearance-none min-w-[60px]">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                        <span className="ml-1 tracking-normal NormalCase italic">Negociação Por Estágio</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto p-8 pt-6">
                <div className="flex gap-4 h-full min-w-max pb-4">
                    {stages.map(stage => (
                        <div
                            key={stage}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            className="flex flex-col w-[280px] shrink-0 bg-slate-100/40 rounded-2xl border border-slate-200/60 overflow-hidden"
                        >
                            {/* Linha superior colorida */}
                            <div className={`h-1 w-full ${stage === NegotiationStage.OPPORTUNITY ? 'bg-orange-400' :
                                stage === NegotiationStage.CONTACTING ? 'bg-emerald-400' :
                                    stage === NegotiationStage.ENGAGED ? 'bg-purple-400' :
                                        stage === NegotiationStage.NEGOTIATING ? 'bg-blue-400' :
                                            stage === NegotiationStage.CLOSED_WON ? 'bg-green-500' : 'bg-red-400'
                                }`} />

                            <div className="flex items-center justify-between p-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-xs font-bold ${stage === NegotiationStage.OPPORTUNITY ? 'text-orange-600' :
                                        stage === NegotiationStage.CONTACTING ? 'text-emerald-600' :
                                            stage === NegotiationStage.ENGAGED ? 'text-purple-600' :
                                                stage === NegotiationStage.NEGOTIATING ? 'text-blue-600' :
                                                    stage === NegotiationStage.CLOSED_WON ? 'text-green-700' : 'text-red-600'
                                        }`}>{stage}</h3>
                                    <span className="text-[9px] bg-white/80 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                                        {filteredNegotiations.filter(n => n.stage === stage).length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className={`flex flex-col gap-3 p-3 pt-2 flex-1 transition-colors ${draggingCard && draggingCard.stage !== stage ? 'bg-orange-50/30' : ''
                                }`}>
                                {stage === NegotiationStage.OPPORTUNITY && (
                                    <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[10px] hover:border-[#A64614] hover:text-[#A64614] transition-all mb-1 shadow-sm flex items-center justify-center gap-2">
                                        <Plus className="w-3 h-3" />
                                        Novo Negociação
                                    </button>
                                )}

                                <div className="space-y-3">
                                    {filteredNegotiations
                                        .filter(n => n.stage === stage)
                                        .map(negotiation => (
                                            <NegotiationCard
                                                key={negotiation.id}
                                                negotiation={negotiation}
                                                onDragStart={handleDragStart}
                                            />
                                        ))}
                                </div>

                                {filteredNegotiations.filter(n => n.stage === stage).length === 0 && !draggingCard && (
                                    <div className="flex-1 rounded-xl border border-dashed border-slate-200/60 flex items-center justify-center p-8 opacity-40">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vazio</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NegotiationKanban;

// Re-using MoreHorizontal from lucide-react (handled in NegotiationCard, adding import here for the header part)
import { MoreHorizontal } from 'lucide-react';
