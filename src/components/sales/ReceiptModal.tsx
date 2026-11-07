import React from 'react';
import { TransactionEntry } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { X, Printer } from 'lucide-react';

interface Props {
  transaction: TransactionEntry | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-100 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase">
            Comprobante de Servicio
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 bg-white font-mono text-slate-900 text-xs space-y-3">
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h3 className="font-bold text-base tracking-wider uppercase">OLGA SALON GLOW</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ticket: {transaction.ticketNumber}</p>
          </div>

          <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha:</span>
              <span>{formatDate(transaction.date)} {transaction.time.substring(0, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Empleado:</span>
              <span className="font-bold text-slate-900">{transaction.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pago:</span>
              <span className="capitalize">{transaction.paymentMethod}</span>
            </div>
          </div>

          <div className="space-y-1.5 py-1">
            {transaction.services.map((srv, idx) => (
              <div key={srv.id || idx} className="text-xs">
                <div className="flex justify-between font-semibold">
                  <span>{srv.serviceName}</span>
                  <span className="tabular-nums">{formatCurrency(srv.serviceAmount)}</span>
                </div>
                {srv.productCost > 0 && (
                  <div className="flex justify-between text-[11px] text-amber-700 pl-2">
                    <span>- Costo Insumo:</span>
                    <span className="tabular-nums">-{formatCurrency(srv.productCost)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
            <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-1">
              <span>TOTAL:</span>
              <span className="tabular-nums">{formatCurrency(transaction.totalTransactionAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold pt-1">
              <span>Comisión Empleado:</span>
              <span className="tabular-nums">{formatCurrency(transaction.totalCommissionEarned)}</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-dashed border-slate-200">
            Olga Salon Glow
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
