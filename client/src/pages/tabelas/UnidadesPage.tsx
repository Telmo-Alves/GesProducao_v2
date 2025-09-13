import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { PagedResult, UnidadeMedidaOption } from '../../types/tabelas';
import { toast } from 'react-hot-toast';

const UnidadesPage: React.FC = () => {
  const [items, setItems] = useState<UnidadeMedidaOption[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ un_medida: string; descricao: string; medida: number | '' }>({ un_medida: '', descricao: '', medida: 1 });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await tabelasApi.listUnidades({ page, limit: 10, search });
      const payload = data.data as PagedResult<UnidadeMedidaOption>;
      setItems(payload.data);
      setTotalPages(payload.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.un_medida || !form.descricao) { toast.error('Preencha código e descrição'); return; }
    try {
      if (editing === null) { await tabelasApi.createUnidade({ un_medida: form.un_medida, descricao: form.descricao, medida: form.medida === '' ? undefined : Number(form.medida) }); toast.success('Unidade criada'); }
      else { await tabelasApi.updateUnidade(editing, { descricao: form.descricao, medida: form.medida === '' ? undefined : Number(form.medida) }); toast.success('Unidade atualizada'); }
      setForm({ un_medida: '', descricao: '', medida: 1 });
      setEditing(null);
      await load();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao guardar'); }
  };

  const startEdit = (item: UnidadeMedidaOption) => {
    setEditing(item.un_medida);
    setForm({ un_medida: item.un_medida, descricao: item.descricao, medida: item.medida ?? 1 });
  };

  const remove = async (un_medida: string) => {
    if (!confirm('Remover unidade?')) return;
    try { await tabelasApi.deleteUnidade(un_medida); toast.success('Unidade removida'); await load(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao remover unidade'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Unidades de Medida</h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="pl-9 pr-3 py-2 border rounded"
            placeholder="Pesquisar por código ou descrição"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
      </div>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600">Código</label>
          <input className="border rounded px-3 py-2 uppercase" value={form.un_medida}
            onChange={(e) => setForm(f => ({ ...f, un_medida: e.target.value.toUpperCase() }))}
            disabled={editing !== null}
            required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600">Descrição</label>
          <input className="w-full border rounded px-3 py-2" value={form.descricao}
            onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Medida (fator)</label>
          <input type="number" step="0.0001" className="border rounded px-3 py-2" value={form.medida}
            onChange={(e) => setForm(f => ({ ...f, medida: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
        <div className="md:col-span-4 flex gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            {editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}
          </button>
          {editing !== null && (
            <button type="button" onClick={() => { setEditing(null); setForm({ un_medida: '', descricao: '', medida: 1 }); }} className="px-4 py-2 rounded border">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Descrição</th>
              <th className="text-left px-4 py-2">Medida</th>
              <th className="text-left px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>A carregar...</td></tr>
            ) : items.map((it) => (
              <tr key={it.un_medida} className="border-t">
                <td className="px-4 py-2">{it.un_medida}</td>
                <td className="px-4 py-2">{it.descricao}</td>
                <td className="px-4 py-2">{it.medida ?? '-'}</td>
                <td className="px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => remove(it.un_medida)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded disabled:opacity-50">Próxima</button>
      </div>
    </div>
  );
};

export default UnidadesPage;
