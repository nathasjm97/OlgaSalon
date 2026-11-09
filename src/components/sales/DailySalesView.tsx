import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { TransactionEntry, AuthSession } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { ReceiptModal } from './ReceiptModal';
import { AssignProductsModal } from './AssignProductsModal';
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
  Sparkles,
} from 'lucide-react';

interface Props {
  session?: AuthSession;
}

export const DailySalesView: React.FC<Props> = ({ session }) => {
  const { transactions, employees, openNewSaleModal, deleteTransaction, updateTransaction, getDailySummary } = useSalon();

  const isAdmin = session?.role === 'ADMIN';

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [viewingReceipt, setViewingReceipt] = useState<TransactionEntry | null>(null);

  // Estado para la gestión de insumos de la dueña (ir registro por registro)
  const [assigningTicketIndex, setAssigningTicketIndex] = useState<number | null>(null);

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

  // Tickets de hoy o del filtro que tienen insumos pendientes de asignar ($0)
  const ticketsWithZeroProducts = filteredTransactions.filter(t => t.totalProductCost === 0);

  const handleOpenAssignModal = (tx: TransactionEntry) => {
    const idx = filteredTransactions.findIndex(t => t.id === tx.id);
    setAssigningTicketIndex(idx !== -1 ? idx : 0);
  };

  const handleSaveAssignedTicket = (updatedTx: TransactionEntry) => {
    updateTransaction(updatedTx.id, updatedTx);
  };

  const handleNextAssignedTicket = () => {
    if (assigningTicketIndex !== null && assigningTicketIndex < filteredTransactions.length - 1) {
      setAssigningTicketIndex(assigningTicketIndex + 1);
    } else {
      setAssigningTicketIndex(null);
    }
  };

  const currentAssigningTicket =
    assigningTicketIndex !== null && assigningTicketIndex >= 0 && assigningTicketIndex < filteredTransactions.length
      ? filteredTransactions[assigningTicketIndex]
      : null;

  return (
    <div className="space-y-6 pt-2">
      {/* Botón Principal y Título Claro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Registro Diario de Ventas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Gestión completa de ventas, gastos de insumos y comisiones' : 'Registro de servicios cobrados del día'}
          </p>
        </div>

        {/* Botón de Registrar Venta Principal */}
        <div className="flex items-center gap-3">
          <button
            onClick={openNewSaleModal}
            className="flex items-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
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

        {/* Totales Resumidos: Si es CAJA solo ve cobrado y servicios; si es OLGA ve todo */}
        {isAdmin ? (
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
                <span className="text-sm font-semibold">Gasto Insumos</span>
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
        ) : (
          /* Vista limpia para CAJA: Solo Total Cobrado y Cantidad de Servicios */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-sm font-semibold">Total Cobrado</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {summary.totalTransactionsCount} tickets registrados
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-sm font-semibold">Servicios Realizados</span>
                <Scissors className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                {summary.totalServicesCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Trabajos registrados en caja
              </div>
            </div>
          </div>
        )}

        {/* Desglose de Totales por Medio de Pago (Para cuadre de caja) */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Total por Medio de Pago (Cuadre de Caja):
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

      {/* Banner de Cierre del Día exclusivo para Doña Olga (Gestión de Insumos) */}
      {isAdmin && filteredTransactions.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-200/70 border border-amber-400/50 text-amber-900 rounded-xl shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Cierre del Día: Gestión de Insumos por Ticket
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/90 mt-0.5 max-w-2xl">
                Al finalizar el día, revise los registros uno a uno para registrar el gasto de tinte, ampolletas o decolorantes. El sistema descontará el producto y calculará la comisión exacta del empleado.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                if (filteredTransactions.length > 0) {
                  setAssigningTicketIndex(0);
                }
              }}
              className="px-5 py-3 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Revisar Insumos ({filteredTransactions.length} tickets)</span>
            </button>
          </div>
        </div>
      )}

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
            <p className="text-base font-semibold text-slate-700">No hay servicios registrados en esta fecha</p>
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
                  <th className="py-3.5 px-4">Servicios</th>
                  <th className="py-3.5 px-4 text-right">Monto Cobrado ($)</th>
                  {/* Columnas financieras exclusivas para la dueña (OLGA) */}
                  {isAdmin && (
                    <>
                      <th className="py-3.5 px-4 text-right">Insumos ($)</th>
                      <th className="py-3.5 px-4 text-right">Base Neta ($)</th>
                      <th className="py-3.5 px-4 text-right bg-emerald-50/70 text-emerald-900">Comisión ($)</th>
                    </>
                  )}
                  {!isAdmin && <th className="py-3.5 px-4">Forma de Pago</th>}
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    {/* Ticket */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-base">{tx.ticketNumber}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {tx.date} · {tx.time.substring(0, 5)}
                      </div>
                    </td>

                    {/* Empleado */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-base">{tx.employeeName}</div>
                      {isAdmin && (
                        <span className="text-xs text-slate-400 capitalize">{tx.paymentMethod}</span>
                      )}
                    </td>

                    {/* Servicios Realizados */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        {tx.services.map((s, idx) => (
                          <div key={idx} className="leading-tight">
                            <span className="font-semibold text-slate-900">{s.serviceName}</span>
                            {isAdmin && s.productCost > 0 && (
                              <div className="text-xs text-amber-700 pl-1 font-medium">
                                - Insumo: {s.productName || 'Producto'} ({formatCurrency(s.productCost)})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Monto Cobrado al Cliente */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 text-base whitespace-nowrap">
                      {formatCurrency(tx.totalServiceAmount)}
                    </td>

                    {/* Columnas financieras para la Dueña (OLGA) */}
                    {isAdmin && (
                      <>
                        {/* Gasto de Insumos con botón directo para editar */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {tx.totalProductCost > 0 ? (
                            <button
                              onClick={() => handleOpenAssignModal(tx)}
                              className="font-mono font-bold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200 px-2 py-1 rounded-md text-sm transition-colors"
                              title="Modificar gasto de insumos"
                            >
                              -{formatCurrency(tx.totalProductCost)} ✏️
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignModal(tx)}
                              className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-md transition-colors"
                              title="Registrar gasto de insumos para este ticket"
                            >
                              + Asignar Insumo
                            </button>
                          )}
                        </td>

                        {/* Base Neta */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-slate-800 whitespace-nowrap">
                          {formatCurrency(tx.totalCommissionableBase)}
                        </td>

                        {/* Comisión Empleado */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-700 text-base whitespace-nowrap bg-emerald-50/70">
                          {formatCurrency(tx.totalCommissionEarned)}
                        </td>
                      </>
                    )}

                    {/* Forma de Pago visible para Caja */}
                    {!isAdmin && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 capitalize bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                          {tx.paymentMethod}
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Botón de Asignar Insumos para la dueña */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenAssignModal(tx)}
                            title="Gestionar insumos y gasto del ticket"
                            className="p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <FlaskConical className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ver Ticket / Comprobante */}
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          title="Ver comprobante de venta"
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Eliminar (solo para la dueña) */}
                        {isAdmin && (
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Comprobante / Ticket */}
      {viewingReceipt && (
        <ReceiptModal
          transaction={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          isAdmin={isAdmin}
        />
      )}

      {/* Modal de Asignación de Insumos para la Dueña (Olga) */}
      {isAdmin && currentAssigningTicket && (
        <AssignProductsModal
          isOpen={true}
          transaction={currentAssigningTicket}
          onClose={() => setAssigningTicketIndex(null)}
          onSave={handleSaveAssignedTicket}
          onNext={handleNextAssignedTicket}
          hasNext={assigningTicketIndex !== null && assigningTicketIndex < filteredTransactions.length - 1}
        />
      )}
    </div>
  );
};
