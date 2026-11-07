import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  employeeToEdit: Employee | null;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Employee>) => void;
}

export const EmployeeModal: React.FC<Props> = ({
  isOpen,
  employeeToEdit,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [fullName, setFullName] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState<number>(50);
  const [weeklyCleaningCost, setWeeklyCleaningCost] = useState<number>(20);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (employeeToEdit) {
      setFullName(employeeToEdit.fullName);
      setCommissionPercentage(employeeToEdit.commissionPercentage);
      setWeeklyCleaningCost(employeeToEdit.weeklyCleaningCost);
      setIsActive(employeeToEdit.isActive);
    } else {
      setFullName('');
      setCommissionPercentage(50);
      setWeeklyCleaningCost(20);
      setIsActive(true);
    }
    setErrorMessage('');
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Escriba el nombre del empleado.');
      return;
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      setErrorMessage('La comisión debe ser entre 0% y 100%.');
      return;
    }

    if (weeklyCleaningCost < 0) {
      setErrorMessage('El costo de limpieza semanal debe ser mayor o igual a 0.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      commissionPercentage: Number(commissionPercentage),
      weeklyCleaningCost: Number(weeklyCleaningCost),
      isActive,
    };

    if (employeeToEdit) {
      onUpdate(employeeToEdit.id, payload);
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
            <UserPlus className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">
              {employeeToEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-sm text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Nombre Completo:
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900 font-semibold"
            />
          </div>

          {/* Comisión y Costo de Limpieza Semanal */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Porcentaje de Comisión (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={commissionPercentage}
                  onChange={e => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 pr-8 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center font-bold text-slate-500 text-sm">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Costo de Limpieza Semanal ($):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-500 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={weeklyCleaningCost}
                  onChange={e => setWeeklyCleaningCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 h-5 w-5"
              />
              <span className="text-sm font-bold text-slate-800">
                Empleado Activo
              </span>
            </label>
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
              Guardar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
