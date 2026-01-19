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
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import PublicPropertySheet from './components/PublicPropertySheet';
import LeadCaptureForm from './components/LeadCaptureForm';
import LeadsListView from './components/LeadsListView';
import NegotiationKanban from './components/NegotiationKanban';
import PropertySheetModal from './components/PropertySheetModal';
import PasswordChangeModal from './components/PasswordChangeModal';
import SystemLogs from './components/SystemLogs';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Plus, Home, ArrowLeft, DollarSign, Users } from 'lucide-react';

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
            <button onClick={() => window.location.reload()} className="bg-[#A64614] text-white px-6 py-2 rounded-xl font-bold">Recarregar</button>
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'properties' | 'form' | 'details' | 'leads' | 'negotiation' | 'tracking'>('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedDetailPropertyId, setSelectedDetailPropertyId] = useState<string | null>(null);
  const [publicPropertyId, setPublicPropertyId] = useState<string | null>(null);
  const [publicProperty, setPublicProperty] = useState<Property | null>(null);
  const [publicPropertyLoading, setPublicPropertyLoading] = useState(false);
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFichaStatus, setSelectedFichaStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'complex' | 'unique'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const [formData, setFormData] = useState<PropertyData>({
    title: '',
    type: PropertyType.CASA,
    description: '',
    isComplex: false,
    address: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: '',
    state: '',
    cep: '',
    landArea: '',
    builtArea: '',
    mainQuota: '',
    lateralQuota: '',
    floors: '',
    terrainConfig: 'regular',
    iptuValue: '',
    spuValue: '',
    otherTaxes: '',
    terrainMarkingUrl: null,
    aerialViewUrl: null,
    frontViewUrl: null,
    sideViewUrl: null,
    price: '',
    matricula: '',
    sequencial: '',
    images: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setSession(newUser);

      if (newUser) {
        checkForcePasswordChange(newUser.id);

        // Log login if the event is SIGNED_IN
        if (_event === 'SIGNED_IN') {
          supabase.from('system_logs').insert({
            user_id: newUser.id,
            user_name: newUser.user_metadata?.full_name || 'Usuário',
            user_email: newUser.email,
            action: 'LOGIN',
            details: 'Acesso realizado com sucesso'
          });
        }
      } else {
        setForcePasswordChange(false);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const pId = params.get('p');
    if (pId) {
      setPublicPropertyId(pId);
      setIsLeadCaptured(localStorage.getItem(`lead_captured_${pId}`) === 'true');
      // Fetch public property directly
      fetchPublicProperty(pId);
    }

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

  const logAction = useCallback(async (action: string, details: string) => {
    if (!session) return;
    try {
      await supabase.from('system_logs').insert({
        user_id: session.id,
        user_name: session.user_metadata?.full_name || 'Usuário',
        user_email: session.email,
        action,
        details
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [session]);

  const checkForcePasswordChange = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('force_password_change')
        .eq('id', userId)
        .single();

      if (data && data.force_password_change) {
        setForcePasswordChange(true);
      } else {
        setForcePasswordChange(false);
      }
    } catch (err) {
      console.error('Erro ao verificar troca de senha obrigatória:', err);
    }
  };

  const fetchPublicProperty = async (propertyId: string) => {
    setPublicPropertyLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Erro ao buscar imóvel público:', error.message);
        setPublicProperty(null);
      } else {
        setPublicProperty(data);
      }
    } catch (err) {
      console.error('Erro ao buscar imóvel público:', err);
      setPublicProperty(null);
    } finally {
      setPublicPropertyLoading(false);
    }
  };

  const handleSave = async () => {
    // Check permission to create/edit property
    const userRole = session?.user_metadata?.role || 'Visitante';
    if (!['Administrador', 'Gestor', 'Usuário'].includes(userRole)) {
      alert('Acesso Negado: Apenas Administradores, Gestores e Usuários podem salvar imóveis.');
      return;
    }

    if (!formData.title) {
      alert('Por favor, insira pelo menos um título para o imóvel.');
      return;
    }

    try {
      setLoading(true);

      const propertyToSave = {
        name: formData.title || 'N/A',
        property_type: formData.type || 'N/A',
        address: formData.address || 'N/A',
        number: formData.number || 'N/A',
        neighborhood: formData.neighborhood || 'N/A',
        complement: formData.complement || 'N/A',
        city: formData.city || 'N/A',
        state: formData.state || 'N/A',
        zip_code: formData.cep || 'N/A',
        is_complex: formData.isComplex,
        description: formData.description || 'N/A',

        // Parâmetros Construtivos
        land_area: parseFloat(formData.landArea || '0'),
        built_area: parseFloat(formData.builtArea || '0'),
        main_quota: parseFloat(formData.mainQuota || '0'),
        lateral_quota: parseFloat(formData.lateralQuota || '0'),
        floors: parseInt(formData.floors || '0'),
        terrain_config: formData.terrainConfig,

        // Impostos
        iptu_value: parseFloat(formData.iptuValue || '0'),
        spu_value: parseFloat(formData.spuValue || '0'),
        other_taxes: parseFloat(formData.otherTaxes || '0'),

        // Imagens
        terrain_marking_url: formData.terrainMarkingUrl,
        aerial_view_url: formData.aerialViewUrl,
        front_view_url: formData.frontViewUrl,
        side_view_url: formData.sideViewUrl,
        market_rent: parseFloat(formData.price || '0'),
        registration: formData.matricula || 'N/A',
        sequencial: formData.sequencial || 'N/A',

        // Defaults e outros campos
        has_ficha: !!(formData.terrainMarkingUrl && formData.aerialViewUrl),
      };

      let result;
      if (selectedPropertyId) {
        result = await supabase
          .from('properties')
          .update(propertyToSave)
          .eq('id', selectedPropertyId);
      } else {
        result = await supabase
          .from('properties')
          .insert([propertyToSave]);
      }

      if (result.error) throw result.error;

      alert(selectedPropertyId ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!');
      await fetchProperties();

      // Log the action
      logAction(
        selectedPropertyId ? 'ATUALIZAÇÃO DE IMÓVEL' : 'CRIAÇÃO DE IMÓVEL',
        `Imóvel: ${formData.title}${formData.city ? `, Cidade: ${formData.city}` : ''}`
      );

      setCurrentView('properties');

      // Limpar form
      setSelectedPropertyId(null);
      setFormData({
        title: '',
        type: PropertyType.CASA,
        description: '',
        isComplex: false,
        address: '',
        number: '',
        neighborhood: '',
        complement: '',
        city: '',
        state: '',
        cep: '',
        landArea: '',
        builtArea: '',
        mainQuota: '',
        lateralQuota: '',
        floors: '',
        terrainConfig: 'regular',
        iptuValue: '',
        spuValue: '',
        otherTaxes: '',
        terrainMarkingUrl: null,
        aerialViewUrl: null,
        frontViewUrl: null,
        sideViewUrl: null,
        price: '',
        matricula: '',
        sequencial: '',
        images: []
      } as PropertyData);

    } catch (error: any) {
      console.error('Erro ao salvar imóvel:', error);
      alert('Erro ao salvar imóvel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    const complexGroups = new Set();

    // Extrai o identificador do complexo (ex: "Complexo Agamenon" → "complexo agamenon")
    const extractComplexId = (name: string) => {
      const normalized = name?.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") || '';
      const match = normalized.match(/complexo\s+(\w+)/i);
      return match ? match[0] : null;
    };

    return properties.filter(p => {
      // Regra de unificação de complexos:
      // Se for um complexo, mostrar apenas o primeiro registro encontrado com aquele identificador "Complexo X"
      if (p.is_complex) {
        const complexId = extractComplexId(p.name);
        if (complexId) {
          if (complexGroups.has(complexId)) return false;
          complexGroups.add(complexId);
        } else {
          // Fallback para nome completo normalizado
          const normalize = (str: string) => str?.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") || '';
          const nameKey = normalize(p.name);
          if (complexGroups.has(nameKey)) return false;
          complexGroups.add(nameKey);
        }
      }

      // Ocultar unidades (filhos) se houver parent_id (caso o banco seja atualizado no futuro)
      if (p.parent_id) return false;

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

      const matchesCategory = selectedCategory === 'all' ||
        (selectedCategory === 'complex' ? p.is_complex : !p.is_complex);

      return matchesSearch && matchesCity && matchesState && matchesStatus && matchesFicha && matchesCategory;
    });
  }, [properties, searchTerm, selectedCity, selectedState, selectedStatus, selectedFichaStatus, selectedCategory]);

  const uniqueCities = useMemo(() => Array.from(new Set(properties.map(p => p.city).filter(Boolean))), [properties]);
  const uniqueStates = useMemo(() => Array.from(new Set(properties.map(p => p.state).filter(Boolean))), [properties]);

  const handleGenerateFicha = (id: string) => {
    setSelectedPropertyId(id);
    setIsSheetModalOpen(true);
  };

  const handleEditProperty = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    setFormData({
      title: property.name || '',
      type: (property.property_type as PropertyType) || PropertyType.CASA,
      description: property.description || '',
      isComplex: property.is_complex || false,
      address: property.address || '',
      number: property.number || '',
      neighborhood: property.neighborhood || '',
      complement: property.complement || '',
      city: property.city || '',
      state: property.state || '',
      cep: property.zip_code || '',
      landArea: property.land_area?.toString() || '',
      builtArea: property.built_area?.toString() || '',
      mainQuota: property.main_quota?.toString() || '',
      lateralQuota: property.lateral_quota?.toString() || '',
      floors: property.floors?.toString() || '',
      terrainConfig: property.terrain_config || 'regular',
      iptuValue: property.iptu_value?.toString() || '',
      spuValue: property.spu_value?.toString() || '',
      otherTaxes: property.other_taxes?.toString() || '',
      terrainMarkingUrl: property.terrain_marking_url,
      aerialViewUrl: property.aerial_view_url,
      frontViewUrl: property.front_view_url,
      sideViewUrl: property.side_view_url,
      price: property.market_rent?.toString() || '',
      matricula: property.registration || '',
      sequencial: property.sequencial || '',
      images: []
    });

    setSelectedPropertyId(id);
    setCurrentView('form');
  };

  const handleDeleteProperty = async (id: string) => {
    // Check permission to delete property
    const userRole = session?.user_metadata?.role || 'Visitante';
    if (!['Administrador', 'Gestor'].includes(userRole)) {
      alert('Acesso Negado: Apenas Administradores e Gestores podem excluir imóveis.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Imóvel excluído com sucesso!');

      const deletedProperty = properties.find(p => p.id === id);
      await fetchProperties();

      // Log the action
      if (deletedProperty) {
        logAction('EXCLUSÃO DE IMÓVEL', `Imóvel: ${deletedProperty.name}`);
      }

      setCurrentView('properties');
      setSelectedDetailPropertyId(null);
    } catch (error: any) {
      console.error('Erro ao excluir imóvel:', error);
      alert('Erro ao excluir imóvel: ' + error.message);
    } finally {
      setLoading(false);
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
          <div className="w-12 h-12 border-4 border-[#A64614] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (publicPropertyId) {
      // Show loading while fetching public property
      if (publicPropertyLoading) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#A64614] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Carregando ficha...</p>
            </div>
          </div>
        );
      }

      if (publicProperty && !isLeadCaptured) {
        return <LeadCaptureForm
          propertyId={publicPropertyId}
          propertyName={publicProperty.name}
          onSuccess={() => setIsLeadCaptured(true)}
        />;
      }
      if (publicProperty && isLeadCaptured) {
        return <PublicPropertySheet property={publicProperty} onBack={() => {
          setPublicPropertyId(null);
          setPublicProperty(null);
          window.history.replaceState({}, '', '/');
        }} />;
      }
      if (!publicProperty && !publicPropertyLoading) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
              <h2 className="text-xl font-bold text-slate-800">Imóvel não encontrado</h2>
              <p className="text-slate-500 mt-2">O link pode estar quebrado ou o imóvel não está mais disponível.</p>
              {['Administrador', 'Gestor', 'Usuário'].includes(session?.user_metadata?.role || 'Visitante') && (
                <button
                  onClick={() => {
                    setCurrentView('form');
                    setSelectedPropertyId(null); // Clear selected property for new creation
                  }}
                  className="mt-6 bg-[#A64614] text-white px-6 py-2 rounded-xl font-bold"
                >
                  Novo Imóvel
                </button>
              )}
            </div>
          </div>
        );
      }
    }
    return <Auth onAuthSuccess={() => fetchProperties()} />;
  }

  if (forcePasswordChange && session) {
    return <PasswordChangeModal userId={session.id} onSuccess={() => setForcePasswordChange(false)} />;
  }

  const renderContent = () => {
    if (currentView === 'tracking') {
      return (
        <SystemLogs onBack={() => setCurrentView('dashboard')} />
      );
    }

    if (currentView === 'dashboard') {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Dashboard />
        </div>
      );
    }

    if (currentView === 'leads') {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LeadsListView
            userRole={session?.user_metadata?.role || 'Visitante'}
            onBack={() => setCurrentView('dashboard')}
            onLogAction={logAction}
          />
        </div>
      );
    }

    if (currentView === 'negotiation') {
      return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
          <NegotiationKanban
            userRole={session?.user_metadata?.role || 'Visitante'}
            onLogAction={logAction}
          />
        </div>
      );
    }

    if (currentView === 'properties') {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-10">
            <PageHeader
              title="Base de Imóveis"
              subtitle={`Gerencie seus ${filteredProperties.length} imóveis (unificados) cadastrados no ImobLead.`}
              actions={['Administrador', 'Gestor', 'Usuário'].includes(session?.user_metadata?.role || 'Visitante') ? [
                { label: 'Novo Imóvel', onClick: () => setCurrentView('form'), icon: <Plus className="w-4 h-4" />, variant: 'primary' }
              ] : []}
            />
          </div>

          <PropertyFilters
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            selectedCity={selectedCity} setSelectedCity={setSelectedCity}
            selectedState={selectedState} setSelectedState={setSelectedState}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            selectedFichaStatus={selectedFichaStatus} setSelectedFichaStatus={setSelectedFichaStatus}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
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
                  onViewDetails={(id) => {
                    setSelectedDetailPropertyId(id);
                    setCurrentView('details');
                  }}
                />
              ))}
            </div>
          ) : (
            <PropertyListView
              properties={filteredProperties}
              onGenerateFicha={handleGenerateFicha}
              onViewDetails={(id) => {
                setSelectedDetailPropertyId(id);
                setCurrentView('details');
              }}
            />
          )}
        </div>
      );
    }

    if (currentView === 'details') {
      const property = properties.find(p => p.id === selectedDetailPropertyId);
      if (!property) return null;
      return (
        <PropertyDetails
          property={property}
          allProperties={properties}
          onBack={() => {
            setCurrentView('properties');
            setSelectedDetailPropertyId(null);
          }}
          onGenerateFicha={handleGenerateFicha}
          onEditProperty={handleEditProperty}
          onDeleteProperty={handleDeleteProperty}
          user={session}
        />
      );
    }

    if (currentView === 'form') {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeader
            title={selectedPropertyId ? "Atualizar Imóvel" : "Incluir Novo Imóvel"}
            subtitle="Preencha os detalhes abaixo para cadastrar o imóvel no sistema."
            breadcrumbs={[
              { label: 'Imóveis', onClick: () => setCurrentView('properties') },
              { label: selectedPropertyId ? 'Atualizar Imóvel' : 'Incluir Novo Imóvel', active: true }
            ]}
            actions={[
              { label: 'Voltar', onClick: () => setCurrentView('properties'), icon: <ArrowLeft className="w-4 h-4" />, variant: 'secondary' },
              {
                label: selectedPropertyId ? 'Atualizar Imóvel' : 'Salvar Imóvel',
                onClick: handleSave,
                icon: <Plus className="w-4 h-4" />,
                variant: 'primary',
                disabled: loading
              }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">1</div>
                  Informações Básicas
                </h2>

                <div className="space-y-4">
                  {/* Título do Imóvel */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Título do Imóvel</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Mansão Moderna com Piscina Infinita"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Tipo de Imóvel e Classificação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Tipo de Imóvel</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        title="Selecione o tipo de imóvel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 bg-white"
                      >
                        {Object.values(PropertyType).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Classificação</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-semibold text-xs transition-all ${!formData.isComplex
                            ? 'border-[#A64614] bg-orange-50 text-orange-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          onClick={() => setFormData(prev => ({ ...prev, isComplex: false }))}
                        >
                          Único
                        </button>
                        <button
                          type="button"
                          className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-semibold text-xs transition-all ${formData.isComplex
                            ? 'border-[#A64614] bg-orange-50 text-orange-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          onClick={() => setFormData(prev => ({ ...prev, isComplex: true }))}
                        >
                          Complexo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Endereço e Número */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Endereço</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        placeholder="Rua, Avenida, etc."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Número</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number || ''}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Bairro, Cidade, UF */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Bairro</label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood || ''}
                        onChange={handleInputChange}
                        placeholder="Centro"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Complemento</label>
                      <input
                        type="text"
                        name="complement"
                        value={formData.complement || ''}
                        onChange={handleInputChange}
                        placeholder="Sala 101, Bloco A"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Cidade</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        placeholder="São Paulo"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">UF</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        placeholder="SP"
                        maxLength={2}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 placeholder:text-slate-400 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                  Apresentação do Imóvel
                </h2>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Descrição do Imóvel</label>
                    <button
                      onClick={handleGenerateAiDescription}
                      disabled={loadingAi}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-[#A64614] hover:text-orange-700 transition-colors bg-orange-50 px-2 py-1 rounded-lg disabled:opacity-50"
                    >
                      <span className="w-3 h-3 flex items-center justify-center text-[8px] bg-[#A64614] text-white rounded-full">✨</span>
                      {loadingAi ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Destaque as principais características, comodidades e pontos de venda..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700 resize-none"
                  />
                </div>
              </section>

              {/* Seção 2.5: Registros */}


              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">3</div>
                  Registros
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Matrículas</label>
                    <input
                      type="text"
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleInputChange}
                      placeholder="Ex: 123.456, 789.012"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Sequenciais</label>
                    <input
                      type="text"
                      name="sequencial"
                      value={formData.sequencial}
                      onChange={handleInputChange}
                      placeholder="Ex: 1.234.567-8"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">4</div>
                  Parâmetros Construtivos
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Área do Terreno (m²)</label>
                    <input
                      type="text"
                      name="landArea"
                      value={formData.landArea || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Área Construída (m²)</label>
                    <input
                      type="text"
                      name="builtArea"
                      value={formData.builtArea || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Testada Principal (m)</label>
                    <input
                      type="text"
                      name="mainQuota"
                      value={formData.mainQuota || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Cota Lateral (m)</label>
                    <input
                      type="text"
                      name="lateralQuota"
                      value={formData.lateralQuota || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Qtd. de Pavimentos</label>
                    <input
                      type="text"
                      name="floors"
                      value={formData.floors || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Configuração do Terreno</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="terrainConfig"
                        value="regular"
                        checked={formData.terrainConfig === 'regular'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#A64614]"
                      />
                      <span className="text-sm text-slate-700">Regular</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="terrainConfig"
                        value="irregular"
                        checked={formData.terrainConfig === 'irregular'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#A64614]"
                      />
                      <span className="text-sm text-slate-700">Irregular</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Seção 4: Impostos */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">5</div>
                  Impostos
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Valor do IPTU (R$)</label>
                    <input
                      type="text"
                      name="iptuValue"
                      value={formData.iptuValue || ''}
                      onChange={handleInputChange}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">SPU (R$)</label>
                    <input
                      type="text"
                      name="spuValue"
                      value={formData.spuValue || ''}
                      onChange={handleInputChange}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Outros Impostos (R$)</label>
                    <input
                      type="text"
                      name="otherTaxes"
                      value={formData.otherTaxes || ''}
                      onChange={handleInputChange}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-50 text-[#A64614] rounded-lg flex items-center justify-center font-bold text-sm">6</div>
                  Informações de Aluguel
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Valor de Aluguel (R$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSign size={18} />
                    </div>
                    <input
                      type="text"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="0.000.000"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A64614]/20 focus:border-[#A64614] transition-all text-slate-700"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar com Upload de Imagens */}
            <Sidebar>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A64614]">photo_library</span>
                  Imagens do Imóvel
                </h3>
                <p className="text-xs text-slate-500">
                  Arraste ou clique para fazer upload das imagens. Elas serão usadas na ficha técnica.
                </p>

                {/* Upload Cards */}
                <div className="space-y-3">
                  <ImageUploadCard
                    title="Marcação do Terreno"
                    description="Imagem aérea com demarcação"
                    icon="🗺️"
                    initialValue={formData.terrainMarkingUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, terrainMarkingUrl: url }))}
                  />
                  <ImageUploadCard
                    title="Visão Aérea"
                    description="Visão aérea da região"
                    icon="🛰️"
                    initialValue={formData.aerialViewUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, aerialViewUrl: url }))}
                  />
                  <ImageUploadCard
                    title="Vista Frontal"
                    description="Foto frontal do imóvel"
                    icon="🏠"
                    initialValue={formData.frontViewUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, frontViewUrl: url }))}
                  />
                  <ImageUploadCard
                    title="Vista Lateral"
                    description="Foto lateral do imóvel"
                    icon="📐"
                    initialValue={formData.sideViewUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, sideViewUrl: url }))}
                  />
                </div>
              </div>
            </Sidebar>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout
      user={session}
      currentView={currentView}
      onViewChange={(view: any) => setCurrentView(view)}
    >
      {renderContent()}

      {isSheetModalOpen && selectedPropertyId && (
        <PropertySheetModal
          property={properties.find(p => p.id === selectedPropertyId)!}
          onClose={() => {
            setIsSheetModalOpen(false);
            setSelectedPropertyId(null);
          }}
        />
      )}
    </Layout>
  );
};

// Componente de Upload de Imagem com Drag & Drop
const ImageUploadCard = ({ title, description, icon, initialValue, onChange }: {
  title: string;
  description: string;
  icon: string;
  initialValue?: string | null;
  onChange: (url: string | null) => void;
}) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(initialValue || null);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImageUrl(initialValue || null);
  }, [initialValue]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer ${isDragging ? 'border-[#A64614] bg-slate-50' : 'border-slate-200 hover:border-[#A64614]'
        }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageUrl ? (
        <div className="relative">
          <img src={imageUrl} alt={title} className="w-full h-20 object-cover rounded-lg" />
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
          <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
            ✓ {title}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">{title}</p>
            <p className="text-xs text-slate-400 truncate">{description}</p>
          </div>
          <span className="text-slate-300 text-lg">+</span>
        </div>
      )}
    </div>
  );
};

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
