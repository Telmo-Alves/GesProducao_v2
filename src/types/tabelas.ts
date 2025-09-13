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
}

export interface CreateClienteDto {
  codigo: number;
  nome: string;
  contactos?: string;
}

export interface UpdateClienteDto {
  nome?: string;
  contactos?: string;
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
}

export interface UpdateComposicaoDto {
  descricao?: string;
}

export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
}
