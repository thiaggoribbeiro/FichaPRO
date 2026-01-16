import React from 'react';
import { Property } from '../types';
import {
    MapPin,
    Maximize2,
    Home,
    Ruler,
    CreditCard,
    Fingerprint,
    FileText,
    ChevronRight,
    Calendar
} from 'lucide-react';

interface PublicPropertySheetProps {
    property: Property;
    onBack?: () => void;
}

const PublicPropertySheet: React.FC<PublicPropertySheetProps> = ({ property }) => {
    const formatCurrency = (value: any) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    const formatNumber = (value: any) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR').format(num || 0);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-[#101922] shadow-2xl overflow-x-hidden font-sans pb-10">
            {/* Header Buttons Removed */}

            {/* Main Image Banner */}
            <div className="relative w-full h-[320px] overflow-hidden">
                <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url("${property.aerial_view_url || property.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=430&q=80'}")` }}
                >
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <span className="inline-block px-2.5 py-1 mb-3 text-[9px] font-bold tracking-[0.2em] uppercase bg-[#A64614] text-white rounded-sm shadow-lg">Listagem Premium</span>
                    <h1 className="text-white text-2xl font-bold tracking-tight leading-tight">{property.name}</h1>
                </div>
            </div>

            {/* Location Bar */}
            <div className="relative -mt-6 mx-4 mb-6 flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[#A64614] flex items-center justify-center rounded-xl bg-[#A64614]/10 shrink-0 size-12 border border-[#A64614]/20 shadow-sm">
                    <MapPin size={24} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-[#0d141b] dark:text-white text-sm font-bold truncate tracking-tight">{property.address}, {property.number}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">{property.neighborhood}, {property.city} - {property.state}</p>
                </div>
                <div className="shrink-0">
                    <button
                        className="p-2 text-slate-300 dark:text-slate-700 hover:text-[#A64614] transition-colors"
                        title="Ver no Mapa"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Technical Details Grid */}
            <div className="px-5 mb-8">
                <h2 className="text-[#0d141b] dark:text-white text-base font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#A64614] rounded-full"></div>
                    Especificações do Imóvel
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <DetailCard
                        icon={<Maximize2 size={18} />}
                        label="Área Terreno"
                        value={`${formatNumber(property.land_area)} m²`}
                    />
                    <DetailCard
                        icon={<Home size={18} />}
                        label="Área Const."
                        value={`${formatNumber(property.built_area)} m²`}
                    />
                    <DetailCard
                        icon={<Ruler size={18} />}
                        label="Testada Princ."
                        value={`${formatNumber(property.main_quota)} m`}
                    />
                    <DetailCard
                        icon={<Ruler size={18} />}
                        label="Cota Lateral"
                        value={`${formatNumber(property.lateral_quota)} m`}
                    />
                    <DetailCard
                        icon={<CreditCard size={18} />}
                        label="Qtd. Pavimentos"
                        value={String(property.floors || 1)}
                    />
                    <DetailCard
                        icon={<FileText size={18} />}
                        label="Config. Terreno"
                        value={property.terrain_config === 'regular' ? 'Regular' : 'Irregular'}
                    />
                    <DetailCard
                        icon={<Fingerprint size={18} />}
                        label="Sequencial"
                        value={property.sequencial || 'N/A'}
                    />
                    <DetailCard
                        icon={<FileText size={18} />}
                        label="Matrícula"
                        value={property.matricula || 'N/A'}
                    />
                </div>
            </div>

            {/* Gallery Section */}
            <div className="px-5 mb-8">
                <h2 className="text-[#0d141b] dark:text-white text-base font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#A64614] rounded-full"></div>
                    Tour Visual
                </h2>
                <div className="grid grid-cols-6 gap-2 h-[280px]">
                    <div className="col-span-4 relative rounded-2xl overflow-hidden shadow-md group">
                        <img
                            alt="Frontal"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            src={property.front_view_url || 'https://images.unsplash.com/photo-1600607687940-c52af09696d7?auto=format&fit=crop&w=800&q=80'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <span className="text-white text-[9px] font-bold uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-sm">Frontal</span>
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-rows-2 gap-2">
                        <div className="relative rounded-2xl overflow-hidden shadow-md group">
                            <img
                                alt="Lateral"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                src={property.side_view_url || 'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=400&q=80'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden shadow-md group border border-slate-100 dark:border-slate-800">
                            <img
                                alt="Marcação"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 blur-[1px] group-hover:blur-0"
                                src={property.terrain_marking_url || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80'}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white border border-white/50 rounded-full p-2 backdrop-blur-sm">
                                    <Maximize2 size={16} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* IPTU Info Section */}
            <div className="px-5 mb-8">
                <div className="bg-[#0d141b] text-white p-6 rounded-3xl shadow-xl flex items-center justify-between overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Calendar size={120} />
                    </div>
                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]"></div>

                    <div className="relative z-10">
                        <p className="text-[#A64614] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Encargos Anuais</p>
                        <h3 className="text-2xl font-bold tracking-tight">Valor do IPTU</h3>
                        <p className="text-slate-400 text-xs mt-1">Exercício Corrente</p>
                    </div>
                    <div className="relative z-10 text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(property.iptu_value)}</p>
                        <span className="inline-block px-2 py-0.5 mt-2 rounded-full bg-[#A64614]/20 text-[#A64614] text-[9px] font-bold uppercase tracking-wider border border-[#A64614]/30">Cota Única</span>
                    </div>
                </div>
            </div>

            {/* Footer / CTA - Static inside content */}
            <div className="mx-5 mb-10 bg-[#A64614] text-white p-6 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between gap-5">
                    <div className="flex flex-col min-w-[120px]">
                        <p className="text-white/70 text-[9px] font-bold uppercase tracking-[0.15em]">Valor de Aluguel</p>
                        <p className="text-white text-xl font-extrabold tracking-tight">
                            {property.price ? formatCurrency(property.price) : 'Sob Consulta'}
                        </p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-5 py-3.5 rounded-2xl font-bold text-xs transition-all border border-white/30 flex-1 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                        Agendar Visita
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DetailCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
            <div className="text-[#A64614] size-5 shrink-0">
                {icon}
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-[#0d141b] dark:text-white font-bold text-sm tracking-tight">{value}</p>
    </div>
);

export default PublicPropertySheet;
