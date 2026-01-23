import React from 'react';
import { Property, PropertyStatus } from '../types';
import { MapPin, FileText, ChevronRight } from 'lucide-react';

interface PropertyListViewProps {
    properties: Property[];
    onGenerateFicha: (id: string) => void;
    onViewDetails: (id: string) => void;
}

const statusBadge = (status: PropertyStatus) => {
    const colors = {
        [PropertyStatus.DISPONIVEL]: 'bg-green-100 text-green-700',
        [PropertyStatus.LOCADO]: 'bg-blue-100 text-blue-700',
        [PropertyStatus.EM_USO]: 'bg-purple-100 text-purple-700',
        [PropertyStatus.RESERVADO]: 'bg-orange-100 text-orange-700',
        [PropertyStatus.A_VENDA]: 'bg-amber-100 text-amber-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
};

const ficheBadge = (available: boolean) => {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {available ? 'Ficha Disponível' : 'Ficha Indisponível'}
        </span>
    );
};

const PropertyListView: React.FC<PropertyListViewProps> = ({ properties, onGenerateFicha, onViewDetails }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Imóvel</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lote / Ficha</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Situação do Imóvel</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors cursor-pointer" onClick={() => onViewDetails(property.id)}>
                                                {property.name}
                                            </span>
                                            {property.is_complex ? (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-100 text-blue-600 uppercase">Complexo</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-600 uppercase">Único</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono mt-0.5">#{property.registration || 'S/M'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{property.neighborhood}, {property.city}/{property.state}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {property.property_type}
                                </td>
                                <td className="px-6 py-4">
                                    {ficheBadge(property.fiche_available)}
                                </td>
                                <td className="px-6 py-4">
                                    {statusBadge(property.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => onGenerateFicha(property.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-[#A64614] hover:bg-orange-600 text-white shadow-sm whitespace-nowrap"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Ver Ficha
                                        </button>
                                        <button
                                            onClick={() => onViewDetails(property.id)}
                                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyListView;
