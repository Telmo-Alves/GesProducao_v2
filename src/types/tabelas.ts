export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ClienteOption {
  codigo: number;
  nome: string;
  contactos?: string;
  situacao?: string;
}

export interface ArtigoOption {
  codigo: number;
  descricao: string;
  un_medida?: string;
  situacao?: string;
  seccao?: number;
}

export interface ComposicaoOption {
  codigo: number;
  descricao: string;
  situacao?: string;
}

export interface CreateClienteDto {
  codigo: number;
  nome: string;
  contactos?: string;
  situacao?: string;
}

export interface UpdateClienteDto {
  nome?: string;
  contactos?: string;
  situacao?: string;
}

export interface CreateArtigoDto {
  codigo: number;
  descricao: string;
  un_medida?: string;
  situacao?: string;
  seccao?: number;
}

export interface UpdateArtigoDto {
  descricao?: string;
  un_medida?: string;
  situacao?: string;
  seccao?: number;
}

export interface CreateComposicaoDto {
  codigo: number;
  descricao: string;
  situacao?: string;
}

export interface UpdateComposicaoDto {
  descricao?: string;
  situacao?: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Unidades de Medida (UN_MEDIDAS)
export interface UnidadeMedidaOption {
  un_medida: string;
  descricao: string;
  medida?: number;
}

export interface CreateUnidadeMedidaDto {
  un_medida: string;
  descricao: string;
  medida?: number;
}

export interface UpdateUnidadeMedidaDto {
  descricao?: string;
  medida?: number;
}

// Secções (TAB_SECCOES)
export interface SeccaoOption {
  seccao: number;
  descricao: string;
  ordem?: number;
  situacao?: string;
}

export interface CreateSeccaoDto {
  seccao: number;
  descricao: string;
  ordem?: number;
  situacao?: string;
}

export interface UpdateSeccaoDto {
  descricao?: string;
  ordem?: number;
  situacao?: string;
}
