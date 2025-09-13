import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import ProcessSearchModal from '../../components/ProcessSearchModal';

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

interface FichaProcesso {
  r_linha: number;
  r_data: string;
  r_processo_id: number;
  r_processo: string;
  r_cor_id: number;
  r_codigo_cor: string;
  r_cor_malha: string;
  r_rolos: number;
  r_pesos: number;
  r_obs: string;
}

const ProcessosPage = () => {
  const [faNumber, setFaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fichaData, setFichaData] = useState<FichaEntrada | null>(null);
  const [processos, setProcessos] = useState<FichaProcesso[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [selectedProcesso, setSelectedProcesso] = useState<{id: number, descricao: string} | null>(null);
  const [selectedCor, setSelectedCor] = useState<{id: number, codigo_cor: string, malha: string} | null>(null);
  const [rolos, setRolos] = useState('');
  const [pesos, setPesos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [gramagem, setGramagem] = useState('');
  const [medidas, setMedidas] = useState('');

  // Modal state
  const [showProcessoModal, setShowProcessoModal] = useState(false);
  const [showCorModal, setShowCorModal] = useState(false);

  // Ultima FA state
  const [ultimaFA, setUltimaFA] = useState<{numero: number | null, data: string | null}>({numero: null, data: null});

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

  const loadProcessos = async (faNum: string) => {
    try {
      const response = await apiRequest(`/processos/ficha-processos/${faNum}`);

      if (response.success && response.data) {
        setProcessos(response.data);
      } else {
        setProcessos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      setProcessos([]);
    }
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
        setFichaData(response.data);
        // Load processes after loading ficha data
        await loadProcessos(faNumber);
      } else {
        setError('Ficha não encontrada');
        setFichaData(null);
        setProcessos([]);
      }
    } catch (error) {
      console.error('Erro ao pesquisar ficha:', error);
      setError('Erro ao pesquisar ficha. Tente novamente.');
      setFichaData(null);
      setProcessos([]);
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
    setProcessos([]);
    setError('');
    clearForm();
  };

  const clearForm = () => {
    setSelectedProcesso(null);
    setSelectedCor(null);
    setRolos('');
    setPesos('');
    setObservacoes('');
    setGramagem('');
    setMedidas('');
  };

  const handleProcessoSelect = (processo: any) => {
    setSelectedProcesso({
      id: processo.ID,
      descricao: processo.DESCRICAO
    });

    // Auto-fill rolos e pesos se estão vazios
    if (!rolos && fichaData) {
      setRolos(fichaData.r_rolos.toString());
    }
    if (!pesos && fichaData) {
      setPesos(fichaData.r_pesos.toString());
    }
  };

  const handleCorSelect = (cor: any) => {
    setSelectedCor({
      id: cor.ID,
      codigo_cor: cor.CODIGO_COR,
      malha: cor.MALHA || ''
    });
  };

  const handleAddProcesso = async () => {
    if (!selectedProcesso) {
      setError('Por favor, selecione um processo');
      return;
    }

    if (!rolos || !pesos) {
      setError('Por favor, preencha rolos e pesos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/processos/add/${fichaData?.r_fa_numero}`, {
        method: 'POST',
        body: JSON.stringify({
          processoId: selectedProcesso.id,
          corId: selectedCor?.id || null,
          rolos: rolos,
          pesos: pesos,
          observacoes: observacoes,
          gramagem: gramagem,
          medidas: medidas
        })
      });

      if (response.success) {
        // Clear form after successful addition
        clearForm();

        // Reload processes to show the new one
        await loadProcessos(fichaData?.r_fa_numero.toString() || '');

        // Show success message (optional)
        console.log('Processo adicionado com sucesso!');
      } else {
        setError(response.message || 'Erro ao adicionar processo');
      }
    } catch (error) {
      console.error('Erro ao adicionar processo:', error);
      setError('Erro ao adicionar processo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProcesso = async (linha: number) => {
    if (!fichaData) return;

    if (!confirm('Tem a certeza que deseja remover este processo?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/processos/remove/${fichaData.r_fa_numero}/${linha}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Reload processes to show updated list
        await loadProcessos(fichaData.r_fa_numero.toString());

        // Show success message (optional)
        console.log('Processo removido com sucesso!');
      } else {
        setError(response.message || 'Erro ao remover processo');
      }
    } catch (error) {
      console.error('Erro ao remover processo:', error);
      setError('Erro ao remover processo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFichaEntrada = async () => {
    if (!fichaData) return;

    if (!confirm('Tem a certeza que deseja remover TODA a ficha de entrada?\n\nEsta acção irá eliminar permanentemente a ficha e todos os processos associados.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/processos/remove-ficha/${fichaData.r_fa_numero}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Clear all data after successful removal
        setFichaData(null);
        setProcessos([]);
        clearForm();
        setFaNumber('');

        // Reload ultima FA in case it changed
        await loadUltimaFA();

        // Show success message (optional)
        console.log('Ficha de entrada removida com sucesso!');
      } else {
        setError(response.message || 'Erro ao remover ficha de entrada');
      }
    } catch (error) {
      console.error('Erro ao remover ficha de entrada:', error);
      setError('Erro ao remover ficha de entrada. Tente novamente.');
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

  // Load ultima FA when component mounts
  useEffect(() => {
    loadUltimaFA();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tinturaria - Processos</h1>
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
            <button
              onClick={handleRemoveFichaEntrada}
              disabled={loading}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Remover Ficha Acabamento
            </button>
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
              <div className="text-xs text-gray-500 mb-1">Gramagem</div>
              <div className="font-semibold text-sm">{fichaData.r_gramagem || '-'}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="text-xs text-gray-500 mb-1">Requisição</div>
              <div className="font-semibold text-sm truncate">{fichaData.r_requisicao || '-'}</div>
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

      {/* Process Entry Form */}
      {fichaData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">

            <div className="flex items-center gap-2 flex-1 min-w-48">
              <label className="text-sm font-medium text-gray-700">Acabamento:</label>
              <div className="flex gap-1 flex-1">
                <input
                  type="text"
                  value={selectedProcesso?.descricao || ''}
                  readOnly
                  placeholder="Selecione um processo"
                  className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50"
                />
                <button
                  onClick={() => setShowProcessoModal(true)}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-32">
              <label className="text-sm font-medium text-gray-700">Cor:</label>
              <div className="flex gap-1 flex-1">
                <input
                  type="text"
                  value={selectedCor?.codigo_cor || ''}
                  readOnly
                  placeholder="Selecione uma cor"
                  className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50"
                />
                <button
                  onClick={() => setShowCorModal(true)}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Rolos:</label>
              <input
                type="number"
                value={rolos}
                onChange={(e) => setRolos(e.target.value)}
                className="w-20 text-sm border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Pesos:</label>
              <input
                type="number"
                step="0.01"
                value={pesos}
                onChange={(e) => setPesos(e.target.value)}
                className="w-24 text-sm border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleAddProcesso}
              disabled={loading || !selectedProcesso}
              className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? 'A adicionar...' : 'Adicionar'}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <label className="text-sm font-medium text-gray-700">Observações:</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Gramagem:</label>
              <input
                type="number"
                value={gramagem}
                onChange={(e) => setGramagem(e.target.value)}
                className="w-24 text-sm border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Medidas:</label>
              <input
                type="number"
                step="0.01"
                value={medidas}
                onChange={(e) => setMedidas(e.target.value)}
                className="w-24 text-sm border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Processes Table */}
      {fichaData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Processos de Acabamento</h3>
            {processos.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {processos.length} processo{processos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Li</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Data</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Acabamento</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Cor</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Rolos</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Pesos</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Obs</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Acções</th>
                </tr>
              </thead>
              <tbody>
                {processos.length > 0 ? (
                  processos.map((processo, index) => (
                    <tr key={`${processo.r_linha}-${index}`} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">{processo.r_linha}</td>
                      <td className="px-3 py-2 text-sm">
                        {new Date(processo.r_data).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium">{processo.r_processo}</td>
                      <td className="px-3 py-2 text-sm">
                        {processo.r_cor_id > 0 ? (
                          <span>
                            {processo.r_codigo_cor}
                            {processo.r_cor_malha && ` - ${processo.r_cor_malha}`}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-medium">
                        {processo.r_rolos.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-medium">
                        {processo.r_pesos.toFixed(1)}
                      </td>
                      <td className="px-3 py-2 text-sm">{processo.r_obs || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleRemoveProcesso(processo.r_linha)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remover processo"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500 text-sm">
                      Nenhum processo registado. Use o formulário acima para adicionar processos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Modals */}
      <ProcessSearchModal
        isOpen={showProcessoModal}
        onClose={() => setShowProcessoModal(false)}
        onSelect={handleProcessoSelect}
        title="Selecionar Processo"
        searchEndpoint="/processos/search/processos"
        type="processo"
      />

      <ProcessSearchModal
        isOpen={showCorModal}
        onClose={() => setShowCorModal(false)}
        onSelect={handleCorSelect}
        title="Selecionar Cor"
        searchEndpoint="/processos/search/cores"
        type="cor"
      />
    </div>
  );
};

export default ProcessosPage;