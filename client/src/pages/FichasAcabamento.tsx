import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, FilterX } from 'lucide-react';
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
}

const FichasAcabamento: React.FC = () => {
  const [list, setList] = useState<MovRecepcao[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<(MovRecepcao & { selRolos: number; selPesos: number })[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (selectedCliente) params.set('cliente', String(selectedCliente));
      if (searchTerm.trim() !== '') params.set('nome', searchTerm.trim());
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
    let selRolos = pendRolos;
    let selPesos = pendPesos;
    // Prompt simple for partial quantities
    const rStr = window.prompt(`Indique rolos a adicionar (pendentes: ${pendRolos})`, String(pendRolos));
    if (rStr === null) return; // cancel
    const pStr = window.prompt(`Indique pesos (kg) a adicionar (pendentes: ${pendPesos})`, String(pendPesos));
    if (pStr === null) return;
    selRolos = Number(rStr);
    selPesos = Number(pStr);
    if (!Number.isFinite(selRolos) || selRolos < 0 || selRolos > pendRolos) {
      toast.error('Quantidade de rolos inválida');
      return;
    }
    if (!Number.isFinite(selPesos) || selPesos < 0 || selPesos > pendPesos) {
      toast.error('Quantidade de pesos inválida');
      return;
    }
    const novo = [...selected, { ...mov, selRolos, selPesos }];
    setSelected(novo);
    toast.success('Movimento adicionado à ficha');
    if (!selectedCliente) {
      setSelectedCliente(mov.cliente);
      setPage(1);
    }
  };

  const removeFromFicha = (mov: MovRecepcao) => {
    const novo = selected.filter(s => !(s.seccao === mov.seccao && s.data === mov.data && s.linha === mov.linha));
    setSelected(novo);
    if (novo.length === 0) {
      setSelectedCliente(null);
      setPage(1);
      load();
    }
    toast.success('Movimento removido da ficha');
  };

  const clearFilter = () => {
    setSelectedCliente(null);
    setPage(1);
    load();
  };

  const filteredTop = useMemo(() => list, [list]);

  return (
    <div className="grid grid-rows-[2fr_1fr] gap-4 h-[calc(100vh-9rem)]">
      {/* Top: Lista de recepção */}
      <div className="bg-white rounded-lg shadow p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="text-gray-400" size={18} />
            <input
              className="border rounded px-3 py-2"
              placeholder="Pesquisar por nome/requisição"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            />
            {selectedCliente && (
              <span className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-2">
                Cliente: <strong>{selectedCliente}</strong>
                <button onClick={clearFilter} title="Limpar filtro" className="text-blue-700 hover:text-blue-900">
                  <FilterX size={14} />
                </button>
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Artigo</th>
                <th className="px-3 py-2 text-left">Composição</th>
                <th className="px-3 py-2 text-left">Pendentes</th>
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
                    <td className="px-3 py-2">{r.nome} ({r.cliente})</td>
                    <td className="px-3 py-2">
                      <button
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        onClick={() => addToFicha(r)}
                        title="Adicionar à ficha"
                      >
                        <Plus size={16} /> Adicionar
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
          <h3 className="text-lg font-semibold text-gray-900">Itens da Ficha</h3>
          {selected.length > 0 && (
            <div className="text-sm text-gray-600">Cliente: <strong>{selected[0].nome} ({selected[0].cliente})</strong></div>
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
                <tr><td className="px-3 py-3" colSpan={5}>Nenhum item adicionado</td></tr>
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
    </div>
  );
};

export default FichasAcabamento;
