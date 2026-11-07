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
  const { employees, services, products, addTransaction } = useSalon();

  const activeEmployees = employees.filter(e => e.isActive);

  // Form State: Solo el empleado que hizo el trabajo (una sola caja siempre registra)
  const [employeeId, setEmployeeId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'otro'>('tarjeta');
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDateString());
  const [transactionTime, setTransactionTime] = useState<string>(getCurrentTimeString());

  // Servicios con su costo de producto consumido
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
        const defaultSrv = services[1] || services[0]; // Tinte o primer servicio
        const defaultProd = products[0]; // Tubo de tinte

        setSelectedServices([
          {
            id: `item-${Date.now()}`,
            serviceId: defaultSrv.id,
            serviceName: defaultSrv.serviceName,
            serviceAmount: defaultSrv.defaultPrice || 40.0,
            productId: defaultProd ? defaultProd.id : undefined,
            productName: defaultProd ? defaultProd.productName : undefined,
            productCost: defaultProd ? defaultProd.defaultCost : 20.0,
            netCommissionableBase: Math.max(0, (defaultSrv.defaultPrice || 40.0) - (defaultProd ? defaultProd.defaultCost : 20.0)),
          },
        ]);
      }
    }
  }, [isOpen, services, products]);

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
          const cost = item.productCost || 0;
          return {
            ...item,
            serviceId: catalogItem.id,
            serviceName: catalogItem.serviceName,
            serviceAmount: newAmount,
            netCommissionableBase: Math.max(0, newAmount - cost),
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
          const cost = item.productCost || 0;
          return {
            ...item,
            serviceAmount: amount,
            netCommissionableBase: Math.max(0, amount - cost),
          };
        }
        return item;
      })
    );
  };

  const handleProductSelection = (itemId: string, prodId: string) => {
    if (!prodId) {
      setSelectedServices(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                productId: undefined,
                productName: undefined,
                productCost: 0,
                netCommissionableBase: item.serviceAmount,
              }
            : item
        )
      );
      return;
    }

    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setSelectedServices(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const cost = prod.defaultCost;
          return {
            ...item,
            productId: prod.id,
            productName: prod.productName,
            productCost: cost,
            netCommissionableBase: Math.max(0, item.serviceAmount - cost),
          };
        }
        return item;
      })
    );
  };

  const handleProductCostChange = (itemId: string, costStr: string) => {
    const val = parseFloat(costStr);
    const cost = isNaN(val) ? 0 : Math.max(0, val);
    setSelectedServices(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            productCost: cost,
            netCommissionableBase: Math.max(0, item.serviceAmount - cost),
          };
        }
        return item;
      })
    );
  };

  // Cálculos totales
  const totalServiceAmount = selectedServices.reduce((acc, curr) => acc + (curr.serviceAmount || 0), 0);
  const totalProductCost = selectedServices.reduce((acc, curr) => acc + (curr.productCost || 0), 0);
  const totalCommissionableBase = Math.max(0, totalServiceAmount - totalProductCost);
  const totalCommissionEarned = (totalCommissionableBase * commissionPercentage) / 100;

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

    addTransaction({
      employeeId,
      employeeName: performingEmp ? performingEmp.fullName : 'Empleado',
      paymentMethod,
      services: selectedServices,
      totalServiceAmount,
      totalProductCost,
      totalCommissionableBase,
      totalCommissionEarned,
      totalTransactionAmount: totalServiceAmount,
      date: transactionDate,
      time: transactionTime,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden my-6">
        {/* Encabezado directo y claro */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            Registrar Venta de Servicios
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 text-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-sm text-red-800 font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Empleado que realizó el trabajo */}
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
                  {emp.fullName} ({emp.commissionPercentage}% de comisión)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha, Hora y Método de Pago */}
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

          {/* Servicios e Insumos Consumidos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-base font-bold text-slate-900">
                Servicios & Costo de Producto
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
              {selectedServices.map((item, index) => {
                const commission = (item.netCommissionableBase * commissionPercentage) / 100;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
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
                      {/* Servicio */}
                      <div className="sm:col-span-7">
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Servicio:
                        </label>
                        <select
                          value={item.serviceId}
                          onChange={e => handleServiceChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900"
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
                        <label className="block text-xs font-bold text-slate-800 mb-1">
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
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-base font-bold font-mono tabular-nums text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Espacio para costo de producto */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                          <label className="block text-xs text-slate-600 mb-1 font-medium">
                            Producto o Insumo Usado:
                          </label>
                          <select
                            value={item.productId || ''}
                            onChange={e => handleProductSelection(item.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800"
                          >
                            <option value="">-- Sin producto / Manual --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.productName} (Costo: {formatCurrency(p.defaultCost)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-xs text-slate-900 font-bold mb-1">
                            Costo de Producto ($):
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 font-bold">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.productCost === 0 ? '' : item.productCost}
                              onChange={e => handleProductCostChange(item.id, e.target.value)}
                              placeholder="20.00"
                              className="w-full pl-6 pr-3 py-1.5 bg-amber-50 border border-amber-300 rounded-md text-sm font-bold font-mono tabular-nums text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Resumen inmediato claro para ella */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                        <div>
                          Base a comisionar: <strong className="font-mono text-slate-900">{formatCurrency(item.netCommissionableBase)}</strong>
                          <span className="text-slate-400 ml-1">(${item.serviceAmount} - ${item.productCost})</span>
                        </div>
                        <div className="text-emerald-700 font-bold">
                          Comisión ({commissionPercentage}%): <span className="font-mono">{formatCurrency(commission)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuadro final claro */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Total a Cobrar:</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {formatCurrency(totalServiceAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
              <span>Costo de Producto Descontado:</span>
              <span className="font-mono text-amber-300">-{formatCurrency(totalProductCost)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-emerald-400 pt-1">
              <span>Le toca al Empleado ({commissionPercentage}%):</span>
              <span className="font-mono text-lg">{formatCurrency(totalCommissionEarned)}</span>
            </div>
          </div>

          {/* Botones de acción grandes y cómodos */}
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
