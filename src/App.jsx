import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './contexts/AuthContext'
import { LaudoProvider } from './contexts/LaudoContext'
import { DiseaseProvider } from './contexts/DiseaseContext'
import { NotificacoesProvider } from './contexts/NotificacoesContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { PastasProvider } from './contexts/PastasContext'
import ProtectedRoute from './router/ProtectedRoute'
import MainLayout from './components/layout/MainLayout/MainLayout'
import LoginPage from './pages/LoginPage/LoginPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import VisualizacaoPage from './pages/VisualizacaoPage/VisualizacaoPage'
import VerificarLaudosPage from './pages/VerificarLaudosPage/VerificarLaudosPage'
import AtribuirLaudoPage from './pages/AtribuirLaudoPage/AtribuirLaudoPage'
import CondicoesPage from './pages/CondicoesPage/CondicoesPage'
import RevisaoLaudoPage from './pages/RevisaoLaudoPage/RevisaoLaudoPage'
import EmailSyncPage from './pages/EmailSyncPage/EmailSyncPage'
import FileExplorerPage from './pages/FileExplorerPage/FileExplorerPage'

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SidebarProvider>
          <NotificacoesProvider>
            <DiseaseProvider>
              <LaudoProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/visualizacao" element={<VisualizacaoPage />} />
                      <Route path="/verificar-laudos" element={<VerificarLaudosPage />} />
                      <Route path="/atribuir-laudo" element={<AtribuirLaudoPage />} />
                      <Route path="/condicoes" element={<CondicoesPage />} />
                      <Route path="/revisar-laudo/:id" element={<RevisaoLaudoPage />} />
                      <Route path="/email-sync" element={<EmailSyncPage />} />
                      <Route path="/arquivos" element={
                        <PastasProvider>
                          <FileExplorerPage />
                        </PastasProvider>
                      } />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </LaudoProvider>
            </DiseaseProvider>
          </NotificacoesProvider>
        </SidebarProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  )
}
