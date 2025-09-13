import React, { useState } from 'react';
import { Save, Eye, Download, Database, Plus, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ReportElement {
  id: string;
  type: 'text' | 'table' | 'header' | 'footer';
  content: string;
  style: any;
}

export default function SimpleReportDesigner() {
  const { user } = useAuth();
  const [reportName, setReportName] = useState<string>('Novo Report');
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('producao');

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Acesso restrito a administradores</p>
      </div>
    );
  }

  const addElement = (type: 'text' | 'table' | 'header' | 'footer') => {
    const newElement: ReportElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type)
    };

    setElements([...elements, newElement]);
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text':
        return 'Clique para editar texto';
      case 'header':
        return `<h1>{{reportTitle}}</h1><p>Gerado em: {{currentDate}}</p>`;
      case 'footer':
        return `<p>Página {{pageNumber}} de {{totalPages}}</p>`;
      case 'table':
        return `
          <table class="data-table">
            <thead>
              <tr>
                <th>Secção</th>
                <th>Número</th>
                <th>Cliente</th>
                <th>Artigo</th>
                <th>Pendente</th>
                <th>Metros</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{SECCAO}}</td>
                <td>{{NUMERO}}</td>
                <td>{{CLIENTE}}</td>
                <td>{{ARTIGO}}</td>
                <td>{{PENDENTE}}</td>
                <td>{{METROS_PENDENTES}}</td>
              </tr>
            </tbody>
          </table>
        `;
      default:
        return '';
    }
  };

  const getDefaultStyle = (type: string): any => {
    switch (type) {
      case 'header':
        return { textAlign: 'center', borderBottom: '2px solid #333', padding: '20px', marginBottom: '20px' };
      case 'footer':
        return { textAlign: 'center', borderTop: '1px solid #ccc', padding: '15px', marginTop: '20px' };
      case 'table':
        return { width: '100%', borderCollapse: 'collapse', margin: '20px 0' };
      default:
        return { padding: '10px' };
    }
  };

  const updateElement = (id: string, content: string) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, content } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handlePreview = () => {
    const html = generateHTML();
    const previewWindow = window.open('', '_blank');
    previewWindow?.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview - ${reportName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .data-table th { background-color: #f2f2f2; }
            .element { margin: 10px 0; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
  };

  const generateHTML = (): string => {
    return elements.map(element => {
      let processedContent = element.content
        .replace(/\{\{reportTitle\}\}/g, reportName)
        .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString('pt-PT'))
        .replace(/\{\{pageNumber\}\}/g, '1')
        .replace(/\{\{totalPages\}\}/g, '1');

      // Mock data for table
      if (element.type === 'table') {
        processedContent = processedContent
          .replace(/\{\{SECCAO\}\}/g, '1')
          .replace(/\{\{NUMERO\}\}/g, '12345')
          .replace(/\{\{CLIENTE\}\}/g, 'Cliente Exemplo')
          .replace(/\{\{ARTIGO\}\}/g, 'ART001')
          .replace(/\{\{PENDENTE\}\}/g, '5')
          .replace(/\{\{METROS_PENDENTES\}\}/g, '150.5');
      }

      const styleString = Object.entries(element.style)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');

      return `<div class="element" style="${styleString}">${processedContent}</div>`;
    }).join('\n');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/reports/visual/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: reportName,
          html: generateHTML(),
          css: '.data-table { width: 100%; border-collapse: collapse; } .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; }',
          components: elements,
          dataSource
        })
      });

      if (response.ok) {
        alert('Report guardado com sucesso!');
      } else {
        alert('Erro ao guardar report');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Erro ao guardar report');
    }
  };

  const selectedEl = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Database className="h-6 w-6 text-blue-600" />
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
            placeholder="Nome do Report"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="producao">Base Produção</option>
            <option value="gescom">Base Gescom</option>
          </select>

          <button
            onClick={handlePreview}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </button>

          <button
            onClick={handleSave}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Components */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Componentes</h3>
          </div>

          <div className="p-4 space-y-2">
            <button
              onClick={() => addElement('header')}
              className="w-full flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cabeçalho
            </button>

            <button
              onClick={() => addElement('text')}
              className="w-full flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Texto
            </button>

            <button
              onClick={() => addElement('table')}
              className="w-full flex items-center px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tabela Recepções
            </button>

            <button
              onClick={() => addElement('footer')}
              className="w-full flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Rodapé
            </button>
          </div>
        </div>

        {/* Center - Editor */}
        <div className="flex-1 p-6">
          <div className="bg-white shadow-sm rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Editor do Report</h2>

            {elements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Adicione componentes usando os botões da esquerda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {element.type}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement(element.id);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: element.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-white shadow-sm border-l">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Propriedades</h3>
          </div>

          {selectedEl ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={selectedEl.content}
                  onChange={(e) => updateElement(selectedEl.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo: <span className="capitalize">{selectedEl.type}</span>
                </label>
              </div>

              {selectedEl.type === 'table' && (
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Variables disponíveis:</p>
                  <p>{{SECCAO}}</p>
                  <p>{{NUMERO}}</p>
                  <p>{{CLIENTE}}</p>
                  <p>{{ARTIGO}}</p>
                  <p>{{PENDENTE}}</p>
                  <p>{{METROS_PENDENTES}}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500">
              Selecione um elemento para editar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}