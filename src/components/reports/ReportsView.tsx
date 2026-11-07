import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { TransactionEntry } from '../../types';
import {
  formatCurrency,
  formatDate,
  getTodayDateString,
  getDefaultTuesdayToSundayRange,
} from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Scissors,
  Eye,
  FlaskConical,
  Calendar,
} from 'lucide-react';
import { ReceiptModal } from '../sales/ReceiptModal';

export const ReportsView: React.FC = () => {
  const { transactions, employees, getDailySummary, getEmployeePerformance } = useSalon();

  const todayStr = getTodayDateString();

  // Rango por defecto del martes anterior al domingo (semana operativa del salón)
  const defaultRange = useMemo(() => getDefaultTuesdayToSundayRange(), []);

  const [rangePreset, setRangePreset] = useState<'operativa' | 'today' | 'month' | 'custom'>('operativa');
  const [startDate, setStartDate] = useState<string>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<string>(defaultRange.endDate);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<TransactionEntry | null>(null);

  const applyPreset = (preset: 'operativa' | 'today' | 'month') => {
    setRangePreset(preset);
    if (preset === 'operativa') {
      const r = getDefaultTuesdayToSundayRange();
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      setStartDate(firstDay);
      setEndDate(todayStr);
    }
  };

  const todaySummary = getDailySummary(todayStr);

  const performanceData = useMemo(() => {
    return getEmployeePerformance(startDate, endDate);
  }, [startDate, endDate, employees, transactions]);

  const periodTotals = useMemo(() => {
    return performanceData.reduce(
      (acc, curr) => ({
        totalServices: acc.totalServices + curr.totalServicesRendered,
        totalServiceRevenue: acc.totalServiceRevenue + curr.totalServiceRevenue,
        totalProductCost: acc.totalProductCost + curr.totalProductCostDeducted,
        totalCommissionableBase: acc.totalCommissionableBase + curr.totalCommissionableBase,
        totalCommissions: acc.totalCommissions + curr.calculatedCommission,
        totalCleaningDeductions: acc.totalCleaningDeductions + curr.totalCleaningDeduction,
        totalNetEarnings: acc.totalNetEarnings + curr.netEarnings,
        totalSalonMargin: acc.totalSalonMargin + curr.salonRetainedRevenue,
      }),
      {
        totalServices: 0,
        totalServiceRevenue: 0,
        totalProductCost: 0,
        totalCommissionableBase: 0,
        totalCommissions: 0,
        totalCleaningDeductions: 0,
        totalNetEarnings: 0,
        totalSalonMargin: 0,
      }
    );
  }, [performanceData]);

  const employeeDrilldownTickets = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return transactions.filter(
      t => t.employeeId === selectedEmployeeId && t.date >= startDate && t.date <= endDate
    );
  }, [selectedEmployeeId, startDate, endDate, transactions]);

  const selectedEmployeeObject = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="space-y-8 pt-2">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Reportes & Ganancias
        </h1>
      </div>

      {/* Resumen del Día de Hoy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-900">
            Corte de Hoy ({formatDate(todayStr)})
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase text-slate-500">Cobrado Hoy</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatCurrency(todaySummary.totalRevenue)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase text-slate-500">Servicios Realizados</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {todaySummary.totalServicesCount}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase text-slate-500">Insumos Consumidos</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-1">
              -{formatCurrency(todaySummary.totalProductCostConsumed)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase text-slate-500">Ganancia del Salón</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
              {formatCurrency(todaySummary.salonNetMargin)}
            </div>
          </div>
        </div>
      </div>

      {/* Reporte por Periodo y Liquidación de Empleados */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Liquidación de Empleados por Periodo
            </h2>
          </div>

          {/* Selector de Fechas (Por defecto Martes a Domingo) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl text-sm font-semibold">
              <button
                onClick={() => applyPreset('operativa')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'operativa' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semana Operativa (Mar - Dom)
              </button>
              <button
                onClick={() => applyPreset('today')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'today' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => applyPreset('month')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                  rangePreset === 'month' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Este Mes
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-sm font-mono">
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setRangePreset('custom');
                }}
                className="bg-transparent text-slate-900 focus:outline-none font-semibold"
              />
              <span className="text-slate-400 font-sans">al</span>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  setRangePreset('custom');
                }}
                className="bg-transparent text-slate-900 focus:outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Resumen del Periodo */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Total Facturado</span>
              <span className="text-xl font-bold font-mono text-white">
                {formatCurrency(periodTotals.totalServiceRevenue)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">Costo Insumos</span>
              <span className="text-xl font-bold font-mono text-amber-300">
                -{formatCurrency(periodTotals.totalProductCost)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">Deducción Limpieza</span>
              <span className="text-xl font-bold font-mono text-red-400">
                -{formatCurrency(periodTotals.totalCleaningDeductions)}
              </span>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <span className="text-emerald-400 block text-xs font-bold uppercase">
                Total a Pagar a Empleados
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {formatCurrency(periodTotals.totalNetEarnings)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de Rendimiento por Empleado con Limpieza Semanal */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                  <th className="py-4 px-4">Empleado</th>
                  <th className="py-4 px-3 text-center">Semanas</th>
                  <th className="py-4 px-3 text-center">Trabajos</th>
                  <th className="py-4 px-4 text-right">Facturado ($)</th>
                  <th className="py-4 px-4 text-right">Insumos ($)</th>
                  <th className="py-4 px-4 text-right">Base Neta ($)</th>
                  <th className="py-4 px-3 text-center">% Com.</th>
                  <th className="py-4 px-4 text-right">Comisión ($)</th>
                  <th className="py-4 px-4 text-right">Limpieza Semanal ($)</th>
                  <th className="py-4 px-4 text-right bg-emerald-50 text-emerald-900 font-bold">Pago Neto ($)</th>
                  <th className="py-4 px-3 text-center">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceData.map(row => (
                  <tr key={row.employeeId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-base">{row.employeeName}</div>
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap font-mono">
                      {row.weeksCount} sem.
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-900">
                      {row.totalServicesRendered}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                      {formatCurrency(row.totalServiceRevenue)}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-semibold text-amber-700">
                      {row.totalProductCostDeducted > 0 ? `-${formatCurrency(row.totalProductCostDeducted)}` : '-'}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                      {formatCurrency(row.totalCommissionableBase)}
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {row.commissionPercentage}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-800">
                      {formatCurrency(row.calculatedCommission)}
                    </td>

                    {/* Deducción de Limpieza Semanal */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-red-600 font-semibold">
                      {row.totalCleaningDeduction > 0 ? (
                        <>
                          -{formatCurrency(row.totalCleaningDeduction)}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            ({row.weeksCount} sem. × {formatCurrency(row.weeklyCleaningCostRate)})
                          </span>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Pago Neto */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-emerald-700 text-base bg-emerald-50">
                      {formatCurrency(row.netEarnings)}
                    </td>

                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEmployeeId(row.employeeId)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Ver detalle de trabajos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Desglose por Empleado */}
      {selectedEmployeeId && selectedEmployeeObject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Trabajos de {selectedEmployeeObject.fullName}
              </h3>
              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {employeeDrilldownTickets.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No hay tickets registrados en este periodo.
                </div>
              ) : (
                employeeDrilldownTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{ticket.ticketNumber}</span>
                      <span className="font-mono text-slate-500 text-xs">
                        {ticket.date} · {ticket.time.substring(0, 5)}
                      </span>
                    </div>

                    <div className="space-y-1 pl-2 border-l-2 border-slate-300">
                      {ticket.services.map((srv, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{srv.serviceName}</span>
                          <span className="font-mono font-bold">{formatCurrency(srv.serviceAmount)}</span>
                        </div>
                      ))}
                      {ticket.totalProductCost > 0 && (
                        <div className="flex justify-between text-amber-700 text-xs font-semibold">
                          <span>- Insumo consumido:</span>
                          <span className="font-mono">-{formatCurrency(ticket.totalProductCost)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                      <span className="text-emerald-700">
                        Comisión: {formatCurrency(ticket.totalCommissionEarned)}
                      </span>
                      <button
                        onClick={() => setViewingReceipt(ticket)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 underline"
                      >
                        Ver Ticket
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <ReceiptModal
          transaction={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
