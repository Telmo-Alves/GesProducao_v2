import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Save, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ConfigPage: React.FC = () => {
  const [iniContent, setIniContent] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    loadIniContent();
  }, []);

  const loadIniContent = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://192.168.1.91:3003/api/config/ini', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      const data = await response.json();
      if (data.success) {
        setIniContent(data.data.content);
        setOriginalContent(data.data.content);
        setConfigPath(data.data.path);
      } else {
        toast.error(data.error || 'Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const saveIniContent = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://192.168.1.91:3003/api/config/ini', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: iniContent })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      const data = await response.json();
      if (data.success) {
        setOriginalContent(iniContent);
        toast.success('Configurações salvas com sucesso');
      } else {
        toast.error(data.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const resetChanges = () => {
    setIniContent(originalContent);
    toast.success('Alterações revertidas');
  };

  const hasChanges = iniContent !== originalContent;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h1 className="text-lg font-semibold text-gray-900">
                Editor de Configurações
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={resetChanges}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reverter</span>
                </Button>
              )}
              <Button
                onClick={saveIniContent}
                disabled={isLoading || !hasChanges}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </Button>
            </div>
          </div>
          {configPath && (
            <p className="mt-2 text-sm text-gray-500">
              Arquivo: {configPath}
            </p>
          )}
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo do arquivo INI
              </label>
              <textarea
                value={iniContent}
                onChange={(e) => setIniContent(e.target.value)}
                disabled={isLoading}
                className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Carregando configurações..."
              />
            </div>

            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Alterações não salvas
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Você tem alterações não salvas. Clique em "Salvar" para aplicar as mudanças ou "Reverter" para desfazer.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Informação
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Este editor permite modificar diretamente o arquivo de configuração INI. Tenha cuidado ao alterar os valores, pois configurações incorretas podem afetar o funcionamento do sistema.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};