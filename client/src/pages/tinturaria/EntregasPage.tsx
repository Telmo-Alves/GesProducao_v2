import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FichaEntrada {
  r_fa_seccao: number;
  r_fa_numero: number;
  r_fa_data: string;
  r_rolos: number;
  r_pesos: number;
  r_rolos_entregues: number;
  r_pesos_entregues: number;
  r_gramagem: number;
  r_medidas: number;
  r_obs: string;
  r_estado: number;
  r_estado_descricao: string;
  r_producao: string;
  r_cliente: number;
  r_cliente_nome: string;
  r_artigo_codigo: number;
  r_artigo_descricao: string;
  r_composicao: number;
  r_composicao_descricao: string;
  r_branquear: string;
  r_desencolar: string;
  r_tingir: string;
  r_id_cor: number;
  r_codigo_cor: string;
  r_requisicao: string;
}


const EntregasPage = () => {
  const [faNumber, setFaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fichaData, setFichaData] = useState<FichaEntrada | null>(null);
  const [error, setError] = useState('');

  // Form state for delivery tracking
  const [rolosEntregues, setRolosEntregues] = useState('');
  const [pesosEntregues, setPesosEntregues] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<{id: number, descricao: string} | null>(null);
  const [observacoes, setObservacoes] = useState('');

  // Ultima FA state
  const [ultimaFA, setUltimaFA] = useState<{numero: number | null, data: string | null}>({numero: null, data: null});

  // Estados list
  const [estados, setEstados] = useState<{id: number, descricao: string}[]>([]);

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
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  };


  const handleSearch = async () => {
    if (!faNumber.trim()) {
      setError('Por favor, introduza um número de FA');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/processos/ficha-entrada/${faNumber}`);

      if (response.success && response.data) {
        const ficha = response.data;
        setFichaData(ficha);

        // Calculate remaining rolls to deliver
        const saldoRolos = ficha.r_rolos - (ficha.r_rolos_entregues || 0);

        // Set values - rolos entregues with the remaining balance, pesos entregues empty for new entry
        setRolosEntregues(saldoRolos.toString());
        setPesosEntregues('');

        // Check if there are no more rolls to deliver (after setting the data)
        if (ficha.r_rolos_entregues >= ficha.r_rolos) {
          setError('Não há mais rolos para entrega desta FA');
        }
      } else {
        setError('Ficha não encontrada');
        setFichaData(null);
      }
    } catch (error) {
      console.error('Erro ao pesquisar ficha:', error);
      setError('Erro ao pesquisar ficha. Tente novamente.');
      setFichaData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearScreen = () => {
    setFaNumber('');
    setFichaData(null);
    setError('');
    clearForm();
  };

  const clearForm = () => {
    setRolosEntregues('');
    setPesosEntregues('');
    setSelectedEstado(null);
    setObservacoes('');
  };

  const handleUpdateEntrega = async () => {
    if (!fichaData) return;

    if (!pesosEntregues || !selectedEstado) {
      setError('Por favor, preencha pesos entregues e selecione um estado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/entregas/registar/${fichaData.r_fa_numero}`, {
        method: 'POST',
        body: JSON.stringify({
          rolos: rolosEntregues || 0,
          pesos: pesosEntregues,
          estadoId: selectedEstado.id,
          observacoes: observacoes
        })
      });

      if (response.success) {
        console.log('Entrega registada com sucesso!');
        // Optionally reload ficha data to get updated values
        await handleSearch();
      } else {
        setError(response.message || 'Erro ao registar entrega');
      }

    } catch (error) {
      console.error('Erro ao actualizar entrega:', error);
      setError('Erro ao actualizar entrega. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadUltimaFA = async () => {
    try {
      const response = await apiRequest('/processos/ultima-fa');
      if (response.success && response.data) {
        setUltimaFA({
          numero: response.data.ultima_fa,
          data: response.data.ultima_data
        });
      }
    } catch (error) {
      console.error('Erro ao carregar última FA:', error);
    }
  };

  const loadEstados = async () => {
    try {
      const response = await apiRequest('/tabelas/estados');
      if (response.success && response.data) {
        // Map the data to match our interface
        const estadosData = response.data.map((estado: any) => ({
          id: estado.ESTADO,
          descricao: estado.DESCRICAO
        }));
        setEstados(estadosData);
      }
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      setEstados([]);
    }
  };

  // Load ultima FA and estados when component mounts
  useEffect(() => {
    loadUltimaFA();
    loadEstados();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tinturaria - Entregas</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Número FA:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={faNumber}
                  onChange={(e) => setFaNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: 12345"
                  className="w-32 text-lg font-semibold border rounded-lg px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Search size={18} />
                  {loading ? 'A carregar...' : 'Pesquisar'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Última FA:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ultimaFA.numero || '-'}
                  readOnly
                  className="w-20 text-sm font-semibold border rounded px-2 py-1.5 text-center bg-gray-50"
                />
                {ultimaFA.data && (
                  <span className="text-sm text-gray-600">
                    {new Date(ultimaFA.data).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleClearScreen}
            className="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
          >
            <X size={16} />
            Limpar
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Ficha Header */}
      {fichaData && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">FA {fichaData.r_fa_numero}</span>
              {fichaData.r_cliente_nome}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Data</div>
              <div className="font-semibold text-sm">{new Date(fichaData.r_fa_data).toLocaleDateString()}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Artigo</div>
              <div className="font-semibold text-sm truncate">{fichaData.r_artigo_descricao}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Composição</div>
              <div className="font-semibold text-sm truncate">{fichaData.r_composicao_descricao}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Rolos/Pesos</div>
              <div className="font-semibold text-sm">{fichaData.r_rolos} / {fichaData.r_pesos}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Entregues</div>
              <div className="font-semibold text-sm">{fichaData.r_rolos_entregues} / {fichaData.r_pesos_entregues}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Estado</div>
              <div className="font-semibold text-sm">{fichaData.r_estado_descricao}</div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <span className="text-xs text-gray-500">Processos:</span>
            {fichaData.r_branquear?.trim() === 'S' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Branquear</span>
            )}
            {fichaData.r_desencolar?.trim() === 'S' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Desencolar</span>
            )}
            {fichaData.r_tingir?.trim() === 'S' && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Tingir</span>
            )}
          </div>
        </div>
      )}

      {/* Delivery Update Form */}
      {fichaData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          {fichaData.r_rolos_entregues >= fichaData.r_rolos ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-green-700 mb-2">
                ✓ Entrega Completa
              </div>
              <div className="text-sm text-gray-600">
                Todos os rolos desta FA foram entregues ({fichaData.r_rolos_entregues}/{fichaData.r_rolos})
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Rolos a Entregar:</label>
                <input
                  type="number"
                  value={rolosEntregues}
                  readOnly
                  className="w-20 text-sm border rounded px-2 py-1 text-right bg-gray-50"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Pesos Entregues:</label>
                <input
                  type="number"
                  step="0.01"
                  value={pesosEntregues}
                  onChange={(e) => setPesosEntregues(e.target.value)}
                  className="w-24 text-sm border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-64">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <select
                  value={selectedEstado?.id || ''}
                  onChange={(e) => {
                    const estadoId = parseInt(e.target.value);
                    const estado = estados.find(est => est.id === estadoId);
                    setSelectedEstado(estado || null);
                  }}
                  className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um estado</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-64">
                <label className="text-sm font-medium text-gray-700">Observações:</label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações (opcional)"
                />
              </div>

              <button
                onClick={handleUpdateEntrega}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {loading ? 'A registar...' : 'Registar Entrega'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default EntregasPage;