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
  min_rent: number;
  variable_rent: number;
  purchase_value: number;
  market_value: number;
  market_rent: number;
  rent_dy: number;
  rent_sqm: number;
  has_ficha: boolean;
  image_url: string | null;
  created_at?: string;
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
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  address: string;
  city: string;
  cep: string;
  images: PropertyImage[];
}
