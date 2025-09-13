import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const TerminaisPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ terminal: string; maquina: number | '' }>({ terminal: '', maquina: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => { setLoading(true); try { const { data } = await tabelasApi.listTerminais({ page, limit: 10, search }); const payload = data.data; setItems(payload.data); setTotalPages(payload.totalPages); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [page, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.terminal) return;
    try { if (editing === null) { await tabelasApi.createTerminal({ terminal: form.terminal, maquina: form.maquina === '' ? undefined : Number(form.maquina) }); toast.success('Terminal criado'); } else { await tabelasApi.updateTerminal(editing, { maquina: form.maquina === '' ? undefined : Number(form.maquina) }); toast.success('Terminal atualizado'); } setForm({ terminal: '', maquina: '' }); setEditing(null); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao guardar'); }
  };
  const startEdit = (it: any) => { setEditing(it.terminal); setForm({ terminal: it.terminal, maquina: it.maquina ?? '' }); };
  const remove = async (terminal: string) => { if (!confirm('Remover terminal?')) return; await tabelasApi.deleteTerminal(terminal); await load(); };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Terminais</h1>
      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="pl-9 pr-3 py-2 border rounded" placeholder="Pesquisar por terminal ou máquina" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div><label className="block text-sm text-gray-600">Terminal</label><input className="border rounded px-3 py-2 uppercase" value={form.terminal} onChange={(e) => setForm(f => ({ ...f, terminal: e.target.value.toUpperCase() }))} disabled={editing !== null} required /></div>
        <div><label className="block text-sm text-gray-600">Máquina</label><input type="number" className="border rounded px-3 py-2" value={form.maquina} onChange={(e) => setForm(f => ({ ...f, maquina: e.target.value === '' ? '' : Number(e.target.value) }))} /></div>
        <div className="md:col-span-3 flex gap-3 items-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">{editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}</button>{editing !== null && (<button type="button" onClick={() => { setEditing(null); setForm({ terminal: '', maquina: '' }); }} className="px-4 py-2 rounded border">Cancelar</button>)}</div>
      </form>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Terminal</th><th className="text-left px-4 py-2">Máquina</th><th className="text-left px-4 py-2">Ações</th></tr></thead><tbody>{loading ? (<tr><td className="px-4 py-3" colSpan={3}>A carregar...</td></tr>) : items.map((it) => (<tr key={it.terminal} className="border-t"><td className="px-4 py-2">{it.terminal}</td><td className="px-4 py-2">{it.maquina ?? '-'}</td><td className="px-4 py-2"><button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button><button className="text-red-600 hover:text-red-800" onClick={() => remove(it.terminal)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      <div className="flex justify-between items-center mt-4"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded disabled:opacity-50">Próxima</button></div>
    </div>
  );
};

export default TerminaisPage;

