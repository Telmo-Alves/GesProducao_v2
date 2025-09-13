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
