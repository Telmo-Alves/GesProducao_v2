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
  const [form, setForm] = useState<{ codigo: number | ''; descricao: string }>({ codigo: '', descricao: '' });
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
      await tabelasApi.createArtigo({ codigo: Number(form.codigo), descricao: form.descricao });
    } else {
      await tabelasApi.updateArtigo(editing, { descricao: form.descricao });
    }
    setForm({ codigo: '', descricao: '' });
    setEditing(null);
    await load();
  };

  const startEdit = (item: ArtigoOption) => {
    setEditing(item.codigo);
    setForm({ codigo: item.codigo, descricao: item.descricao });
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

      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-4 flex gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600">Código</label>
          <input type="number" className="border rounded px-3 py-2" value={form.codigo}
            onChange={(e) => setForm(f => ({ ...f, codigo: e.target.value === '' ? '' : Number(e.target.value) }))}
            disabled={editing !== null}
            required />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600">Descrição</label>
          <input className="w-full border rounded px-3 py-2" value={form.descricao}
            onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          {editing === null ? (<><Plus size={16} /> Adicionar</>) : (<><Edit size={16} /> Guardar</>)}
        </button>
        {editing !== null && (
          <button type="button" onClick={() => { setEditing(null); setForm({ codigo: '', descricao: '' }); }} className="px-4 py-2 rounded border">
            Cancelar
          </button>
        )}
      </form>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Descrição</th>
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

