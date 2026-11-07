import React, { useState, useEffect } from 'react';
import { ServiceCatalogItem } from '../../types';
import { X, Scissors, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  serviceToEdit: ServiceCatalogItem | null;
  onClose: () => void;
  onSave: (data: Omit<ServiceCatalogItem, 'id'>) => void;
  onUpdate: (id: string, data: Partial<ServiceCatalogItem>) => void;
}

export const ServiceModal: React.FC<Props> = ({
  isOpen,
  serviceToEdit,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number>(40);
  const [category, setCategory] = useState<ServiceCatalogItem['category']>('Cabello');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setServiceName(serviceToEdit.serviceName);
      setDefaultPrice(serviceToEdit.defaultPrice);
      setCategory(serviceToEdit.category);
    } else {
      setServiceName('');
      setDefaultPrice(40);
      setCategory('Cabello');
    }
    setErrorMessage('');
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setErrorMessage('Escriba el nombre del servicio.');
      return;
    }
    if (defaultPrice < 0) {
      setErrorMessage('El precio debe ser mayor o igual a 0.');
      return;
    }

    const payload = {
      serviceName: serviceName.trim(),
      defaultPrice: Number(defaultPrice),
      category,
    };

    if (serviceToEdit) {
      onUpdate(serviceToEdit.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">
              {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-sm text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Nombre del Servicio:
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              placeholder="Ej. Tinte de Cabello, Corte, Manicura"
              className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Precio ($):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={defaultPrice}
                  onChange={e => setDefaultPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Categoría:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="Cabello">Cabello</option>
                <option value="Coloración">Coloración</option>
                <option value="Uñas">Uñas</option>
                <option value="Tratamientos">Tratamientos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
