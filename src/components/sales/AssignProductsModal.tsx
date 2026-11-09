import React, { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { TransactionEntry, TransactionServiceItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, FlaskConical, Check, ArrowRight, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  transaction: TransactionEntry | null;
  onClose: () => void;
  onSave: (updatedTicket: TransactionEntry) => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export const AssignProductsModal: React.FC<Props> = ({
  isOpen,
  transaction,
  onClose,
  onSave,
  onNext,
  hasNext = false,
}) => {
  const { products, employees } = useSalon();

  const [servicesData, setServicesData] = useState<TransactionServiceItem[]>([]);

  useEffect(() => {
    if (transaction) {
      setServicesData(
        transaction.services.map(s => ({
          ...s,
          productCost: s.productCost || 0,
          netCommissionableBase: Math.max(0, s.serviceAmount - (s.productCost || 0)),
        }))
      );
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const emp = employees.find(e => e.id === transaction.employeeId);
  const commissionPercentage = emp ? emp.commissionPercentage : 50;

  const handleProductSelection = (itemId: string, prodId: string) => {
    if (!prodId) {
      setServicesData(prev =>
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

    setServicesData(prev =>
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
    setServicesData(prev =>
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

  const totalServiceAmount = servicesData.reduce((acc, curr) => acc + (curr.serviceAmount || 0), 0);
  const totalProductCost = servicesData.reduce((acc, curr) => acc + (curr.productCost || 0), 0);
  const totalCommissionableBase = Math.max(0, totalServiceAmount - totalProductCost);
  const totalCommissionEarned = (totalCommissionableBase * commissionPercentage) / 100;
  const salonNetMargin = totalServiceAmount - totalCommissionEarned;

  const handleSaveData = (andNext = false) => {
    const updated: TransactionEntry = {
      ...transaction,
      services: servicesData,
      totalServiceAmount,
      totalProductCost,
      totalCommissionableBase,
      totalCommissionEarned,
      totalTransactionAmount: totalServiceAmount,
    };

    onSave(updated);

    if (andNext && onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden my-6">
        {/* Header para Doña Olga */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Gestión de Insumos (Cierre del Día)
              </h2>
              <p className="text-xs text-slate-600 font-mono">
                Ticket <strong className="text-slate-900">{transaction.ticketNumber}</strong> · {transaction.date} {transaction.time.substring(0, 5)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 text-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Ficha del Empleado */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Empleado responsable:</span>
              <div className="text-lg font-bold text-slate-900">{transaction.employeeName}</div>
            </div>
            <div className="text-sm font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              Comisión del empleado: <strong className="text-slate-900 font-mono">{commissionPercentage}%</strong>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Asigne o ajuste el gasto de insumos para cada servicio realizado en este ticket:
          </div>

          {/* Lista de Servicios para asignar gasto de insumos */}
          <div className="space-y-4">
            {servicesData.map((item, index) => {
              const itemBase = item.netCommissionableBase;
              const itemCommission = (itemBase * commissionPercentage) / 100;
              const itemSalonRetained = item.serviceAmount - itemCommission;

              return (
                <div
                  key={item.id || index}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-900">
                      {item.serviceName}
                    </span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      Cobrado: {formatCurrency(item.serviceAmount)}
                    </span>
                  </div>

                  {/* Espacio para seleccionar y editar costo de producto */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-xs text-slate-700 mb-1 font-semibold">
                        Producto o Insumo Usado:
                      </label>
                      <select
                        value={item.productId || ''}
                        onChange={e => handleProductSelection(item.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      >
                        <option value="">-- Sin insumo / Gasto Manual --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.productName} (Costo ref: {formatCurrency(p.defaultCost)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs text-amber-900 font-bold mb-1">
                        Costo Insumo ($ a descontar):
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-700 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.productCost === 0 ? '' : item.productCost}
                          onChange={e => handleProductCostChange(item.id, e.target.value)}
                          placeholder="20.00"
                          className="w-full pl-7 pr-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-base font-bold font-mono tabular-nums text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen por servicio con el ejemplo del tinte $40 - $20 = $20 -> 50% = $10 */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      Base a comisionar: <strong className="font-mono text-slate-900">{formatCurrency(itemBase)}</strong>
                      <span className="text-slate-400 ml-1">(${item.serviceAmount} - ${item.productCost || 0})</span>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      Le toca al empleado: <span className="font-mono">{formatCurrency(itemCommission)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cuadro Resumen Final del Ticket */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Total Cobrado al Cliente:</span>
              <span className="text-xl font-bold font-mono text-white">
                {formatCurrency(totalServiceAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2">
              <span className="text-amber-300 font-medium">Gasto Total de Insumos Descontado:</span>
              <span className="text-lg font-bold font-mono text-amber-300">
                -{formatCurrency(totalProductCost)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2 font-bold text-emerald-400">
              <span>Comisión Neta para {transaction.employeeName}:</span>
              <span className="text-xl font-mono">
                {formatCurrency(totalCommissionEarned)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>Margen retenido por el Salón:</span>
              <span className="font-mono text-slate-300 font-bold">{formatCurrency(salonNetMargin)}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors order-2 sm:order-1"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => handleSaveData(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Guardar Insumos</span>
            </button>

            {hasNext && onNext && (
              <button
                type="button"
                onClick={() => handleSaveData(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <span>Guardar y Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
