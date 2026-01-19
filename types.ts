export enum PropertyType {
  CASA = 'Casa',
  APARTAMENTO = 'Apartamento',
  LOJA = 'Loja',
  GALPAO = 'Galpão',
  PREDIO = 'Prédio',
  TERRENO = 'Terreno',
  SALA = 'Sala',
  QUIOSQUE = 'Quiosque'
}

export enum PropertyStatus {
  DISPONIVEL = 'DISPONÍVEL',
  LOCADO = 'LOCADO',
  EM_USO = 'EM USO',
  RESERVADO = 'RESERVADO',
  A_VENDA = 'À VENDA'
}

export interface Property {
  id: string;
  status: PropertyStatus;
  owner: string;
  is_complex: boolean;
  name: string;
  description: string;
  property_type: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  zip_code: string;
  registration: string;
  state: string;
  region: string;
  tenant: string;
  tenant_category: string;
  built_area: number;
  land_area: number;
  purchase_year: number | null;
  matricula: string;
  sequencial: string;
  min_rent: number;
  variable_rent: number;
  purchase_value: number;
  market_value: number;
  market_rent: number;
  rent_dy: number;
  rent_sqm: number;
  has_ficha: boolean;
  image_url: string | null;
  parent_id: string | null;
  created_at?: string;

  // Parâmetros Construtivos
  main_quota: number;           // Testada Principal (m)
  lateral_quota: number;        // Cota Lateral (m)
  floors: number;               // Quantidade de Pavimentos
  terrain_config: 'regular' | 'irregular';  // Configuração do Terreno

  // Impostos
  iptu_value: number;           // Valor do IPTU (R$)
  spu_value: number;            // Valor SPU (R$)
  other_taxes: number;          // Outros Impostos (R$)

  // Imagens Específicas
  terrain_marking_url: string | null;   // Marcação do Terreno
  aerial_view_url: string | null;       // Visão Aérea
  front_view_url: string | null;        // Vista Frontal
  side_view_url: string | null;         // Vista Lateral

  // Aluguel
  price: number | null;                 // Valor de Aluguel
}

export interface PropertyImage {
  id: string;
  url: string;
  isCover: boolean;
  status: 'uploading' | 'uploaded' | 'error';
}

export interface PropertyData {
  title: string;
  type: PropertyType;
  description: string;
  isComplex: boolean;
  address: string;
  number: string;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  cep: string;

  // Parâmetros Construtivos
  landArea: string;
  builtArea: string;
  mainQuota: string;
  lateralQuota: string;
  floors: string;
  terrainConfig: 'regular' | 'irregular';

  // Impostos
  iptuValue: string;
  spuValue: string;
  otherTaxes: string;

  // Aluguel
  price: string;

  // Imagens Específicas
  terrainMarkingUrl: string | null;
  aerialViewUrl: string | null;
  frontViewUrl: string | null;
  sideViewUrl: string | null;
  matricula: string;
  sequencial: string;
  images: PropertyImage[];
  status: PropertyStatus;
}

export interface Lead {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string;
  level?: string;
  marking?: string;
  author_id?: string;
  author_name?: string; // Joined field
  role?: string;
  company?: string;
  created_at: string;
}

export enum NegotiationStage {
  OPPORTUNITY = 'Oportunidade',
  CONTACTING = 'Contactando',
  ENGAGED = 'Engajado',
  NEGOTIATING = 'Negociando',
  CLOSED_WON = 'Negócio Fechado',
  CLOSED_LOST = 'Perdido'
}

export interface Negotiation {
  id: string;
  title: string;
  client_name: string;
  value?: number;
  probability: number;
  stage: NegotiationStage;
  property_id?: string | null;
  created_at: string;
  properties?: Property | null;
}
