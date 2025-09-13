import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Save, TestTube, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';
import { configApi } from '../../services/api';
import { AppConfig } from '../../types';

export const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ producao: false, gescom: false });
  const [connectionStatus, setConnectionStatus] = useState<{ producao: boolean | null; gescom: boolean | null }>({ producao: null, gescom: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await configApi.getConfig();
      if (response.data.success) {
        setConfig(response.data.data || null);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await configApi.updateConfig(config);
      
      if (response.data.success) {
        setSuccess('Configurações salvas com sucesso');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Erro ao salvar configurações');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (database: 'producao' | 'gescom') => {
    try {
      setTesting(prev => ({ ...prev, [database]: true }));
      setConnectionStatus(prev => ({ ...prev, [database]: null }));

      const response = await configApi.testConnection(database);
      
      if (response.data.success) {
        setConnectionStatus(prev => ({
          ...prev,
          [database]: response.data.data?.connected || false
        }));
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [database]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [database]: false }));
    }
  };

  const testAllConnections = async () => {
    try {
      setTesting({ producao: true, gescom: true });
      setConnectionStatus({ producao: null, gescom: null });

      const response = await configApi.testAllConnections();
      
      if (response.data.success) {
        setConnectionStatus({
          producao: response.data.data?.producao || false,
          gescom: response.data.data?.gescom || false
        });
      }
    } catch (error) {
      setConnectionStatus({ producao: false, gescom: false });
    } finally {
      setTesting({ producao: false, gescom: false });
    }
  };

  const reloadConfig = async () => {
    try {
      await configApi.reloadConfig();
      await loadConfig();
      setSuccess('Configurações recarregadas com sucesso');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao recarregar configurações');
    }
  };

  const updateConfig = (section: 'Producao' | 'Gescom', field: string, value: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  const getConnectionIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getConnectionText = (status: boolean | null) => {
    if (status === null) return 'Não testado';
    return status ? 'Conexão OK' : 'Falha na conexão';
  };

  const getConnectionColor = (status: boolean | null) => {
    if (status === null) return 'text-gray-500';
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar configurações</p>
        <Button onClick={loadConfig} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerir configurações das bases de dados</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={reloadConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button onClick={testAllConnections}>
            <TestTube className="h-4 w-4 mr-2" />
            Testar Todas
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configurações Produção */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Base de Dados - Produção
              </CardTitle>
              <div className="flex items-center space-x-2">
                {getConnectionIcon(connectionStatus.producao)}
                <span className={`text-sm ${getConnectionColor(connectionStatus.producao)}`}>
                  {getConnectionText(connectionStatus.producao)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor
              </label>
              <Input
                value={config.Producao.BD_Servidor}
                onChange={(e) => updateConfig('Producao', 'BD_Servidor', e.target.value)}
                placeholder="servidor:porta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caminho da Base de Dados
              </label>
              <Input
                value={config.Producao.BD_Path}
                onChange={(e) => updateConfig('Producao', 'BD_Path', e.target.value)}
                placeholder="Caminho para o ficheiro .fdb"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                value={config.Producao.BD_Username}
                onChange={(e) => updateConfig('Producao', 'BD_Username', e.target.value)}
                placeholder="Nome de utilizador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={config.Producao.BD_Password}
                onChange={(e) => updateConfig('Producao', 'BD_Password', e.target.value)}
                placeholder="Password"
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => testConnection('producao')}
              disabled={testing.producao}
            >
              {testing.producao ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </CardContent>
        </Card>

        {/* Configurações Gescom */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Base de Dados - Gescom
              </CardTitle>
              <div className="flex items-center space-x-2">
                {getConnectionIcon(connectionStatus.gescom)}
                <span className={`text-sm ${getConnectionColor(connectionStatus.gescom)}`}>
                  {getConnectionText(connectionStatus.gescom)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor
              </label>
              <Input
                value={config.Gescom.BD2_Servidor}
                onChange={(e) => updateConfig('Gescom', 'BD2_Servidor', e.target.value)}
                placeholder="servidor:porta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caminho da Base de Dados
              </label>
              <Input
                value={config.Gescom.BD2_Path}
                onChange={(e) => updateConfig('Gescom', 'BD2_Path', e.target.value)}
                placeholder="Caminho para o ficheiro .fdb"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                value={config.Gescom.BD2_Username}
                onChange={(e) => updateConfig('Gescom', 'BD2_Username', e.target.value)}
                placeholder="Nome de utilizador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={config.Gescom.BD2_Password}
                onChange={(e) => updateConfig('Gescom', 'BD2_Password', e.target.value)}
                placeholder="Password"
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => testConnection('gescom')}
              disabled={testing.gescom}
            >
              {testing.gescom ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• As configurações são guardadas no ficheiro <code>config.ini</code></p>
            <p>• As alterações só entram em vigor após guardar</p>
            <p>• Use "Testar Conexão" para verificar se as credenciais estão corretas</p>
            <p>• O formato do servidor deve ser: <code>hostname:porta</code> (ex: localhost:3050)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};