import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Activity, Monitor, Scan, Clock } from 'lucide-react';

interface MaquinaStatus {
  r_maquina: number;
  r_maquina_descricao: string;
  r_data: string;
  r_operacao_descricao: string;
  r_processo: string;
  r_fa_numero: number;
  r_rolos: number;
  r_pesos: number;
  r_medidas: number;
  r_cliente_nome: string;
  r_artigo_descricao: string;
}

interface LeituraRegisto {
  timestamp: string;
  operacao: string;
  codigo: string;
  status: 'success' | 'error';
  message: string;
}

const OperacoesPage = () => {
  const [barCode, setBarCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [maquinasStatus, setMaquinasStatus] = useState<MaquinaStatus[]>([]);
  const [leituras, setLeituras] = useState<LeituraRegisto[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const barCodeInputRef = useRef<HTMLInputElement>(null);

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const loadMaquinasStatus = async () => {
    try {
      const response = await apiRequest('/operacoes/maquinas-status');
      setMaquinasStatus(response.data || []);
      setConnected(true);
    } catch (error) {
      console.error('Erro ao carregar status das máquinas:', error);
      setConnected(false);
    }
  };

  const processBarCode = async (codigo: string) => {
    if (!codigo.trim()) return;

    setLoading(true);
    const timestamp = new Date().toLocaleString('pt-PT');

    try {
      // Call API to register barcode reading with complete code
      const response = await apiRequest('/operacoes/registar-leitura', {
        method: 'POST',
        body: JSON.stringify({
          codigoCompleto: codigo,
          terminal: 'WEB-LEITOR'
        })
      });

      // Build detailed operation description
      let operacaoDetalhada = response.operacao || 'Operação';
      if (response.detalhes) {
        if (response.detalhes.maquina_descricao) {
          operacaoDetalhada = `${response.operacao} - ${response.detalhes.maquina_descricao}`;
        } else if (response.detalhes.fa_numero && response.detalhes.processo) {
          operacaoDetalhada = `${response.operacao} - FA ${response.detalhes.fa_numero} Processo ${response.detalhes.processo}`;
        }
      }

      const novaLeitura: LeituraRegisto = {
        timestamp,
        operacao: operacaoDetalhada,
        codigo: codigo,
        status: response.success ? 'success' : 'error',
        message: response.message || `Gravação OK: ${Math.floor(Math.random() * 10000)}`
      };

      setLeituras(prev => [novaLeitura, ...prev.slice(0, 9)]); // Keep last 10 readings

      // Refresh machine status after successful reading
      await loadMaquinasStatus();

    } catch (error) {
      const novaLeitura: LeituraRegisto = {
        timestamp,
        operacao: 'Erro',
        codigo: codigo,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      setLeituras(prev => [novaLeitura, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processBarCode(barCode);
      setBarCode('');
    }
  };

  const getMaquinaRowColor = (maquina: MaquinaStatus) => {
    if (maquina.r_fa_numero === 0) {
      return 'bg-red-500 text-white'; // Máquina livre
    }
    if (maquina.r_operacao_descricao.includes('Entrada')) {
      return 'bg-green-500 text-white'; // Entrada
    }
    if (maquina.r_operacao_descricao.includes('Saída')) {
      return 'bg-yellow-400 text-black'; // Saída
    }
    return 'bg-white text-gray-900';
  };

  const formatValue = (value: number): string => {
    return value === 0 ? '' : value.toString();
  };

  // Auto-refresh machines status every 30 seconds
  useEffect(() => {
    loadMaquinasStatus();
    const interval = setInterval(loadMaquinasStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update date/time every second
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date().toLocaleString('pt-PT'));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus barcode input
  useEffect(() => {
    const interval = setInterval(() => {
      if (barCodeInputRef.current) {
        barCodeInputRef.current.focus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Single Row Input */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-2">
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Barcode Input */}
            <div className="col-span-3 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded">
                <Scan className="text-blue-600" size={20} />
              </div>
              <input
                ref={barCodeInputRef}
                type="text"
                value={barCode}
                onChange={(e) => setBarCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Código..."
                className="flex-1 text-lg font-mono border rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              {loading && <Activity className="animate-spin text-yellow-600" size={16} />}
            </div>

            {/* Last Reading */}
            <div className="col-span-5">
              {leituras.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Última:</span>
                  <span className={`text-sm font-medium truncate ${leituras[0].status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {leituras[0].operacao}
                  </span>
                  <span className={`text-xs ${leituras[0].status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {leituras[0].status === 'success' ? '✓' : '✗'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Aguardando leituras...</span>
              )}
            </div>

            {/* Connection Status */}
            <div className="col-span-2 flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{connected ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Date Time */}
            <div className="col-span-2 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{currentDateTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Status Grid - Full Width */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="overflow-auto" style={{maxHeight: 'calc(100vh - 80px)'}}>
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Máquina</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Data</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Operação</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Acabamento</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700 text-xs">FA</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700 text-xs">Rolos</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700 text-xs">Pesos</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700 text-xs">Medidas</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 text-xs">Artigo</th>
                </tr>
              </thead>
              <tbody>
                {maquinasStatus.map((maquina, index) => (
                  <tr key={index} className={`${getMaquinaRowColor(maquina)} border-b border-gray-100`}>
                    <td className="px-3 py-1.5 font-medium text-xs">{maquina.r_maquina_descricao}</td>
                    <td className="px-3 py-1.5 text-xs">
                      {maquina.r_data ? new Date(maquina.r_data).toLocaleDateString('pt-PT') : ''}
                    </td>
                    <td className="px-3 py-1.5 text-xs">{maquina.r_operacao_descricao}</td>
                    <td className="px-3 py-1.5 text-xs">{maquina.r_processo}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-xs">
                      {formatValue(maquina.r_fa_numero)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-xs">
                      {formatValue(maquina.r_rolos)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-xs">
                      {maquina.r_pesos > 0 ? maquina.r_pesos.toFixed(1) : ''}
                    </td>
                    <td className="px-3 py-1.5 text-right text-xs">
                      {maquina.r_medidas > 0 ? maquina.r_medidas.toFixed(1) : ''}
                    </td>
                    <td className="px-3 py-1.5 text-xs">{maquina.r_cliente_nome}</td>
                    <td className="px-3 py-1.5 text-xs">{maquina.r_artigo_descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperacoesPage;