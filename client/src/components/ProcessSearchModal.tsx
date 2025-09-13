import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface ProcessSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: any) => void;
  title: string;
  searchEndpoint: string;
  type: 'processo' | 'cor';
}

const ProcessSearchModal: React.FC<ProcessSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  searchEndpoint,
  type
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  };

  const loadOptions = async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const response = await apiRequest(searchEndpoint);
      console.log('ProcessSearchModal - Response:', response);
      setOptions(response.data || []);
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
    }
  }, [isOpen]);

  const handleSelect = (option: any) => {
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

    return options.filter(option => {
      if (type === 'processo') {
        const descricao = normalizeText(option.DESCRICAO || '');
        return descricao.includes(searchNormalized);
      } else {
        const codigoCor = normalizeText(option.CODIGO_COR || '');
        const malha = normalizeText(option.MALHA || '');
        return codigoCor.includes(searchNormalized) || malha.includes(searchNormalized);
      }
    });
  }, [options, searchTerm, type]);

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
            <div className="divide-y">
              {filteredOptions.slice(0, 100).map((option, index) => (
                <div
                  key={`${option.ID}-${index}`}
                  onClick={() => handleSelect(option)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div className="flex-1">
                    {type === 'processo' ? (
                      <>
                        <div className="font-medium">
                          {option.DESCRICAO}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {option.ID}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium">
                          {option.CODIGO_COR}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.MALHA && `${option.MALHA} • `}ID: {option.ID}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">
                    Seleccionar
                  </div>
                </div>
              ))}
            </div>
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

export default ProcessSearchModal;