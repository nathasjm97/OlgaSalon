import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Employee } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { EmployeeModal } from './EmployeeModal';
import {
  UserPlus,
  Users,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const EmployeeManagementView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, transactions } = useSalon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const q = searchTerm.toLowerCase().trim();
    return !q || emp.fullName.toLowerCase().includes(q);
  });

  const handleOpenCreate = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  const handleDelete = (emp: Employee) => {
    if (window.confirm(`¿Está seguro de eliminar o dar de baja a "${emp.fullName}"?`)) {
      const result = deleteEmployee(emp.id);
      if (result.message) {
        setToastMessage(result.message);
        setTimeout(() => setToastMessage(null), 5000);
      }
    }
  };

  const handleToggleStatus = (emp: Employee) => {
    updateEmployee(emp.id, { isActive: !emp.isActive });
  };

  return (
    <div className="space-y-6 pt-2">
      {toastMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-blue-600 font-bold ml-4"
          >
            OK
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Empleados
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5 text-amber-400" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar empleado por nombre..."
          className="w-full text-base bg-transparent focus:outline-none text-slate-900 font-medium"
        />
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                <th className="py-4 px-6">Empleado</th>
                <th className="py-4 px-6 text-center">% de Comisión</th>
                <th className="py-4 px-6 text-right">Costo Limpieza Semanal</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-base">{emp.fullName}</div>
                  </td>

                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="inline-block font-mono font-bold text-slate-900 text-base bg-slate-100 px-3 py-1 rounded-lg">
                      {emp.commissionPercentage}%
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-slate-900 text-base">
                    {formatCurrency(emp.weeklyCleaningCost)}
                    <span className="text-xs text-slate-400 font-normal block">por semana</span>
                  </td>

                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(emp)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        emp.isActive
                          ? 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
                          : 'text-slate-600 bg-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      {emp.isActive ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-slate-500" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Editar empleado"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        employeeToEdit={employeeToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={addEmployee}
        onUpdate={updateEmployee}
      />
    </div>
  );
};
