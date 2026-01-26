import React from 'react';
import { Property, PropertyStatus } from '../types';
import { MapPin, ArrowRight, FileText } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    onGenerateFicha: (id: string) => void;
    onViewDetails: (id: string) => void;
}

const statusColors = {
    [PropertyStatus.DISPONIVEL]: 'bg-green-100 text-green-700 border-green-200',
    [PropertyStatus.LOCADO]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PropertyStatus.EM_USO]: 'bg-purple-100 text-purple-700 border-purple-200',
    [PropertyStatus.RESERVADO]: 'bg-orange-100 text-orange-700 border-orange-200',
    [PropertyStatus.A_VENDA]: 'bg-amber-100 text-amber-700 border-amber-200',
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onGenerateFicha, onViewDetails }) => {
    return (
        <div
            onClick={() => onViewDetails(property.id)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full cursor-pointer"
        >
            {/* Property Image Placeholder */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                    src={property.image_url || '/bg.png'}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/bg.png';
                    }}
                />

                {/* Top Right Badges (Stacked) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border shadow-sm ${property.fiche_available !== false ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {property.fiche_available !== false ? 'Ficha Disponível' : 'Ficha Indisponível'}
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border shadow-sm ${statusColors[property.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {property.status}
                    </div>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {property.name}
                </h3>

                <div className="flex items-start gap-1.5 text-slate-500 text-sm mb-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                        {property.address && `${property.address}, `}
                        {property.neighborhood && `${property.neighborhood} - `}
                        {property.city}/{property.state}
                    </span>
                </div>

                <div className="text-[11px] font-medium text-slate-400 mb-4 ml-5">
                    {property.property_type} • {property.is_complex ? 'Complexo' : 'Único'}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onGenerateFicha(property.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#A64614] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-orange-100"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Ver Ficha
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(property.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1 group/btn text-xs font-semibold shrink-0"
                    >
                        Detalhes
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
