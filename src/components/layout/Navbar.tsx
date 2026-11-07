import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { AuthSession } from '../../types';
import { Lock, User } from 'lucide-react';

interface Props {
  session: AuthSession;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ session, onLogout }) => {
  const { activeTab, setActiveTab } = useSalon();
  const isAdmin = session.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Brand Wordmark & Role Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Olga Salon Glow
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {isAdmin ? 'Dueña (OLGA)' : 'Punto de Venta (CAJA)'}
            </span>
          </div>

          {/* Navigation Links: Solo para administrador (OLGA). El usuario CAJA solo tiene el registro diario */}
          {isAdmin ? (
            <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-2">
              <button
                onClick={() => setActiveTab('ventas')}
                className={`text-base font-semibold whitespace-nowrap shrink-0 transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'ventas'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Registro Diario
              </button>

              <button
                onClick={() => setActiveTab('reportes')}
                className={`text-base font-semibold whitespace-nowrap shrink-0 transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'reportes'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Reportes & Ganancias
              </button>

              <button
                onClick={() => setActiveTab('empleados')}
                className={`text-base font-semibold whitespace-nowrap shrink-0 transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'empleados'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Empleados
              </button>

              <button
                onClick={() => setActiveTab('catalogos')}
                className={`text-base font-semibold whitespace-nowrap shrink-0 transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'catalogos'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Precios e Insumos
              </button>
            </nav>
          ) : (
            <div className="hidden sm:block text-sm font-semibold text-slate-500">
              Módulo Exclusivo de Registro de Caja
            </div>
          )}

          {/* Botón de Bloqueo / Salir */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLogout}
              title="Bloquear pantalla de caja"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
