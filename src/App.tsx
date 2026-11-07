/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Navbar } from './components/layout/Navbar';
import { DailySalesView } from './components/sales/DailySalesView';
import { ReportsView } from './components/reports/ReportsView';
import { EmployeeManagementView } from './components/employees/EmployeeManagementView';
import { CatalogManagementView } from './components/catalog/CatalogManagementView';
import { SalesEntryModal } from './components/sales/SalesEntryModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { getAuthSession, logoutUser } from './utils/auth';
import { AuthSession } from './types';

interface ContentProps {
  session: AuthSession;
  onLogout: () => void;
}

const SalonAppContent: React.FC<ContentProps> = ({ session, onLogout }) => {
  const { activeTab, setActiveTab, isNewSaleModalOpen, setIsNewSaleModalOpen } = useSalon();
  const isCashierOnly = session.role === 'CASHIER';

  // Si es CAJA, forzar que siempre esté en la pestaña de ventas
  useEffect(() => {
    if (isCashierOnly && activeTab !== 'ventas') {
      setActiveTab('ventas');
    }
  }, [isCashierOnly, activeTab, setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar session={session} onLogout={onLogout} />

      {/* Main Content Viewport con espacio superior amplio */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
        {isCashierOnly ? (
          // Vista exclusiva de CAJA: solo registro diario de ventas
          <DailySalesView />
        ) : (
          // Vista de Administrador (OLGA): acceso a todos los módulos
          <>
            {activeTab === 'ventas' && <DailySalesView />}
            {activeTab === 'reportes' && <ReportsView />}
            {activeTab === 'empleados' && <EmployeeManagementView />}
            {activeTab === 'catalogos' && <CatalogManagementView />}
          </>
        )}
      </main>

      {/* Modal de Registro de Venta */}
      <SalesEntryModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
      />

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        Olga Salon Glow · {session.role === 'ADMIN' ? 'Modo Administradora' : 'Modo Caja Registradora'}
      </footer>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <SalonProvider>
      <SalonAppContent session={session} onLogout={handleLogout} />
    </SalonProvider>
  );
}
