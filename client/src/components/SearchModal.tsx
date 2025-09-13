import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchOption {
  codigo: number;
  nome?: string;
  descricao?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: SearchOption) => void;
  title: string;
  searchEndpoint: string;
  searchField: 'nome' | 'descricao';
  displayField: 'nome' | 'descricao';
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  searchEndpoint,
  searchField,
  displayField
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    console.log('SearchModal - Making API request to:', `${API_BASE_URL}${url}`);
    console.log('SearchModal - Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('SearchModal - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SearchModal - API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('SearchModal - Response data:', data);
    return data;
  };

  const loadOptions = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Sempre usar endpoint de lookup primeiro
      const response = await apiRequest(searchEndpoint);
      
      // Remover duplicados baseado no código
      const uniqueOptions = response.data.filter((option: SearchOption, index: number, self: SearchOption[]) =>
        index === self.findIndex((o) => o.codigo === option.codigo)
      );
      
      console.log('SearchModal - Loaded options:', {
        total: response.data.length,
        unique: uniqueOptions.length,
        hasDuplicates: response.data.length !== uniqueOptions.length
      });
      
      setOptions(uniqueOptions);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    } else {
      setSearchTerm('');
      setOptions([]);
      setCurrentPage(1);
    }
  }, [isOpen]);

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
    onClose();
  };

  // Função para normalizar texto removendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredOptions = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return options;
    }

    const searchNormalized = normalizeText(searchTerm.trim());

    // Filtrar apenas pelo campo indicado em `searchField`
    const filtered = options.filter(option => {
      const fieldValue = normalizeText((option as any)[searchField] || '');
      return fieldValue.includes(searchNormalized);
    });

    // Garantir que não há duplicados no resultado final (por código)
    const uniqueFiltered = filtered.filter((option, index, self) =>
      index === self.findIndex((o) => o.codigo === option.codigo)
    );

    return uniqueFiltered;
  }, [options, searchTerm, searchField]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Digite para pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredOptions.length === 0 
                ? 'Nenhum resultado encontrado' 
                : `${filteredOptions.length} resultado${filteredOptions.length !== 1 ? 's' : ''} encontrado${filteredOptions.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">A carregar...</div>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">
                {searchTerm ? 'Nenhum resultado corresponde à pesquisa' : 'Digite para pesquisar'}
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {filteredOptions.slice(0, 100).map((option, index) => (
                  <div
                    key={`${option.codigo}-${index}`}
                    onClick={() => handleSelect(option)}
                    className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {option[displayField] || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {option.codigo}
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium">
                      Seleccionar
                    </div>
                  </div>
                ))}
              </div>
              {filteredOptions.length > 100 && (
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm text-center">
                  Mostrando apenas os primeiros 100 resultados. Digite mais para refinar a busca.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
