import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { PagedResult, SeccaoOption } from '../../types/tabelas';
import { toast } from 'react-hot-toast';

const UtilizadoresSisPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ utilizador: string; senha: string; nivel: number | ''; seccao: number | ''; administrador: string }>({ utilizador: '', senha: '', nivel: 0, seccao: 1, administrador: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [seccoes, setSeccoes] = useState<SeccaoOption[]>([]);

  const load = async () => { setLoading(true); try { const { data } = await tabelasApi.listUtilizadores({ page, limit: 10, search }); const payload = data.data; setItems(payload.data); setTotalPages(payload.totalPages); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { (async () => { try { const resp = await tabelasApi.listSeccoes({ page: 1, limit: 200 }); const payload = resp.data.data as PagedResult<SeccaoOption>; setSeccoes(payload.data); } catch {} })(); }, []);

  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!form.utilizador || (!editing && !form.senha)) { toast.error('Preencha utilizador e senha'); return; } try { if (editing === null) { await tabelasApi.createUtilizador({ utilizador: form.utilizador, senha: form.senha, nivel: form.nivel === '' ? undefined : Number(form.nivel), seccao: form.seccao === '' ? undefined : Number(form.seccao), administrador: form.administrador || undefined }); toast.success('Utilizador criado'); } else { await tabelasApi.updateUtilizador(editing, { senha: form.senha, nivel: form.nivel === '' ? undefined : Number(form.nivel), seccao: form.seccao === '' ? undefined : Number(form.seccao), administrador: form.administrador || undefined }); toast.success('Utilizador atualizado'); } setForm({ utilizador: '', senha: '', nivel: 0, seccao: 1, administrador: '' }); setEditing(null); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao guardar'); } };
  const startEdit = (it: any) => { setEditing(it.utilizador); setForm({ utilizador: it.utilizador, senha: '', nivel: it.nivel ?? 0, seccao: it.seccao ?? 1, administrador: it.administrador || '' }); };
  const remove = async (utilizador: string) => { if (!confirm('Remover utilizador?')) return; try { await tabelasApi.deleteUtilizador(utilizador); toast.success('Utilizador removido'); await load(); } catch (err: any) { toast.error(err?.response?.data?.error || 'Erro ao remover'); } };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Utilizadores (BD)</h1>
      <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="pl-9 pr-3 py-2 border rounded" placeholder="Pesquisar por utilizador" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div><label className="block text-sm text-gray-600">Utilizador</label><input className="border rounded px-3 py-2" value={form.utilizador} onChange={(e) => setForm(f => ({ ...f, utilizador: e.target.value }))} disabled={editing !== null} required /></div>
        <div><label className="block text-sm text-gray-600">Senha</label><input type="password" className="border rounded px-3 py-2" value={form.senha} onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))} required={editing === null} /></div>
        <div><label className="block text-sm text-gray-600">Nível</label><input type="number" className="border rounded px-3 py-2" value={form.nivel} onChange={(e) => setForm(f => ({ ...f, nivel: e.target.value === '' ? '' : Number(e.target.value) }))} /></div>
        <div>
          <label className="block text-sm text-gray-600">Secção</label>
          <select className="border rounded px-3 py-2" value={form.seccao} onChange={(e) => setForm(f => ({ ...f, seccao: e.target.value === '' ? '' : Number(e.target.value) }))}>
            <option value="">—</option>
            {seccoes.map(s => (
              <option key={s.seccao} value={s.seccao}>{s.seccao} - {s.descricao}</option>
            ))}
          </select>
        </div>
        <div><label className="block text-sm text-gray-600">Administrador</label><input className="border rounded px-3 py-2" value={form.administrador} onChange={(e) => setForm(f => ({ ...f, administrador: e.target.value }))} /></div>
        <div className="md:col-span-5 flex gap-3 items-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">{editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)} </button>{editing !== null && (<button type="button" onClick={() => { setEditing(null); setForm({ utilizador: '', senha: '', nivel: 0, seccao: 1, administrador: '' }); }} className="px-4 py-2 rounded border">Cancelar</button>)}</div>
      </form>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Utilizador</th><th className="text-left px-4 py-2">Nível</th><th className="text-left px-4 py-2">Secção</th><th className="text-left px-4 py-2">Administrador</th><th className="text-left px-4 py-2">Ações</th></tr></thead><tbody>{loading ? (<tr><td className="px-4 py-3" colSpan={5}>A carregar...</td></tr>) : items.map((it) => (<tr key={it.utilizador} className="border-t"><td className="px-4 py-2">{it.utilizador}</td><td className="px-4 py-2">{it.nivel ?? '-'}</td><td className="px-4 py-2">{it.seccao ?? '-'}</td><td className="px-4 py-2">{it.administrador || '-'}</td><td className="px-4 py-2"><button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button><button className="text-red-600 hover:text-red-800" onClick={() => remove(it.utilizador)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
      <div className="flex justify-between items-center mt-4"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded disabled:opacity-50">Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded disabled:opacity-50">Próxima</button></div>
    </div>
  );
};

export default UtilizadoresSisPage;
