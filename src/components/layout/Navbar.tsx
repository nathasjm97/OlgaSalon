import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { AuthSession } from '../../types';
import { Lock, Menu, X, CalendarCheck, TrendingUp, Users, Tag } from 'lucide-react';

interface Props {
  session: AuthSession;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ session, onLogout }) => {
  const { activeTab, setActiveTab } = useSalon();
  const isAdmin = session.role === 'ADMIN';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'ventas' | 'reportes' | 'empleados' | 'catalogos') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-18">
          {/* Brand Wordmark & Role Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Olga Salon Glow
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isAdmin ? 'Dueña (OLGA)' : 'Punto de Venta (CAJA)'}
            </span>
          </div>

          {/* Desktop Navigation Links: Solo para administrador (OLGA) */}
          {isAdmin ? (
            <nav className="hidden md:flex items-center gap-6 py-2">
              <button
                onClick={() => handleNavClick('ventas')}
                className={`text-base font-semibold whitespace-nowrap transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'ventas'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Registro Diario
              </button>

              <button
                onClick={() => handleNavClick('reportes')}
                className={`text-base font-semibold whitespace-nowrap transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'reportes'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Reportes & Ganancias
              </button>

              <button
                onClick={() => handleNavClick('empleados')}
                className={`text-base font-semibold whitespace-nowrap transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'empleados'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Empleados
              </button>

              <button
                onClick={() => handleNavClick('catalogos')}
                className={`text-base font-semibold whitespace-nowrap transition-colors py-2 px-3 border-b-2 ${
                  activeTab === 'catalogos'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Precios e Insumos
              </button>
            </nav>
          ) : (
            <div className="hidden md:block text-sm font-semibold text-slate-500">
              Módulo Exclusivo de Registro de Caja
            </div>
          )}

          {/* Right Actions: Desktop Bloquear & Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onLogout}
              title="Bloquear pantalla de caja"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Bloquear</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Abrir menú"
              className="flex md:hidden items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">
            Menú de Navegación ({isAdmin ? 'Administradora' : 'Caja'})
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleNavClick('ventas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-left transition-colors ${
                activeTab === 'ventas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              <span>Registro Diario de Ventas</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('reportes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-left transition-colors ${
                    activeTab === 'reportes'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span>Reportes & Ganancias</span>
                </button>

                <button
                  onClick={() => handleNavClick('empleados')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-left transition-colors ${
                    activeTab === 'empleados'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Empleados</span>
                </button>

                <button
                  onClick={() => handleNavClick('catalogos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-left transition-colors ${
                    activeTab === 'catalogos'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-5 h-5 text-purple-500" />
                  <span>Precios e Insumos</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <Lock className="w-5 h-5" />
              <span>Bloquear / Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
