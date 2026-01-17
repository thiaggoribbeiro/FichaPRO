import React from 'react';
import { Negotiation, NegotiationStage } from '../types';
import { DollarSign, User, TrendingUp, MoreHorizontal } from 'lucide-react';

interface NegotiationCardProps {
    negotiation: Negotiation;
    onDragStart: (e: React.DragEvent, negotiation: Negotiation) => void;
}

const NegotiationCard: React.FC<NegotiationCardProps> = ({ negotiation, onDragStart }) => {
    const getStageColor = (stage: NegotiationStage) => {
        switch (stage) {
            case NegotiationStage.OPPORTUNITY: return 'border-orange-500';
            case NegotiationStage.CONTACTING: return 'border-emerald-500';
            case NegotiationStage.ENGAGED: return 'border-purple-500';
            case NegotiationStage.NEGOTIATING: return 'border-blue-500';
            case NegotiationStage.CLOSED_WON: return 'border-green-600';
            case NegotiationStage.CLOSED_LOST: return 'border-red-500';
            default: return 'border-slate-200';
        }
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return 'N/A';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, negotiation)}
            className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${getStageColor(negotiation.stage)} hover:shadow-md transition-all cursor-grab active:cursor-grabbing group animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#A64614] transition-colors">
                    {negotiation.title}
                </h4>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{negotiation.client_name}</span>
                </div>

                {negotiation.value && (
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formatCurrency(negotiation.value)}</span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className={`w-3.5 h-3.5 ${negotiation.probability > 70 ? 'text-green-500' : 'text-orange-500'}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Prob.: {negotiation.probability}%
                        </span>
                    </div>

                    {negotiation.stage === NegotiationStage.CLOSED_WON && (
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">Ganho</span>
                    )}
                    {negotiation.stage === NegotiationStage.CLOSED_LOST && (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase">Perdido</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NegotiationCard;
