import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { PagedResult, ClienteOption } from '../../types/tabelas';
import { toast } from 'react-hot-toast';

const DesenhosPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ desenho: number | ''; descricao: string; cliente: number | '' }>({ desenho: '', descricao: '', cliente: '' });
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [editing, setEditing] = useState<number | null>(null);

  const load = async () => { setLoading(true); try { const { data } = await tabelasApi.listDesenhos({ page, limit: 10, search }); const payload = data.data; setItems(payload.data); setTotalPages(payload.totalPages); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { (async () => { try { const resp = await tabelasApi.listClientes({ page: 1, limit: 300 }); const payload = resp.data.data as PagedResult<ClienteOption>; setClientes(payload.data); } catch {} })(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (form.desenho === '' || !form.descricao) { toast.error('Preencha código e descrição'); return; }
    try { if (editing === null) { await tabelasApi.createDesenho({ desenho: Number(form.desenho), descricao: form.descricao, cliente: form.cliente === '' ? undefined : Number(form.cliente) }); toast.success('Desenho criado'); } else { await tabelasApi.updateDesenho(editing, { descricao: form.descricao, cliente: form.cliente === '' ? undefined : Number(form.cliente) }); toast.success('Desenho atualizado'); } setForm({ desenho: '', descricao: '', cliente: '' }); setEditing(null); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao guardar'); }
  };
  const startEdit = (it: any) => { setEditing(it.desenho); setForm({ desenho: it.desenho, descricao: it.descricao, cliente: it.cliente ?? '' }); };
  const remove = async (desenho: number) => { if (!confirm('Remover desenho?')) return; try { await tabelasApi.deleteDesenho(desenho); toast.success('Desenho removido'); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao remover'); } };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Desenhos</h1>
      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="pl-9 pr-3 py-2 border rounded" placeholder="Pesquisar por código ou descrição" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div><label className="block text-sm text-gray-600">Código</label><input type="number" className="border rounded px-3 py-2" value={form.desenho} onChange={(e) => setForm(f => ({ ...f, desenho: e.target.value === '' ? '' : Number(e.target.value) }))} disabled={editing !== null} required /></div>
        <div className="md:col-span-2"><label className="block text-sm text-gray-600">Descrição</label><input className="w-full border rounded px-3 py-2" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required /></div>
        <div>
          <label className="block text-sm text-gray-600">Cliente</label>
          <select className="border rounded px-3 py-2" value={form.cliente} onChange={(e) => setForm(f => ({ ...f, cliente: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <option value="">—</option>
            {clientes.map(c => (
              <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nome}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4 flex gap-3 items-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">{editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}</button>{editing !== null && (<button type="button" onClick={() => { setEditing(null); setForm({ desenho: '', descricao: '', cliente: '' }); }} className="px-4 py-2 rounded border">Cancelar</button>)}</div>
      </form>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Código</th><th className="text-left px-4 py-2">Descrição</th><th className="text-left px-4 py-2">Cliente</th><th className="text-left px-4 py-2">Ações</th></tr></thead><tbody>{loading ? (<tr><td className="px-4 py-3" colSpan={4}>A carregar...</td></tr>) : items.map((it) => (<tr key={it.desenho} className="border-t"><td className="px-4 py-2">{it.desenho}</td><td className="px-4 py-2">{it.descricao}</td><td className="px-4 py-2">{it.cliente ?? '-'}</td><td className="px-4 py-2"><button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button><button className="text-red-600 hover:text-red-800" onClick={() => remove(it.desenho)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      <div className="flex justify-between items-center mt-4"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded disabled:opacity-50">Próxima</button></div>
    </div>
  );
};

export default DesenhosPage;
