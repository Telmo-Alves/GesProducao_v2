import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, FileText, Printer } from 'lucide-react';
import SearchModal from '../components/SearchModal';

interface MovRecepcao {
  seccao: number;
  data: string;
  linha: number;
  cliente: number;
  nome: string;
  codigo: number;
  descricao: string;
  composicao: number;
  composicao_descricao: string;
  rolos: number;
  pesos: number;
  gramagem: number;
  medidas: number;
  branquear: 'S' | 'N';
  desencolar: 'S' | 'N';
  tingir: 'S' | 'N';
  rolos_entregues: number;
  pesos_entregues: number;
  requisicao?: string;
  utilizador: string;
  data_reg: string;
}

interface Cliente {
  codigo: number;
  nome: string;
}

interface Artigo {
  codigo: number;
  descricao: string;
}

interface Composicao {
  codigo: number;
  descricao: string;
}

const Recepcao = () => {
  const [recepcoes, setRecepcoes] = useState<MovRecepcao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [composicoes, setComposicoes] = useState<Composicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRecepcao, setSelectedRecepcao] = useState<MovRecepcao | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    nome: '',
    requisicao: '',
    dataInicio: '',
    dataFim: ''
  });

  const [searchModals, setSearchModals] = useState({
    cliente: false,
    artigo: false,
    composicao: false
  });

  const [formData, setFormData] = useState({
    seccao: 1,
    data: new Date().toISOString().split('T')[0],
    cliente: 0,
    nome: '',
    codigo: 0,
    descricao: '',
    composicao: 0,
    composicao_descricao: '',
    rolos: 0,
    pesos: 0,
    gramagem: 0,
    medidas: 0,
    branquear: 'N' as 'S' | 'N',
    desencolar: 'N' as 'S' | 'N',
    tingir: 'N' as 'S' | 'N',
    rolos_entregues: 0,
    pesos_entregues: 0,
    requisicao: ''
  });

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    console.log('Recepcao - Making API request to:', `${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('Recepcao - Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Recepcao - API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Recepcao - Response data:', data);
    return data;
  };

  const loadRecepcoes = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.nome && { nome: filters.nome }),
        ...(filters.requisicao && { requisicao: filters.requisicao }),
        ...(filters.dataInicio && { dataInicio: filters.dataInicio }),
        ...(filters.dataFim && { dataFim: filters.dataFim })
      });

      const response = await apiRequest(`/recepcao?${queryParams}`);
      setRecepcoes(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar recepções:', error);
    }
  };

  const loadLookupData = async () => {
    try {
      const [clientesRes, artigosRes, composicoesRes] = await Promise.all([
        apiRequest('/recepcao/lookup/clientes'),
        apiRequest('/recepcao/lookup/artigos'),
        apiRequest('/recepcao/lookup/composicoes')
      ]);

      setClientes(clientesRes.data);
      setArtigos(artigosRes.data);
      setComposicoes(composicoesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados de apoio:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadRecepcoes(), loadLookupData()]);
      setLoading(false);
    };
    
    loadData();
  }, [currentPage, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editMode && selectedRecepcao) {
        await apiRequest(`/recepcao/${selectedRecepcao.seccao}/${selectedRecepcao.data}/${selectedRecepcao.linha}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/recepcao', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      
      setShowModal(false);
      setEditMode(false);
      setSelectedRecepcao(null);
      loadRecepcoes();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar recepção:', error);
    }
  };

  const handleEdit = (recepcao: MovRecepcao) => {
    setEditMode(true);
    setSelectedRecepcao(recepcao);
    setFormData({
      seccao: recepcao.seccao,
      data: recepcao.data.split('T')[0],
      cliente: recepcao.cliente,
      nome: recepcao.nome,
      codigo: recepcao.codigo,
      descricao: recepcao.descricao,
      composicao: recepcao.composicao,
      composicao_descricao: recepcao.composicao_descricao,
      rolos: recepcao.rolos,
      pesos: recepcao.pesos,
      gramagem: recepcao.gramagem,
      medidas: recepcao.medidas,
      branquear: recepcao.branquear,
      desencolar: recepcao.desencolar,
      tingir: recepcao.tingir,
      rolos_entregues: recepcao.rolos_entregues,
      pesos_entregues: recepcao.pesos_entregues,
      requisicao: recepcao.requisicao || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (recepcao: MovRecepcao) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta recepção?')) {
      try {
        await apiRequest(`/recepcao/${recepcao.seccao}/${recepcao.data}/${recepcao.linha}`, {
          method: 'DELETE'
        });
        loadRecepcoes();
      } catch (error) {
        console.error('Erro ao eliminar recepção:', error);
      }
    }
  };

  const handleFechar = async (recepcao: MovRecepcao) => {
    if (window.confirm('Tem a certeza que deseja fechar esta recepção?')) {
      try {
        await apiRequest(`/recepcao/${recepcao.seccao}/${recepcao.data}/${recepcao.linha}/fechar`, {
          method: 'POST'
        });
        loadRecepcoes();
        alert('Recepção fechada com sucesso!');
      } catch (error) {
        console.error('Erro ao fechar recepção:', error);
        alert('Erro ao fechar recepção. Tente novamente.');
      }
    }
  };

  const handlePrint = () => {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '1000',
      ...(filters.nome && { nome: filters.nome }),
      ...(filters.requisicao && { requisicao: filters.requisicao }),
      ...(filters.dataInicio && { dataInicio: filters.dataInicio }),
      ...(filters.dataFim && { dataFim: filters.dataFim })
    });

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('authToken');
    
    const url = `${API_BASE_URL}/reports/recepcoes/pdf?${queryParams}`;
    
    // Criar um elemento temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recepcoes_${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Adicionar cabeçalho de autorização
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório PDF');
    });
  };

  const handlePreview = () => {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '1000',
      ...(filters.nome && { nome: filters.nome }),
      ...(filters.requisicao && { requisicao: filters.requisicao }),
      ...(filters.dataInicio && { dataInicio: filters.dataInicio }),
      ...(filters.dataFim && { dataFim: filters.dataFim })
    });

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('authToken');
    
    const url = `${API_BASE_URL}/reports/recepcoes/preview?${queryParams}&token=${token}`;
    
    // Abrir em nova janela
    window.open(url, '_blank');
  };

  const resetForm = () => {
    setFormData({
      seccao: 1,
      data: new Date().toISOString().split('T')[0],
      cliente: 0,
      nome: '',
      codigo: 0,
      descricao: '',
      composicao: 0,
      composicao_descricao: '',
      rolos: 0,
      pesos: 0,
      gramagem: 0,
      medidas: 0,
      branquear: 'N',
      desencolar: 'N',
      tingir: 'N',
      rolos_entregues: 0,
      pesos_entregues: 0,
      requisicao: ''
    });
  };

  const handleClienteChange = (clienteId: number) => {
    const cliente = clientes.find(c => c.codigo === clienteId);
    setFormData(prev => ({
      ...prev,
      cliente: clienteId,
      nome: cliente?.nome || ''
    }));
  };

  const handleArtigoChange = (codigoArtigo: number) => {
    const artigo = artigos.find(a => a.codigo === codigoArtigo);
    setFormData(prev => ({
      ...prev,
      codigo: codigoArtigo,
      descricao: artigo?.descricao || ''
    }));
  };

  const handleComposicaoChange = (codigoComposicao: number) => {
    const composicao = composicoes.find(c => c.codigo === codigoComposicao);
    setFormData(prev => ({
      ...prev,
      composicao: codigoComposicao,
      composicao_descricao: composicao?.descricao || ''
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">A carregar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tinturaria - Recepção</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          >
            <FileText size={20} />
            Pré-visualizar
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Printer size={20} />
            Imprimir PDF
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setSelectedRecepcao(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Nova Recepção
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome do cliente"
            value={filters.nome}
            onChange={(e) => setFilters(prev => ({ ...prev, nome: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Nº Guia/Requisição"
            value={filters.requisicao}
            onChange={(e) => setFilters(prev => ({ ...prev, requisicao: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            placeholder="Data início"
            value={filters.dataInicio}
            onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            placeholder="Data fim"
            value={filters.dataFim}
            onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Artigo</th>
              <th className="px-4 py-3 text-left">Composição</th>
              <th className="px-4 py-3 text-left">Rolos Pendentes</th>
              <th className="px-4 py-3 text-left">Pesos Pendentes</th>
              <th className="px-4 py-3 text-left">Processos</th>
              <th className="px-4 py-3 text-left">Gramagem</th>
              <th className="px-4 py-3 text-left">Requisição</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Acções</th>
            </tr>
          </thead>
          <tbody>
            {recepcoes.map((recepcao) => (
              <tr key={`${recepcao.seccao}-${recepcao.data}-${recepcao.linha}`} className="border-t">
                <td className="px-4 py-3">{new Date(recepcao.data).toLocaleDateString()}</td>
                <td className="px-4 py-3">{recepcao.descricao}</td>
                <td className="px-4 py-3">{recepcao.composicao_descricao || '-'}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">
                    {recepcao.rolos - recepcao.rolos_entregues}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({recepcao.rolos} - {recepcao.rolos_entregues})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">
                    {recepcao.pesos - recepcao.pesos_entregues}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({recepcao.pesos} - {recepcao.pesos_entregues})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {[
                      recepcao.branquear === 'S' && 'Branquear',
                      recepcao.desencolar === 'S' && 'Desencolar',
                      recepcao.tingir === 'S' && 'Tingir'
                    ].filter(Boolean).join(', ') || '-'}
                  </div>
                </td>
                <td className="px-4 py-3">{recepcao.gramagem || '-'}</td>
                <td className="px-4 py-3">{recepcao.requisicao || '-'}</td>
                <td className="px-4 py-3">{recepcao.nome}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFechar(recepcao)}
                      className="text-green-600 hover:text-green-800"
                      title="Fechar recepção"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(recepcao)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar recepção"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(recepcao)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar recepção"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Editar Recepção' : 'Nova Recepção'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.nome}
                      readOnly
                      placeholder="Seleccionar cliente"
                      className="flex-1 border rounded px-3 py-2 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchModals(prev => ({ ...prev, cliente: true }))}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Artigo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.descricao}
                      readOnly
                      placeholder="Seleccionar artigo"
                      className="flex-1 border rounded px-3 py-2 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchModals(prev => ({ ...prev, artigo: true }))}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Composição</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.composicao_descricao}
                      readOnly
                      placeholder="Seleccionar composição"
                      className="flex-1 border rounded px-3 py-2 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchModals(prev => ({ ...prev, composicao: true }))}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rolos</label>
                  <input
                    type="number"
                    value={formData.rolos}
                    onChange={(e) => setFormData(prev => ({ ...prev, rolos: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pesos</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pesos}
                    onChange={(e) => setFormData(prev => ({ ...prev, pesos: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gramagem</label>
                  <input
                    type="number"
                    value={formData.gramagem}
                    onChange={(e) => setFormData(prev => ({ ...prev, gramagem: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Medidas</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.medidas}
                    onChange={(e) => setFormData(prev => ({ ...prev, medidas: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rolos Entregues</label>
                  <input
                    type="number"
                    value={formData.rolos_entregues}
                    onChange={(e) => setFormData(prev => ({ ...prev, rolos_entregues: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pesos Entregues</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pesos_entregues}
                    onChange={(e) => setFormData(prev => ({ ...prev, pesos_entregues: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1">Requisição</label>
                  <input
                    type="text"
                    value={formData.requisicao}
                    onChange={(e) => setFormData(prev => ({ ...prev, requisicao: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Processos</label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.branquear === 'S'}
                      onChange={(e) => setFormData(prev => ({ ...prev, branquear: e.target.checked ? 'S' : 'N' }))}
                      className="mr-2"
                    />
                    Branquear
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.desencolar === 'S'}
                      onChange={(e) => setFormData(prev => ({ ...prev, desencolar: e.target.checked ? 'S' : 'N' }))}
                      className="mr-2"
                    />
                    Desencolar
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tingir === 'S'}
                      onChange={(e) => setFormData(prev => ({ ...prev, tingir: e.target.checked ? 'S' : 'N' }))}
                      className="mr-2"
                    />
                    Tingir
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editMode ? 'Actualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modals */}
      <SearchModal
        isOpen={searchModals.cliente}
        onClose={() => setSearchModals(prev => ({ ...prev, cliente: false }))}
        onSelect={(cliente) => {
          setFormData(prev => ({
            ...prev,
            cliente: cliente.codigo,
            nome: cliente.nome || ''
          }));
        }}
        title="Pesquisar Cliente"
        searchEndpoint="/recepcao/lookup/clientes"
        searchField="nome"
        displayField="nome"
      />

      <SearchModal
        isOpen={searchModals.artigo}
        onClose={() => setSearchModals(prev => ({ ...prev, artigo: false }))}
        onSelect={(artigo) => {
          setFormData(prev => ({
            ...prev,
            codigo: artigo.codigo,
            descricao: artigo.descricao || ''
          }));
        }}
        title="Pesquisar Artigo"
        searchEndpoint="/recepcao/lookup/artigos"
        searchField="descricao"
        displayField="descricao"
      />

      <SearchModal
        isOpen={searchModals.composicao}
        onClose={() => setSearchModals(prev => ({ ...prev, composicao: false }))}
        onSelect={(composicao) => {
          setFormData(prev => ({
            ...prev,
            composicao: composicao.codigo,
            composicao_descricao: composicao.descricao || ''
          }));
        }}
        title="Pesquisar Composição"
        searchEndpoint="/recepcao/lookup/composicoes"
        searchField="descricao"
        displayField="descricao"
      />
    </div>
  );
};

export default Recepcao;
