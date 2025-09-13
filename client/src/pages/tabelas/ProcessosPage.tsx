import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const ProcessosPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ id: number | ''; descricao: string; ordem: number | ''; id_pai: number | ''; situacao: string }>({ id: '', descricao: '', ordem: '', id_pai: '', situacao: 'ACT' });
  const [editing, setEditing] = useState<number | null>(null);

  const load = async () => { setLoading(true); try { const { data } = await tabelasApi.listProcessos({ page, limit: 10, search }); const payload = data.data; setItems(payload.data); setTotalPages(payload.totalPages); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [page, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (form.id === '' || !form.descricao) { toast.error('Preencha ID e descrição'); return; }
    try { if (editing === null) { await tabelasApi.createProcesso({ id: Number(form.id), descricao: form.descricao, ordem: form.ordem === '' ? undefined : Number(form.ordem), id_pai: form.id_pai === '' ? undefined : Number(form.id_pai), situacao: form.situacao }); toast.success('Processo criado'); } else { await tabelasApi.updateProcesso(editing, { descricao: form.descricao, ordem: form.ordem === '' ? undefined : Number(form.ordem), id_pai: form.id_pai === '' ? undefined : Number(form.id_pai), situacao: form.situacao }); toast.success('Processo atualizado'); } setForm({ id: '', descricao: '', ordem: '', id_pai: '', situacao: 'ACT' }); setEditing(null); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao guardar'); }
  };
  const startEdit = (it: any) => { setEditing(it.id); setForm({ id: it.id, descricao: it.descricao, ordem: it.ordem ?? '', id_pai: it.id_pai ?? '', situacao: it.situacao || 'ACT' }); };
  const remove = async (id: number) => { if (!confirm('Remover processo?')) return; try { await tabelasApi.deleteProcesso(id); toast.success('Processo removido'); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao remover'); } };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Processos</h1>
      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="pl-9 pr-3 py-2 border rounded" placeholder="Pesquisar por ID ou descrição" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div><label className="block text-sm text-gray-600">ID</label><input type="number" className="border rounded px-3 py-2" value={form.id} onChange={(e) => setForm(f => ({ ...f, id: e.target.value === '' ? '' : Number(e.target.value) }))} disabled={editing !== null} required /></div>
        <div className="md:col-span-2"><label className="block text-sm text-gray-600">Descrição</label><input className="w-full border rounded px-3 py-2" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required /></div>
        <div><label className="block text-sm text-gray-600">Ordem</label><input type="number" className="border rounded px-3 py-2" value={form.ordem} onChange={(e) => setForm(f => ({ ...f, ordem: e.target.value === '' ? '' : Number(e.target.value) }))} /></div>
        <div><label className="block text-sm text-gray-600">ID Pai</label><input type="number" className="border rounded px-3 py-2" value={form.id_pai} onChange={(e) => setForm(f => ({ ...f, id_pai: e.target.value === '' ? '' : Number(e.target.value) }))} /></div>
        <div><label className="block text-sm text-gray-600">Situação</label><select className="border rounded px-3 py-2" value={form.situacao} onChange={(e) => setForm(f => ({ ...f, situacao: e.target.value }))}><option value="ACT">ACT</option><option value="INA">INA</option></select></div>
        <div className="md:col-span-5 flex gap-3 items-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">{editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}</button>{editing !== null && (<button type="button" onClick={() => { setEditing(null); setForm({ id: '', descricao: '', ordem: '', id_pai: '', situacao: 'ACT' }); }} className="px-4 py-2 rounded border">Cancelar</button>)}</div>
      </form>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Descrição</th><th className="text-left px-4 py-2">Ordem</th><th className="text-left px-4 py-2">Situação</th><th className="text-left px-4 py-2">Ações</th></tr></thead><tbody>{loading ? (<tr><td className="px-4 py-3" colSpan={5}>A carregar...</td></tr>) : items.map((it) => (<tr key={it.id} className="border-t"><td className="px-4 py-2">{it.id}</td><td className="px-4 py-2">{it.descricao}</td><td className="px-4 py-2">{it.ordem ?? '-'}</td><td className="px-4 py-2">{it.situacao || '-'}</td><td className="px-4 py-2"><button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button><button className="text-red-600 hover:text-red-800" onClick={() => remove(it.id)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      <div className="flex justify-between items-center mt-4"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded disabled:opacity-50">Próxima</button></div>
    </div>
  );
};

export default ProcessosPage;
