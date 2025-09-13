import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, FilterX, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  rolos_entregues: number;
  pesos_entregues: number;
  requisicao?: string;
}

const FichasAcabamento: React.FC = () => {
  const [list, setList] = useState<MovRecepcao[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<(MovRecepcao & { selRolos: number; selPesos: number })[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requisicaoFilter, setRequisicaoFilter] = useState('');

  // Modal state for partial quantity selection
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPendRolos, setModalPendRolos] = useState(0);
  const [modalPendPesos, setModalPendPesos] = useState(0);
  const [modalRolos, setModalRolos] = useState('0');
  const [modalPesos, setModalPesos] = useState('0');
  const [modalErrors, setModalErrors] = useState<{ rolos?: string; pesos?: string }>({});
  const [modalMov, setModalMov] = useState<MovRecepcao | null>(null);
  const totalRolos = React.useMemo(() => selected.reduce((s, r) => s + (Number(r.selRolos) || 0), 0), [selected]);
  const totalPesos = React.useMemo(() => selected.reduce((s, r) => s + (Number(r.selPesos) || 0), 0), [selected]);

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
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  };

  const load = async (overrides?: { page?: number; selectedCliente?: number | null; requisicao?: string; nome?: string }) => {
    setLoading(true);
    try {
      const currentPage = overrides?.page ?? page;
      const currentCliente = overrides?.selectedCliente ?? selectedCliente;
      const currentReq = overrides?.requisicao ?? requisicaoFilter;
      const currentNome = overrides?.nome ?? searchTerm;
      const params = new URLSearchParams({ page: String(currentPage), limit: '15' });
      if (currentCliente) params.set('cliente', String(currentCliente));
      if (currentReq.trim() !== '') params.set('requisicao', currentReq.trim());
      if (currentNome.trim() !== '') params.set('nome', currentNome.trim());
      const resp = await apiRequest(`/recepcao?${params.toString()}`);
      setList(resp.data.data);
      setTotalPages(resp.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, selectedCliente]);

  // Restore persisted selection on mount
  useEffect(() => {
    try {
      const storedSel = localStorage.getItem('fa_selected_items');
      const storedCli = localStorage.getItem('fa_selected_cliente');
      if (storedSel) {
        const arr = JSON.parse(storedSel);
        if (Array.isArray(arr)) {
          setSelected(arr);
        }
      }
      if (storedCli) setSelectedCliente(Number(storedCli));
    } catch {}
  }, []);

  // Persist selection changes
  useEffect(() => {
    try {
      if (selected.length > 0) {
        localStorage.setItem('fa_selected_items', JSON.stringify(selected));
        if (selectedCliente) localStorage.setItem('fa_selected_cliente', String(selectedCliente));
      } else {
        localStorage.removeItem('fa_selected_items');
        localStorage.removeItem('fa_selected_cliente');
      }
    } catch {}
  }, [selected, selectedCliente]);

  const addToFicha = (mov: MovRecepcao) => {
    if (selected.some(s => s.seccao === mov.seccao && s.data === mov.data && s.linha === mov.linha)) return;
    const pendRolos = Math.max(0, (mov.rolos ?? 0) - (mov.rolos_entregues ?? 0));
    const pendPesos = Math.max(0, (mov.pesos ?? 0) - (mov.pesos_entregues ?? 0));
    setModalPendRolos(pendRolos);
    setModalPendPesos(pendPesos);
    setModalRolos(String(pendRolos));
    setModalPesos(String(pendPesos));
    setModalErrors({});
    setModalMov(mov);
    setModalOpen(true);
  };

  const confirmAdd = () => {
    if (!modalMov) return;
    const r = Number(modalRolos);
    const p = Number(modalPesos);
    const errors: { rolos?: string; pesos?: string } = {};
    if (!Number.isFinite(r) || r < 0 || r > modalPendRolos) errors.rolos = 'Rolos inválidos';
    if (!Number.isFinite(p) || p < 0 || p > modalPendPesos) errors.pesos = 'Pesos inválidos';
    setModalErrors(errors);
    if (errors.rolos || errors.pesos) return;
    const novo = [...selected, { ...modalMov, selRolos: r, selPesos: p }];
    setSelected(novo);
    toast.success('Movimento adicionado à ficha');
    if (!selectedCliente) {
      setSelectedCliente(modalMov.cliente);
      setPage(1);
    }
    // requisicao filter must be cleared when adding
    setRequisicaoFilter('');
    setModalOpen(false);
    setModalMov(null);
  };

  const cancelAdd = () => {
    setModalOpen(false);
    setModalMov(null);
  };

  const removeFromFicha = (mov: MovRecepcao) => {
    const novo = selected.filter(s => !isSameMov(s, mov));
    setSelected(novo);
    const nextClientFilter = novo.length === 0 ? null : selectedCliente;
    if (novo.length === 0) {
      setSelectedCliente(null);
      setPage(1);
    }
    toast.success('Movimento removido da ficha');
    // A grelha de cima volta a mostrar o item automaticamente quando deixar de estar selecionado
  };

  const clearFilter = () => {
    setSelectedCliente(null);
    setPage(1);
    load({ page: 1, selectedCliente: null });
  };

  const isSameMov = (a: { seccao: number; data: string; linha: number }, b: { seccao: number; data: string; linha: number }) => {
    return a.seccao === b.seccao && a.linha === b.linha && new Date(a.data).getTime() === new Date(b.data).getTime();
  };

  const matchesCurrentFilters = (mov: MovRecepcao, overrideClientFilter?: number | null) => {
    const clientFilter = overrideClientFilter !== undefined ? overrideClientFilter : selectedCliente;
    if (clientFilter && mov.cliente !== clientFilter) return false;
    if (requisicaoFilter.trim() && !(mov.requisicao || '').toUpperCase().includes(requisicaoFilter.trim().toUpperCase())) return false;
    if (searchTerm.trim() && !(mov.nome || '').toUpperCase().includes(searchTerm.trim().toUpperCase())) return false;
    return true;
  };

  const filteredTop = useMemo(() => list.filter(item => !selected.some(sel => isSameMov(item, sel))), [list, selected]);

  return (
    <div className="grid grid-rows-[2fr_1fr] gap-4 h-[calc(100vh-9rem)]">
      {/* Top: Lista de recepção */}
      <div className="bg-white rounded-lg shadow p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="text-gray-400" size={18} />
            <input
              className="border rounded px-3 py-2 w-64 md:w-96"
              placeholder="Pesquisar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load({ page: 1 }); } }}
            />
            <input
              className="border rounded px-3 py-2 w-48"
              placeholder="Filtrar por requisição"
              value={requisicaoFilter}
              onChange={(e) => setRequisicaoFilter(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load({ page: 1 }); } }}
            />
            <button
              className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              onClick={() => { setPage(1); load({ page: 1 }); }}
              disabled={loading}
            >
              Aplicar filtros
            </button>
            {selectedCliente && (
              <span className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-2">
                Cliente: <strong>{selectedCliente}</strong>
                <button onClick={clearFilter} title="Limpar filtro" className="text-blue-700 hover:text-blue-900">
                  <FilterX size={14} />
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setSelected([]);
                setSelectedCliente(null);
                localStorage.removeItem('fa_selected_items');
                localStorage.removeItem('fa_selected_cliente');
                setRequisicaoFilter('');
                setSearchTerm('');
                setPage(1);
                load({ page: 1, selectedCliente: null, requisicao: '', nome: '' });
              }}
            >
              Limpar/Atualizar
            </button>
            <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Artigo</th>
                <th className="px-3 py-2 text-left">Composição</th>
                <th className="px-3 py-2 text-left">Pendentes</th>
                <th className="px-3 py-2 text-left">Requisição</th>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-3" colSpan={6}>A carregar...</td></tr>
              ) : filteredTop.length === 0 ? (
                <tr><td className="px-3 py-3" colSpan={6}>Sem registos</td></tr>
              ) : (
                filteredTop.map((r) => (
                  <tr key={`${r.seccao}-${r.data}-${r.linha}`} className="border-t">
                    <td className="px-3 py-2">{new Date(r.data).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{r.descricao}</td>
                    <td className="px-3 py-2">{r.composicao_descricao || '-'}</td>
                    <td className="px-3 py-2">{(r.rolos - r.rolos_entregues)} rolos / {(r.pesos - r.pesos_entregues)} kg</td>
                    <td className="px-3 py-2">{r.requisicao || '-'}</td>
                    <td className="px-3 py-2">{r.nome} ({r.cliente})</td>
                    <td className="px-3 py-2">
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => addToFicha(r)}
                        title="Adicionar à ficha"
                        aria-label="Adicionar à ficha"
                      >
                        <Plus size={18} /> <span>Adicionar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-3">
          <button disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="px-3 py-2 border rounded disabled:opacity-50">Anterior</button>
          <button disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="px-3 py-2 border rounded disabled:opacity-50">Próxima</button>
        </div>
      </div>

      {/* Bottom: Itens adicionados à ficha */}
      <div className="bg-white rounded-lg shadow p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Itens da Ficha</h3>
            {selected.length > 0 && (
              <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-50 border border-blue-200 text-sm text-blue-700">
                Totais: <strong>{totalRolos}</strong> rolos / <strong>{totalPesos}</strong> kg
              </span>
            )}
            {selected.length > 0 && (
              <button
                className="text-sm px-3 py-1 rounded border text-gray-700 hover:bg-gray-100"
                onClick={() => { setSelected([]); setSelectedCliente(null); localStorage.removeItem('fa_selected_items'); localStorage.removeItem('fa_selected_cliente'); setPage(1); }}
              >
                Limpar seleção
              </button>
            )}
          </div>
          {selected.length > 0 && (
            <div className="text-sm text-gray-700 flex items-center gap-4">
              <button
                className="px-3 py-2 rounded-md bg-green-600 text-white shadow hover:bg-green-700 active:bg-green-800"
                onClick={async () => {
                  try {
                    if (selected.length === 0) return;
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const seccao = Number(user?.seccao || 1);
                    const items = selected.map(s => ({
                      movRecSeccao: seccao,
                      movRecData: s.data,
                      movRecLinha: s.linha,
                      rolos: s.selRolos,
                      pesos: s.selPesos,
                    }));
                    const token = localStorage.getItem('authToken');
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                    const resp = await fetch(`${API_BASE_URL}/fa`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ seccao, itens: items })
                    });
                    if (!resp.ok) {
                      const t = await resp.text();
                      throw new Error(t);
                    }
                    const data = await resp.json();
                    const faNumero = data?.data?.faNumero;
                    toast.success(`Ficha criada Nº ${faNumero || ''}`);
                    // Limpar seleção após criar
                    setSelected([]);
                    localStorage.removeItem('fa_selected_items');
                    localStorage.removeItem('fa_selected_cliente');
                  } catch (e: any) {
                    toast.error('Erro ao criar ficha');
                  }
                }}
              >
                Criar Ficha de Acabamento
              </button>
              <span>Cliente: <strong>{selected[0].nome} ({selected[0].cliente})</strong></span>
            </div>
          )}
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Artigo</th>
                <th className="px-3 py-2 text-left">Composição</th>
                <th className="px-3 py-2 text-left">Qt. (rolos/kg)</th>
                <th className="px-3 py-2 text-left">Ação</th>
              </tr>
            </thead>
            <tbody>
              {selected.length === 0 ? (
                <tr><td className="px-3 py-3" colSpan={6}>Nenhum item adicionado</td></tr>
              ) : selected.map((r) => (
                <tr key={`sel-${r.seccao}-${r.data}-${r.linha}`} className="border-t">
                  <td className="px-3 py-2">{new Date(r.data).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{r.descricao}</td>
                  <td className="px-3 py-2">{r.composicao_descricao || '-'}</td>
                  <td className="px-3 py-2">{r.selRolos} / {r.selPesos}</td>
                  <td className="px-3 py-2">
                    <button className="inline-flex items-center gap-1 text-red-600 hover:text-red-800" onClick={()=> removeFromFicha(r)}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal seleção parcial */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-lg font-semibold">Adicionar à ficha</h4>
              <button onClick={cancelAdd} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-600">
                Pendentes: <strong>{modalPendRolos}</strong> rolos / <strong>{modalPendPesos}</strong> kg
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Rolos a adicionar</label>
                <input type="number" min={0} max={modalPendRolos} value={modalRolos}
                  onChange={(e)=> setModalRolos(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${modalErrors.rolos ? 'border-red-500' : ''}`} />
                {modalErrors.rolos && <div className="text-red-600 text-sm mt-1">{modalErrors.rolos}</div>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Pesos (kg) a adicionar</label>
                <input type="number" min={0} max={modalPendPesos} value={modalPesos}
                  onChange={(e)=> setModalPesos(e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${modalErrors.pesos ? 'border-red-500' : ''}`} />
                {modalErrors.pesos && <div className="text-red-600 text-sm mt-1">{modalErrors.pesos}</div>}
              </div>
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button onClick={cancelAdd} className="px-4 py-2 rounded border">Cancelar</button>
              <button onClick={confirmAdd} className="px-4 py-2 rounded bg-blue-600 text-white">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FichasAcabamento;
