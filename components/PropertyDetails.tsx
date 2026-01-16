import React, { useState } from 'react';
import { Property, PropertyStatus } from '../types';
import PageHeader from './PageHeader';
import {
    ArrowLeft,
    MapPin,
    Home,
    Square,
    User,
    Calendar,
    FileText,
    DollarSign,
    Briefcase,
    Building2,
    CheckCircle2,
    Trash2,
    Edit3,
    ChevronRight,
    Ruler,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Info,
    Download,
    Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generatePropertyPDF } from '../services/pdfService';

interface PropertyDetailsProps {
    property: Property;
    allProperties: Property[];
    onBack: () => void;
    onGenerateFicha: (id: string) => void;
    onEditProperty?: (id: string) => void; // Prop para editar imóvel
    user?: any; // Adicionando prop user
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, allProperties, onBack, onGenerateFicha, onEditProperty, user }) => {
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const handleGeneratePDF = async () => {
        try {
            setGeneratingPDF(true);
            await generatePropertyPDF(property);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar a ficha do imóvel. Tente novamente.');
        } finally {
            setGeneratingPDF(false);
        }
    };
    const units = React.useMemo(() => {
        if (!property.is_complex) return [];

        // Tenta buscar por parent_id primeiro
        const related = allProperties.filter(p => p.parent_id === property.id);
        if (related.length > 0) return related;

        // Fallback: Agrupamento por identificador "Complexo X" no nome
        const normalize = (str: string) => str?.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") || '';

        // Extrai o identificador do complexo (ex: "Complexo Agamenon" → "complexo agamenon")
        const extractComplexId = (name: string) => {
            const normalizedName = normalize(name);
            // Procura pelo padrão "complexo + nome" no início ou em qualquer parte
            const match = normalizedName.match(/complexo\s+(\w+)/i);
            return match ? match[0] : null;
        };

        const currentComplexId = extractComplexId(property.name);

        if (!currentComplexId) {
            // Se não encontrar o padrão "Complexo X", tenta agrupamento por nome idêntico
            const currentName = normalize(property.name);
            return allProperties.filter(p =>
                p.is_complex &&
                normalize(p.name) === currentName
            );
        }

        // Agrupa todas as propriedades que contêm o mesmo identificador de complexo
        return allProperties.filter(p => {
            const pComplexId = extractComplexId(p.name);
            return pComplexId === currentComplexId;
        });
    }, [property, allProperties]);

    const isComplex = property.is_complex;

    const aggregatedData = React.useMemo(() => {
        if (!isComplex) return null;
        const toNum = (val: any) => {
            if (typeof val === 'number') return val;
            if (!val || typeof val !== 'string') return 0;
            // Remove R$, pontos de milhar e substitui vírgula por ponto
            const clean = val.replace(/[R$\s.]/g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        };

        const sums = {
            market_value: units.reduce((acc, u) => acc + toNum(u.market_value), 0),
            built_area: units.reduce((acc, u) => acc + toNum(u.built_area), 0),
            land_area: units.reduce((acc, u) => acc + toNum(u.land_area), 0),
            market_rent: units.reduce((acc, u) => acc + toNum(u.market_rent), 0),
            min_rent: units.reduce((acc, u) => acc + toNum(u.min_rent), 0),
            variable_rent: units.reduce((acc, u) => acc + toNum(u.variable_rent), 0),
            purchase_value: units.reduce((acc, u) => acc + toNum(u.purchase_value), 0),
            main_quota: units.reduce((acc, u) => acc + toNum(u.main_quota), 0),
            lateral_quota: units.reduce((acc, u) => acc + toNum(u.lateral_quota), 0),
            floors: units.reduce((acc, u) => acc + toNum(u.floors), 0),
            iptu_value: units.reduce((acc, u) => acc + toNum(u.iptu_value), 0),
            spu_value: units.reduce((acc, u) => acc + toNum(u.spu_value), 0),
            other_taxes: units.reduce((acc, u) => acc + toNum(u.other_taxes), 0),
            matricula: units.map(u => u.matricula).filter(Boolean).join(', '),
            sequencial: units.map(u => u.sequencial).filter(Boolean).join(', '),
        };

        const rent_dy = sums.market_value > 0 ? (sums.market_rent * 12 / sums.market_value) * 100 : 0;
        const rent_sqm = sums.built_area > 0 ? (sums.market_rent / sums.built_area) : 0;

        return { ...sums, rent_dy, rent_sqm };
    }, [isComplex, units]);

    const displayMarketValue = isComplex ? aggregatedData?.market_value : property.market_value;
    const displayBuiltArea = isComplex ? aggregatedData?.built_area : property.built_area;
    const displayLandArea = isComplex ? aggregatedData?.land_area : property.land_area;
    const displayMarketRent = isComplex ? aggregatedData?.market_rent : property.market_rent;
    const displayMinRent = isComplex ? aggregatedData?.min_rent : property.min_rent;
    const displayVariableRent = isComplex ? aggregatedData?.variable_rent : property.variable_rent;
    const displayPurchaseValue = isComplex ? aggregatedData?.purchase_value : property.purchase_value;
    const displayRentDy = isComplex ? aggregatedData?.rent_dy : property.rent_dy;
    const displayRentSqm = isComplex ? aggregatedData?.rent_sqm : property.rent_sqm;
    const displayMainQuota = isComplex ? aggregatedData?.main_quota : property.main_quota;
    const displayLateralQuota = isComplex ? aggregatedData?.lateral_quota : property.lateral_quota;
    const displayIptuValue = isComplex ? aggregatedData?.iptu_value : property.iptu_value;
    const displaySpuValue = isComplex ? aggregatedData?.spu_value : property.spu_value;
    const displayOtherTaxes = isComplex ? aggregatedData?.other_taxes : property.other_taxes;
    const displayFloors = isComplex ? aggregatedData?.floors : property.floors;
    const displayMatricula = isComplex ? aggregatedData?.matricula : property.matricula;
    const displaySequencial = isComplex ? aggregatedData?.sequencial : property.sequencial;
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const detailCards = [
        { label: 'Valor de Mercado', value: formatCurrency(displayMarketValue || 0), icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Área Construída', value: `${displayBuiltArea || 0} m²`, icon: <Square className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Área do Terreno', value: `${displayLandArea || 0} m²`, icon: <Building2 className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Aluguel Mercado', value: formatCurrency(displayMarketRent || 0), icon: <Briefcase className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
    ];
    const handleAction = (action: 'edit' | 'delete') => {
        // Se o usuário está logado (tem session), considera como admin por padrão
        // Caso contrário, verifica o metadata ou assume visitor
        const userRole = user ? (user.user_metadata?.role || 'admin') : 'visitor';

        if (action === 'edit') {
            if (['admin', 'manager', 'user'].includes(userRole)) {
                // Chamar a função de edição passada pelo App.tsx
                if (onEditProperty) {
                    onEditProperty(property.id);
                } else {
                    alert('Funcionalidade de edição não disponível.');
                }
            } else {
                alert('Acesso Negado: Apenas usuários autenticados podem editar imóveis. Visitantes não possuem permissão.');
            }
        }

        if (action === 'delete') {
            if (['admin', 'manager'].includes(userRole)) {
                if (confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
                    alert(`Funcionalidade de Exclusão (Role: ${userRole}) - Em breve`);
                }
            } else {
                alert('Acesso Negado: Apenas Administradores e Gestores podem excluir imóveis.');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader
                title={property.name}
                subtitle={property.address}
                breadcrumbs={[
                    { label: 'Imóveis', onClick: onBack },
                    { label: property.name, active: true }
                ]}
                actions={[
                    { label: 'Voltar', onClick: onBack, icon: <ArrowLeft className="w-4 h-4" />, variant: 'secondary' },
                    {
                        label: 'Editar Imóvel',
                        onClick: () => handleAction('edit'),
                        icon: <Edit3 className="w-4 h-4" />,
                        variant: 'secondary'
                    },
                    {
                        label: 'Excluir Imóvel',
                        onClick: () => handleAction('delete'),
                        icon: <Trash2 className="w-4 h-4 text-red-500" />,
                        variant: 'secondary'
                    },
                    {
                        label: generatingPDF ? 'Gerando...' : (property.has_ficha ? 'Atualizar Ficha' : 'Gerar Ficha'),
                        onClick: handleGeneratePDF,
                        icon: generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
                        variant: 'primary',
                        disabled: generatingPDF
                    }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
                {detailCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                            {card.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-xl font-extrabold text-slate-900">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Informações Gerais
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <InfoItem label="Tipo de Imóvel" value={isComplex ? 'Complexo Imobiliário' : 'Imóvel Único'} icon={<Building2 className="w-4 h-4" />} />
                            <InfoItem label="Status" value={property.status} icon={<CheckCircle2 className="w-4 h-4" />} />
                            <InfoItem label="Inquilino" value={isComplex ? 'Múltiplos' : (property.tenant || 'Nenhum')} icon={<User className="w-4 h-4" />} />
                            <InfoItem label="Categoria Inquilino" value={property.tenant_category || 'N/A'} icon={<Briefcase className="w-4 h-4" />} />
                            <InfoItem label="Proprietário" value={property.owner} icon={<Building2 className="w-4 h-4" />} />
                            <InfoItem label="Ano de Compra" value={property.purchase_year?.toString() || 'N/A'} icon={<Calendar className="w-4 h-4" />} />
                        </div>

                        {isComplex && units.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-blue-600" />
                                    Unidades do Complexo ({units.length})
                                </h3>
                                <div className="space-y-3">
                                    {units.map(unit => (
                                        <div key={unit.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{unit.name}</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {unit.address}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-slate-900">{formatCurrency(unit.market_value || 0)}</span>
                                                <span className="text-xs text-slate-500">{unit.built_area} m²</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Localização
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoItem label="Endereço" value={property.address} />
                            <InfoItem label="Número" value={property.number} />
                            <InfoItem label="Complemento" value={property.complement || 'N/A'} />
                            <InfoItem label="Bairro" value={property.neighborhood} />
                            <InfoItem label="Cidade/UF" value={`${property.city} - ${property.state}`} />
                            <InfoItem label="CEP" value={property.zip_code} />
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            Dados Financeiros
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <FinancialItem label="Aluguel Mínimo" value={formatCurrency(displayMinRent || 0)} />
                            <FinancialItem label="Aluguel Variável" value={formatCurrency(displayVariableRent || 0)} />
                            <FinancialItem label="Valor de Compra" value={formatCurrency(displayPurchaseValue || 0)} />
                            <FinancialItem label="Rent. DY" value={`${(displayRentDy || 0).toFixed(2)}%`} />
                            <FinancialItem label="Aluguel/m²" value={formatCurrency(displayRentSqm || 0)} />
                        </div>
                    </section>

                    {/* Parâmetros Construtivos */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-blue-600" />
                            Parâmetros Construtivos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <FinancialItem label="Área do Terreno" value={`${displayLandArea || 0} m²`} />
                            <FinancialItem label="Área Construída" value={`${displayBuiltArea || 0} m²`} />
                            <FinancialItem label="Testada Principal" value={`${displayMainQuota || 0} m`} />
                            <FinancialItem label="Cota Lateral" value={`${displayLateralQuota || 0} m`} />
                            <FinancialItem label="Qtd. de Pavimentos" value={(displayFloors || 0).toString()} />
                            <FinancialItem label="Configuração do Terreno" value={property.terrain_config === 'irregular' ? 'Irregular' : 'Regular'} />
                        </div>
                    </section>

                    {/* Registros */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Registros
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <FinancialItem label="Matrículas" value={displayMatricula || 'N/A'} />
                            <FinancialItem label="Sequenciais" value={displaySequencial || 'N/A'} />
                        </div>
                    </section>

                    {/* Impostos */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Impostos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <FinancialItem label="IPTU" value={formatCurrency(displayIptuValue || 0)} />
                            <FinancialItem label="SPU" value={formatCurrency(displaySpuValue || 0)} />
                            <FinancialItem label="Outros Impostos" value={formatCurrency(displayOtherTaxes || 0)} />
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Galeria de Fotos Lateral */}
                    <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Home className="w-5 h-5 text-blue-600" />
                            Galeria de Fotos
                        </h2>
                        <div className="space-y-4">
                            <ImageCard
                                title="Marcação do Terreno"
                                imageUrl={property.terrain_marking_url}
                                fallback="/bg.png"
                                onEdit={() => alert('Editar: Marcação do Terreno')}
                                onDelete={() => confirm('Excluir imagem?') && alert('Excluída')}
                            />
                            <ImageCard
                                title="Visão Aérea"
                                imageUrl={property.aerial_view_url}
                                fallback="/bg.png"
                                onEdit={() => alert('Editar: Visão Aérea')}
                                onDelete={() => confirm('Excluir imagem?') && alert('Excluída')}
                            />
                            <ImageCard
                                title="Vista Frontal"
                                imageUrl={property.front_view_url}
                                fallback="/bg.png"
                                onEdit={() => alert('Editar: Vista Frontal')}
                                onDelete={() => confirm('Excluir imagem?') && alert('Excluída')}
                            />
                            <ImageCard
                                title="Vista Lateral"
                                imageUrl={property.side_view_url}
                                fallback="/bg.png"
                                onEdit={() => alert('Editar: Vista Lateral')}
                                onDelete={() => confirm('Excluir imagem?') && alert('Excluída')}
                            />
                        </div>
                    </section>
                </div>
            </div>

        </div>
    );
};

const ImageCard = ({ title, imageUrl, fallback, onEdit, onDelete }: {
    title: string;
    imageUrl: string | null;
    fallback: string;
    onEdit?: () => void;
    onDelete?: () => void;
}) => (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm group relative">
        <div className="relative">
            <img
                src={imageUrl || fallback}
                alt={title}
                className="w-full h-40 object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallback;
                }}
            />
            {/* Overlay com botões - aparece no hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                        title="Editar imagem"
                    >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                        title="Excluir imagem"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                )}
            </div>
        </div>
        <div className="p-3 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</span>
            {imageUrl && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded font-medium">Carregada</span>
            )}
        </div>
    </div>
);

const InfoItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
            {icon && <span className="text-slate-400">{icon}</span>}
            <span className="text-sm font-semibold text-slate-700">{value}</span>
        </div>
    </div>
);

const FinancialItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-900 font-bold">{value}</span>
    </div>
);

export default PropertyDetails;
