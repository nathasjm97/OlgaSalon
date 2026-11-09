import React, { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { TransactionServiceItem } from '../../types';
import { formatCurrency, getTodayDateString, getCurrentTimeString } from '../../utils/formatters';
import { X, Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesEntryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { employees, services, addTransaction } = useSalon();

  const activeEmployees = employees.filter(e => e.isActive);

  // Form State: Solo el empleado que realizó el servicio (caja única)
  const [employeeId, setEmployeeId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'otro'>('tarjeta');
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDateString());
  const [transactionTime, setTransactionTime] = useState<string>(getCurrentTimeString());

  // Servicios realizados en el ticket
  const [selectedServices, setSelectedServices] = useState<TransactionServiceItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTransactionDate(getTodayDateString());
      setTransactionTime(getCurrentTimeString());
      setErrorMessage('');

      if (activeEmployees.length > 0 && !employeeId) {
        setEmployeeId(activeEmployees[0].id);
      }

      if (selectedServices.length === 0 && services.length > 0) {
        const defaultSrv = services[0];
        setSelectedServices([
          {
            id: `item-${Date.now()}`,
            serviceId: defaultSrv.id,
            serviceName: defaultSrv.serviceName,
            serviceAmount: defaultSrv.defaultPrice || 40.0,
            productCost: 0,
            netCommissionableBase: defaultSrv.defaultPrice || 40.0,
          },
        ]);
      }
    }
  }, [isOpen, services]);

  if (!isOpen) return null;

  const currentEmp = employees.find(e => e.id === employeeId);
  const commissionPercentage = currentEmp ? currentEmp.commissionPercentage : 50;

  const handleAddServiceRow = () => {
    if (services.length === 0) return;
    const defaultSrv = services[0];
    setSelectedServices(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        serviceId: defaultSrv.id,
        serviceName: defaultSrv.serviceName,
        serviceAmount: defaultSrv.defaultPrice,
        productCost: 0,
        netCommissionableBase: defaultSrv.defaultPrice,
      },
    ]);
  };

  const handleRemoveServiceRow = (itemId: string) => {
    if (selectedServices.length <= 1) {
      setErrorMessage('Debe haber al menos un servicio en la cuenta.');
      return;
    }
    setErrorMessage('');
    setSelectedServices(prev => prev.filter(item => item.id !== itemId));
  };

  const handleServiceChange = (itemId: string, newServiceId: string) => {
    const catalogItem = services.find(s => s.id === newServiceId);
    if (!catalogItem) return;

    setSelectedServices(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newAmount = catalogItem.defaultPrice;
          return {
            ...item,
            serviceId: catalogItem.id,
            serviceName: catalogItem.serviceName,
            serviceAmount: newAmount,
            productCost: 0,
            netCommissionableBase: newAmount,
          };
        }
        return item;
      })
    );
  };

  const handleServiceAmountChange = (itemId: string, amountStr: string) => {
    const val = parseFloat(amountStr);
    const amount = isNaN(val) ? 0 : Math.max(0, val);
    setSelectedServices(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            serviceAmount: amount,
            productCost: 0,
            netCommissionableBase: amount,
          };
        }
        return item;
      })
    );
  };

  // Cálculo del Total a Cobrar (solo suma de servicios)
  const totalServiceAmount = selectedServices.reduce((acc, curr) => acc + (curr.serviceAmount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!employeeId) {
      setErrorMessage('Seleccione qué empleado realizó el servicio.');
      return;
    }

    if (selectedServices.length === 0) {
      setErrorMessage('Agregue al menos un servicio.');
      return;
    }

    const performingEmp = employees.find(e => e.id === employeeId);
    const initialCommission = (totalServiceAmount * commissionPercentage) / 100;

    addTransaction({
      employeeId,
      employeeName: performingEmp ? performingEmp.fullName : 'Empleado',
      paymentMethod,
      services: selectedServices.map(s => ({
        ...s,
        productCost: 0,
        netCommissionableBase: s.serviceAmount,
      })),
      totalServiceAmount,
      totalProductCost: 0, // Se gestiona al final del día por la dueña
      totalCommissionableBase: totalServiceAmount,
      totalCommissionEarned: initialCommission,
      totalTransactionAmount: totalServiceAmount,
      date: transactionDate,
      time: transactionTime,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden my-6">
        {/* Encabezado directo y limpio */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            Registrar Venta
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 text-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-sm text-red-800 font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Empleado que realizó el trabajo (Sin comisión en la etiqueta) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Empleado que Realizó el Servicio:
            </label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="">-- Seleccionar Empleado --</option>
              {activeEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha, Hora y Medio de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Hora
              </label>
              <input
                type="time"
                step="1"
                value={transactionTime}
                onChange={e => setTransactionTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Forma de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900"
              >
                <option value="tarjeta">Tarjeta</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Lista de Servicios (Solo nombre del servicio y monto cobrado) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-base font-bold text-slate-900">
                Servicios Realizados
              </span>

              <button
                type="button"
                onClick={handleAddServiceRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Otro Servicio
              </button>
            </div>

            <div className="space-y-3">
              {selectedServices.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Servicio #{index + 1}
                    </span>
                    {selectedServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceRow(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Selector de Servicio */}
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Servicio:
                      </label>
                      <select
                        value={item.serviceId}
                        onChange={e => handleServiceChange(item.id, e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900"
                      >
                        {services.map(srv => (
                          <option key={srv.id} value={srv.id}>
                            {srv.serviceName} ({formatCurrency(srv.defaultPrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Monto del Servicio */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Monto Cobrado ($):
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.serviceAmount === 0 ? '' : item.serviceAmount}
                          onChange={e => handleServiceAmountChange(item.id, e.target.value)}
                          placeholder="40.00"
                          className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-base font-bold font-mono tabular-nums text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cuadro Final: Solo Total a Cobrar */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <span className="text-base font-semibold text-slate-300">
              Total a Cobrar:
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {formatCurrency(totalServiceAmount)}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-7 py-3 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              Guardar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
