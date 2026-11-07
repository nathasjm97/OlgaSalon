import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { TransactionEntry } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { ReceiptModal } from './ReceiptModal';
import {
  Calendar,
  Search,
  Plus,
  Scissors,
  DollarSign,
  Eye,
  Trash2,
  Users,
  FlaskConical,
} from 'lucide-react';

export const DailySalesView: React.FC = () => {
  const { transactions, employees, openNewSaleModal, deleteTransaction, getDailySummary } = useSalon();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [viewingReceipt, setViewingReceipt] = useState<TransactionEntry | null>(null);

  const summary = getDailySummary(selectedDate);

  // Filtrado de transacciones
  const filteredTransactions = transactions.filter(tx => {
    const matchesDate = selectedDate === 'all' || tx.date === selectedDate;
    const matchesEmployee =
      selectedEmployeeFilter === 'all' || tx.employeeId === selectedEmployeeFilter;

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.ticketNumber.toLowerCase().includes(q) ||
      tx.employeeName.toLowerCase().includes(q) ||
      tx.services.some(s => s.serviceName.toLowerCase().includes(q));

    return matchesDate && matchesEmployee && matchesSearch;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Botón Principal y Título Claro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Registro Diario de Ventas
          </h1>
        </div>

        {/* Botón de Registrar Venta Principal */}
        <div className="flex items-center gap-3">
          <button
            onClick={openNewSaleModal}
            className="flex items-center gap-2.5 px-6 py-3 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>

      {/* Selector de Fecha y Tarjetas de Totales */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-bold text-slate-800">Fecha:</span>
            <input
              type="date"
              value={selectedDate === 'all' ? '' : selectedDate}
              onChange={e => setSelectedDate(e.target.value || 'all')}
              className="px-3 py-1.5 text-sm font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-sm font-semibold">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                selectedDate === todayStr ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy ({formatDate(todayStr)})
            </button>
            <button
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
                setSelectedDate(yStr);
              }}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            >
              Ayer
            </button>
            <button
              onClick={() => setSelectedDate('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDate === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todo el Historial
            </button>
          </div>
        </div>

        {/* Totales Resumidos Grandes y Fáciles de Leer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-sm font-semibold">Total Cobrado</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.totalTransactionsCount} tickets
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-sm font-semibold">Servicios</span>
              <Scissors className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalServicesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Trabajos realizados
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-sm font-semibold">Costo Insumos</span>
              <FlaskConical className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-800">
              -{formatCurrency(summary.totalProductCostConsumed)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Descontado de comisión
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-sm font-semibold">Comisiones a Pagar</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {formatCurrency(summary.totalCommissionsPayable)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Margen Salón: {formatCurrency(summary.salonNetMargin)}
            </div>
          </div>
        </div>

        {/* Desglose de Totales por Medio de Pago */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Total por Medio de Pago:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-emerald-800 font-bold mb-0.5">
                Efectivo en Caja
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-900">
                {formatCurrency(summary.paymentTotals?.efectivo || 0)}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-blue-800 font-bold mb-0.5">
                Tarjeta (Terminal)
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-blue-900">
                {formatCurrency(summary.paymentTotals?.tarjeta || 0)}
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="text-purple-800 font-bold mb-0.5">
                Transferencia
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-purple-900">
                {formatCurrency(summary.paymentTotals?.transferencia || 0)}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-700 font-bold mb-0.5">
                Otros Medios
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(summary.paymentTotals?.otro || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y Filtro por Empleado */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por empleado o servicio..."
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Empleado:</span>
          <select
            value={selectedEmployeeFilter}
            onChange={e => setSelectedEmployeeFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
          >
            <option value="all">Todos los Empleados</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Tickets Diarios */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Listado de Tickets</h2>
            <span className="text-sm text-slate-500 font-mono">
              ({filteredTransactions.length})
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <Scissors className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No hay servicios registrados</p>
            <button
              onClick={openNewSaleModal}
              className="mt-4 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Registrar Venta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Empleado</th>
                  <th className="py-3.5 px-4">Servicio & Insumos</th>
                  <th className="py-3.5 px-4 text-right">Monto ($)</th>
                  <th className="py-3.5 px-4 text-right">Costo Insumo ($)</th>
                  <th className="py-3.5 px-4 text-right">Base Neta ($)</th>
                  <th className="py-3.5 px-4 text-right bg-emerald-50/70 text-emerald-900">Comisión ($)</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-base">{tx.ticketNumber}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {tx.date} · {tx.time.substring(0, 5)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-base">{tx.employeeName}</div>
                      <span className="text-xs text-slate-400 capitalize">{tx.paymentMethod}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        {tx.services.map((s, idx) => (
                          <div key={idx} className="leading-tight">
                            <span className="font-semibold text-slate-900">{s.serviceName}</span>
                            {s.productCost > 0 && (
                              <div className="text-xs text-amber-700 pl-2">
                                - Insumo: {s.productName || 'Producto'} ({formatCurrency(s.productCost)})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 text-base whitespace-nowrap">
                      {formatCurrency(tx.totalServiceAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-amber-700 whitespace-nowrap">
                      {tx.totalProductCost > 0 ? `-${formatCurrency(tx.totalProductCost)}` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-slate-800 whitespace-nowrap">
                      {formatCurrency(tx.totalCommissionableBase)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-700 text-base whitespace-nowrap bg-emerald-50/70">
                      {formatCurrency(tx.totalCommissionEarned)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          title="Ver ticket de venta"
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el ticket ${tx.ticketNumber}?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          title="Eliminar registro"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        )}
      </div>

      {viewingReceipt && (
        <ReceiptModal
          transaction={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
