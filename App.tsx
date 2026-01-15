import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Property, PropertyData, PropertyImage, PropertyType, PropertyStatus } from './types';
import { generateDescription } from './services/geminiService';
import PhotoGallery from './components/PhotoGallery';
import Layout from './components/Layout';
import PageHeader from './components/PageHeader';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import PropertyCard from './components/PropertyCard';
import PropertyFilters from './components/PropertyFilters';
import PropertyListView from './components/PropertyListView';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Plus, Home, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Algo deu errado</h1>
            <p className="text-slate-600 mb-6">{this.state.error?.message || 'Erro desconhecido'}</p>
            <button onClick={() => window.location.reload()} className="bg-[#137fec] text-white px-6 py-2 rounded-xl font-bold">Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFichaStatus, setSelectedFichaStatus] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const [formData, setFormData] = useState<PropertyData>({
    title: '',
    type: PropertyType.CASA,
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    address: '',
    city: '',
    cep: '',
    images: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Erro ao buscar imóveis:', error.message);
    else setProperties(data || []);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        p.name?.toLowerCase().includes(search) ||
        p.address?.toLowerCase().includes(search) ||
        p.city?.toLowerCase().includes(search) ||
        p.registration?.toLowerCase().includes(search);

      const matchesCity = !selectedCity || p.city === selectedCity;
      const matchesState = !selectedState || p.state === selectedState;
      const matchesStatus = !selectedStatus || p.status === selectedStatus;
      const matchesFicha = !selectedFichaStatus ||
        (selectedFichaStatus === 'with' ? p.has_ficha : !p.has_ficha);

      return matchesSearch && matchesCity && matchesState && matchesStatus && matchesFicha;
    });
  }, [properties, searchTerm, selectedCity, selectedState, selectedStatus, selectedFichaStatus]);

  const uniqueCities = useMemo(() => Array.from(new Set(properties.map(p => p.city).filter(Boolean))), [properties]);
  const uniqueStates = useMemo(() => Array.from(new Set(properties.map(p => p.state).filter(Boolean))), [properties]);

  const handleGenerateFicha = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
      setSelectedPropertyId(id);
      setFormData({
        title: property.name || '',
        type: (property.property_type as PropertyType) || PropertyType.CASA,
        price: property.market_value ? `R$ ${property.market_value.toLocaleString('pt-BR')}` : '',
        area: property.built_area?.toString() || '',
        bedrooms: '',
        bathrooms: '',
        description: '',
        address: property.address || '',
        city: property.city || '',
        cep: property.zip_code || '',
        images: []
      });
      setCurrentView('form');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFiles = useCallback((files: FileList) => {
    const newImages: PropertyImage[] = Array.from(files).map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      isCover: formData.images.length === 0 && index === 0,
      status: 'uploaded'
    }));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  }, [formData.images]);

  const handleAddImageUrl = useCallback((url: string) => {
    const newImage: PropertyImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: url,
      isCover: formData.images.length === 0,
      status: 'uploaded'
    };
    setFormData(prev => ({ ...prev, images: [...prev.images, newImage] }));
  }, [formData.images]);

  const handleDeleteImage = (id: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
  };

  const handleSetCover = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({ ...img, isCover: img.id === id }))
    }));
  };

  const handleGenerateAiDescription = async () => {
    if (!formData.title) {
      alert("Por favor, preencha o título para que a IA possa gerar uma descrição.");
      return;
    }
    setLoadingAi(true);
    const text = await generateDescription(formData);
    setFormData(prev => ({ ...prev, description: text }));
    setLoadingAi(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => fetchProperties()} />;
  }

  return (
    <Layout user={session}>
      {currentView === 'list' ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeader
            title="Base de Imóveis"
            subtitle={`Gerencie seus ${properties.length} imóveis cadastrados no FichaPRO.`}
            actions={[
              { label: 'Novo Imóvel', onClick: () => setCurrentView('form'), icon: <Plus className="w-4 h-4" />, variant: 'primary' }
            ]}
          />

          <PropertyFilters
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            selectedCity={selectedCity} setSelectedCity={setSelectedCity}
            selectedState={selectedState} setSelectedState={setSelectedState}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            selectedFichaStatus={selectedFichaStatus} setSelectedFichaStatus={setSelectedFichaStatus}
            viewMode={viewMode} setViewMode={setViewMode}
            cities={uniqueCities} states={uniqueStates}
          />

          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Home className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-slate-500">Tente ajustar seus filtros ou termos de pesquisa.</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProperties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onGenerateFicha={handleGenerateFicha}
                  onViewDetails={(id) => console.log('View details', id)}
                />
              ))}
            </div>
          ) : (
            <PropertyListView
              properties={filteredProperties}
              onGenerateFicha={handleGenerateFicha}
              onViewDetails={(id) => console.log('View details', id)}
            />
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeader
            title={selectedPropertyId ? "Atualizar Ficha" : "Gerar Nova Ficha"}
            subtitle="Preencha os detalhes abaixo para gerar sua ficha profissional em PDF."
            breadcrumbs={[
              { label: 'Imóveis', onClick: () => setCurrentView('list') },
              { label: selectedPropertyId ? 'Atualizar Ficha' : 'Gerar Nova Ficha', active: true }
            ]}
            actions={[
              { label: 'Voltar', onClick: () => setCurrentView('list'), icon: <ArrowLeft className="w-4 h-4" />, variant: 'secondary' }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">1</div>
                  Informações Básicas
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Título do Imóvel</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Mansão Moderna com Piscina Infinita"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Tipo de Imóvel</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-white"
                      >
                        {Object.values(PropertyType).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Preço</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="R$ 0,00"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                  Detalhes do Imóvel
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Área (m²)</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="250"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Quartos</label>
                    <input
                      type="text"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="4"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Banheiros</label>
                    <input
                      type="text"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="3"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Descrição do Imóvel</label>
                    <button
                      onClick={handleGenerateAiDescription}
                      disabled={loadingAi}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-blue-600 text-white rounded-full">✨</span>
                      {loadingAi ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Destaque as principais características, comodidades e pontos de venda..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 resize-none"
                  />
                </div>
              </section>
            </div>

            <Sidebar>
              <PhotoGallery
                images={formData.images}
                onAddImages={handleAddFiles}
                onAddImageUrl={handleAddImageUrl}
                onDeleteImage={handleDeleteImage}
                onSetCover={handleSetCover}
              />
            </Sidebar>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
