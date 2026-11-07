import React, { useState } from 'react';
import { verifyLogin } from '../../utils/auth';
import { AuthSession } from '../../types';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: (session: AuthSession) => void;
}

export const LoginScreen: React.FC<Props> = ({ onSuccess }) => {
  const [username, setUsername] = useState<'OLGA' | 'CAJA' | string>('OLGA');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setIsLoading(true);
    setError(false);

    try {
      const session = await verifyLogin(username, pin);
      if (session) {
        onSuccess(session);
      } else {
        setError(true);
        setPin('');
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleKeypadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setPin('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-8 sm:p-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Olga Salon Glow
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Acceso al Sistema
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-red-700 font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Usuario o PIN incorrecto. Intente nuevamente.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Usuario Rápido */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Seleccionar Usuario:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('OLGA');
                  setPin('');
                  setError(false);
                }}
                className={`py-3 px-4 rounded-xl text-base font-bold transition-all border ${
                  username.toUpperCase() === 'OLGA'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                OLGA (Dueña)
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('CAJA');
                  setPin('');
                  setError(false);
                }}
                className={`py-3 px-4 rounded-xl text-base font-bold transition-all border ${
                  username.toUpperCase() === 'CAJA'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                CAJA (Registro)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              PIN de Acceso
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              required
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-2xl font-mono tracking-widest text-center text-slate-900 font-bold focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Teclado numérico grande y táctil */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-xl font-bold font-mono text-slate-800 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-xs font-bold text-slate-600 transition-colors"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-xl font-bold font-mono text-slate-800 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-sm font-bold text-slate-600 transition-colors"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !pin}
            className="w-full mt-4 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verificando...' : 'Ingresar'}</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </button>
        </form>
      </div>
    </div>
  );
};
