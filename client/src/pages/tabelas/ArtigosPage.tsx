import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { tabelasApi } from '../../services/api';
import { ArtigoOption, PagedResult } from '../../types/tabelas';

export const ArtigosPage: React.FC = () => {
  const [items, setItems] = useState<ArtigoOption[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ codigo: number | ''; descricao: string; un_medida: string; situacao: string; seccao: number | '' }>({ codigo: '', descricao: '', un_medida: 'KG', situacao: 'ACT', seccao: 1 });
  const [editing, setEditing] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await tabelasApi.listArtigos({ page, limit: 10, search });
      const payload = data.data as PagedResult<ArtigoOption>;
      setItems(payload.data);
      setTotalPages(payload.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.codigo === '' || !form.descricao) return;
    if (editing === null) {
      await tabelasApi.createArtigo({ codigo: Number(form.codigo), descricao: form.descricao, un_medida: form.un_medida, situacao: form.situacao, seccao: form.seccao === '' ? undefined : Number(form.seccao) });
    } else {
      await tabelasApi.updateArtigo(editing, { descricao: form.descricao, un_medida: form.un_medida, situacao: form.situacao, seccao: form.seccao === '' ? undefined : Number(form.seccao) });
    }
    setForm({ codigo: '', descricao: '', un_medida: 'KG', situacao: 'ACT', seccao: 1 });
    setEditing(null);
    await load();
  };

  const startEdit = (item: ArtigoOption) => {
    setEditing(item.codigo);
    setForm({ codigo: item.codigo, descricao: item.descricao, un_medida: item.un_medida || 'KG', situacao: item.situacao || 'ACT', seccao: item.seccao ?? 1 });
  };

  const remove = async (codigo: number) => {
    if (!confirm('Remover artigo?')) return;
    await tabelasApi.deleteArtigo(codigo);
    await load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Artigos</h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="pl-9 pr-3 py-2 border rounded"
            placeholder="Pesquisar por descrição ou código"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
      </div>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600">Código</label>
          <input type="number" className="border rounded px-3 py-2" value={form.codigo}
            onChange={(e) => setForm(f => ({ ...f, codigo: e.target.value === '' ? '' : Number(e.target.value) }))}
            disabled={editing !== null}
            required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600">Descrição</label>
          <input className="w-full border rounded px-3 py-2" value={form.descricao}
            onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Un. Medida</label>
          <input className="border rounded px-3 py-2" value={form.un_medida}
            onChange={(e) => setForm(f => ({ ...f, un_medida: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Secção</label>
          <input type="number" className="border rounded px-3 py-2" value={form.seccao}
            onChange={(e) => setForm(f => ({ ...f, seccao: e.target.value === '' ? '' : Number(e.target.value) }))} />
        </div>
        <div className="md:col-span-5 flex gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600">Situação</label>
            <select className="border rounded px-3 py-2" value={form.situacao}
              onChange={(e) => setForm(f => ({ ...f, situacao: e.target.value }))}>
              <option value="ACT">ACT</option>
              <option value="INA">INA</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            {editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}
          </button>
          {editing !== null && (
            <button type="button" onClick={() => { setEditing(null); setForm({ codigo: '', descricao: '', un_medida: 'KG', situacao: 'ACT', seccao: 1 }); }} className="px-4 py-2 rounded border">
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
              <th className="text-left px-4 py-2">Un. Medida</th>
              <th className="text-left px-4 py-2">Secção</th>
              <th className="text-left px-4 py-2">Situação</th>
              <th className="text-left px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={3}>A carregar...</td></tr>
            ) : items.map((it) => (
              <tr key={it.codigo} className="border-t">
                <td className="px-4 py-2">{it.codigo}</td>
                <td className="px-4 py-2">{it.descricao}</td>
                <td className="px-4 py-2">{it.un_medida || '-'}</td>
                <td className="px-4 py-2">{it.seccao ?? '-'}</td>
                <td className="px-4 py-2">{it.situacao || '-'}</td>
                <td className="px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 mr-3" onClick={() => startEdit(it)}><Edit size={16} /></button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => remove(it.codigo)}><Trash2 size={16} /></button>
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

export default ArtigosPage;
