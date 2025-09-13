import React, { useEffect, useMemo, useState } from 'react';
import { reportsApi } from '../../services/api';
import { toast } from 'react-hot-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  styles: string;
  createdAt?: string;
  updatedAt?: string;
}

const ReportingPage: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [model, setModel] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [faInputs, setFaInputs] = useState({ seccao: '', numero: '' });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await reportsApi.listTemplates();
      if (data?.success) {
        setTemplates(data.data || []);
        if (!selectedId && (data.data || []).length) {
          setSelectedId(data.data[0].id);
        }
      }
    } catch (e) {
      toast.error('Erro a carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await reportsApi.getTemplate(id);
      if (data?.success) {
        setModel(data.data);
      }
    } catch {
      toast.error('Erro a carregar template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);
  useEffect(() => { if (selectedId) loadTemplate(selectedId); }, [selectedId]);

  const duplicate = () => {
    if (!model) return;
    const copy: ReportTemplate = {
      ...model,
      id: `${model.id}-copy-${Date.now()}`,
      name: `${model.name} (cópia)`,
    };
    setTemplates(prev => [copy, ...prev]);
    setSelectedId(copy.id);
    setModel(copy);
  };

  const createNew = async () => {
    const name = prompt('Nome do novo template:');
    if (!name) return;
    try {
      const { data } = await reportsApi.createTemplate({ name });
      if (data?.success) {
        toast.success('Template criado');
        await loadTemplates();
        setSelectedId(data.data.id);
      }
    } catch { toast.error('Erro a criar template'); }
  };

  const save = async () => {
    if (!model) return;
    try {
      await reportsApi.saveTemplate(model);
      toast.success('Template guardado');
      await loadTemplates();
    } catch (e) { toast.error('Erro a guardar'); }
  };

  const apiBase = useMemo(() => (import.meta.env.VITE_API_URL || 'http://localhost:3001/api'), []);
  const recepcoesPreviewUrl = useMemo(() => `${apiBase}/reports/recepcoes/preview?template=${encodeURIComponent(selectedId)}`, [apiBase, selectedId]);
  const faPreviewUrl = useMemo(() => {
    const { seccao, numero } = faInputs;
    if (!seccao || !numero) return '';
    return `${apiBase}/reports/fa/${seccao}/${numero}?template=${encodeURIComponent(selectedId)}`;
  }, [apiBase, selectedId, faInputs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Sidebar templates */}
      <div className="md:col-span-1 bg-white rounded shadow p-3 h-[calc(100vh-10rem)] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Templates</h3>
          <button className="text-sm px-2 py-1 border rounded" onClick={createNew}>Novo</button>
        </div>
        {loading && <div className="text-sm text-gray-500">A carregar…</div>}
        <ul className="space-y-1">
          {templates.map(t => (
            <li key={t.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selectedId===t.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.id}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="md:col-span-3 bg-white rounded shadow p-3 h-[calc(100vh-10rem)] flex flex-col gap-3">
        {!model ? (
          <div className="text-gray-500 text-sm">Selecione um template…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">ID</label>
                <input className="w-full border rounded px-2 py-1 text-sm" value={model.id} onChange={e=> setModel({...model, id: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Nome</label>
                <input className="w-full border rounded px-2 py-1 text-sm" value={model.name} onChange={e=> setModel({...model, name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600">Descrição</label>
                <input className="w-full border rounded px-2 py-1 text-sm" value={model.description || ''} onChange={e=> setModel({...model, description: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
              <div className="flex flex-col min-h-0">
                <label className="block text-xs text-gray-600 mb-1">HTML (Handlebars)</label>
                <textarea className="border rounded p-2 text-sm font-mono flex-1 resize-none" value={model.template} onChange={e=> setModel({...model, template: e.target.value})} />
              </div>
              <div className="flex flex-col min-h-0">
                <label className="block text-xs text-gray-600 mb-1">CSS</label>
                <textarea className="border rounded p-2 text-sm font-mono flex-1 resize-none" value={model.styles} onChange={e=> setModel({...model, styles: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="px-3 py-2 border rounded" onClick={duplicate}>Duplicar</button>
                <button className="px-3 py-2 border rounded bg-blue-600 text-white" onClick={save}>Guardar</button>
              </div>
              <div className="flex items-center gap-2">
                <a href={recepcoesPreviewUrl} target="_blank" className="px-3 py-2 border rounded" rel="noreferrer">Preview Recepções</a>
                <input className="w-20 border rounded px-2 py-1 text-sm" placeholder="Seccão" value={faInputs.seccao} onChange={e=> setFaInputs(v=>({...v, seccao:e.target.value}))} />
                <input className="w-24 border rounded px-2 py-1 text-sm" placeholder="Nº Ficha" value={faInputs.numero} onChange={e=> setFaInputs(v=>({...v, numero:e.target.value}))} />
                {faInputs.seccao && faInputs.numero && (
                  <a href={faPreviewUrl} target="_blank" className="px-3 py-2 border rounded" rel="noreferrer">Preview FA</a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportingPage;

