import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ConfigPage } from './pages/admin/ConfigPage';
import ReportingPage from './pages/admin/ReportingPage';
import { ConfigPage as IniConfigPage } from './pages/ConfigPage';
import { NotFoundPage } from './pages/NotFoundPage';
import Recepcao from './pages/Recepcao';
import FichasAcabamento from './pages/FichasAcabamento';
import ClientesPage from './pages/tabelas/ClientesPage';
import ArtigosPage from './pages/tabelas/ArtigosPage';
import ComposicoesPage from './pages/tabelas/ComposicoesPage';
import UnidadesPage from './pages/tabelas/UnidadesPage';
import SeccoesPage from './pages/tabelas/SeccoesPage';
import AuxiliaresPage from './pages/tabelas/AuxiliaresPage';
import CorantesPage from './pages/tabelas/CorantesPage';
import CoresPage from './pages/tabelas/CoresPage';
import DesenhosPage from './pages/tabelas/DesenhosPage';
import EstadosPage from './pages/tabelas/EstadosPage';
import MaquinasPage from './pages/tabelas/MaquinasPage';
import OperacoesPage from './pages/tabelas/OperacoesPage';
import ProcessosPage from './pages/tabelas/ProcessosPage';
import TerminaisPage from './pages/tabelas/TerminaisPage';
import UtilizadoresSisPage from './pages/tabelas/UtilizadoresSisPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Rotas de Administração */}
              <Route path="admin/utilizadores" element={
                <ProtectedRoute requireAdmin>
                  <UsersPage />
                </ProtectedRoute>
              } />
              
              <Route path="admin/configuracoes" element={
                <ProtectedRoute requireAdmin>
                  <ConfigPage />
                </ProtectedRoute>
              } />
              <Route path="admin/reporting" element={
                <ProtectedRoute requireAdmin>
                  <ReportingPage />
                </ProtectedRoute>
              } />
              
              <Route path="configuracoes" element={
                <ProtectedRoute requireAdmin>
                  <IniConfigPage />
                </ProtectedRoute>
              } />
              
              {/* Rotas Tinturaria */}
              <Route path="tinturaria/recepcao" element={<Recepcao />} />
              <Route path="tinturaria/fichas-acabamento" element={<FichasAcabamento />} />
              
              <Route path="tinturaria/*" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900">Módulo Tinturaria</h2>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              } />
              
              <Route path="laboratorio/*" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900">Módulo Laboratório</h2>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              } />
              
              <Route path="estamparia/*" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900">Módulo Estamparia</h2>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              } />
              
              <Route path="sync/*" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900">Sincronizações</h2>
                  <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                </div>
              } />
              
              <Route path="tabelas/clientes" element={<ClientesPage />} />
              <Route path="tabelas/artigos" element={<ArtigosPage />} />
              <Route path="tabelas/composicoes" element={<ComposicoesPage />} />
              <Route path="tabelas/unidades" element={<UnidadesPage />} />
              <Route path="tabelas/seccoes" element={<SeccoesPage />} />
              <Route path="tabelas/auxiliares" element={<AuxiliaresPage />} />
              <Route path="tabelas/corantes" element={<CorantesPage />} />
              <Route path="tabelas/cores" element={<CoresPage />} />
              <Route path="tabelas/desenhos" element={<DesenhosPage />} />
              <Route path="tabelas/estados" element={<EstadosPage />} />
              <Route path="tabelas/maquinas" element={<MaquinasPage />} />
              <Route path="tabelas/operacoes" element={<OperacoesPage />} />
              <Route path="tabelas/processos" element={<ProcessosPage />} />
              <Route path="tabelas/terminais" element={<TerminaisPage />} />
              <Route path="tabelas/utilizadores" element={<UtilizadoresSisPage />} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
