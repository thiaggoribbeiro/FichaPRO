import React from 'react';
import { Search, MapPin, Building, ToggleLeft, ToggleRight, LayoutGrid, List } from 'lucide-react';
import { PropertyStatus } from '../types';

interface PropertyFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedCity: string;
    setSelectedCity: (val: string) => void;
    selectedState: string;
    setSelectedState: (val: string) => void;
    selectedStatus: string;
    setSelectedStatus: (val: string) => void;
    selectedFichaStatus: string;
    setSelectedFichaStatus: (val: string) => void;
    selectedCategory: string;
    setSelectedCategory: (val: any) => void;
    viewMode: 'cards' | 'list';
    setViewMode: (mode: 'cards' | 'list') => void;
    cities: string[];
    states: string[];
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
    searchTerm, setSearchTerm,
    selectedCity, setSelectedCity,
    selectedState, setSelectedState,
    selectedStatus, setSelectedStatus,
    selectedFichaStatus, setSelectedFichaStatus,
    selectedCategory, setSelectedCategory,
    viewMode, setViewMode,
    cities, states
}) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 space-y-6">
            {/* Top row: Search and View Mode Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-grow max-w-2xl w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Busca rápida: nome, matrícula, endereço, bairro..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold ${viewMode === 'cards' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Cards
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        Lista
                    </button>
                </div>
            </div>

            {/* Middle row: Multi-select filtering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cidade</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 text-sm"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            title="Filtrar por Cidade"
                        >
                            <option value="">Todas as cidades</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">UF (Estado)</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 text-sm"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            title="Filtrar por Estado"
                        >
                            <option value="">Todas as UFs</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Situação do Imóvel</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 text-sm"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            title="Filtrar por Situação"
                        >
                            <option value="">Todas as situações</option>
                            {Object.values(PropertyStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ficha Técnica</label>
                    <div className="relative">
                        <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 text-sm"
                            value={selectedFichaStatus}
                            onChange={(e) => setSelectedFichaStatus(e.target.value)}
                            title="Filtrar por Status da Ficha"
                        >
                            <option value="">Todos</option>
                            <option value="available">Ficha Disponível</option>
                            <option value="unavailable">Ficha Indisponível</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Categoria</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 text-sm"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            title="Filtrar por Categoria"
                        >
                            <option value="all">Todos</option>
                            <option value="unique">Imóvel Único</option>
                            <option value="complex">Complexo</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyFilters;
