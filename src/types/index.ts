export interface Employee {
  id: string;
  fullName: string;
  commissionPercentage: number; // 0 - 100 (%)
  weeklyCleaningCost: number;   // Costo de Limpieza Semanal ($)
  isActive: boolean;
  createdAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  serviceName: string;
  defaultPrice: number;
  category: 'Cabello' | 'Coloración' | 'Uñas' | 'Tratamientos' | 'Otros';
}

export interface ProductCatalogItem {
  id: string;
  productName: string; // Insumo consumido (ej. Tubo de Tinte, Ampolleta, Keratina)
  sku: string;
  defaultCost: number; // Costo que se descuenta antes de comisionar (ej. $20)
  category: 'Coloración' | 'Tratamientos' | 'Uñas' | 'Otros';
}

export interface TransactionServiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceAmount: number;        // Monto cobrado por el servicio (ej. $40)
  productId?: string;
  productName?: string;
  productCost: number;           // Costo de producto consumido (ej. $20)
  netCommissionableBase: number; // Monto - Costo (ej. $20)
}

export interface TransactionEntry {
  id: string;
  ticketNumber: string;
  employeeId: string;           // Empleado que realizó el servicio (comisionista)
  employeeName: string;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
  services: TransactionServiceItem[];
  totalServiceAmount: number;
  totalProductCost: number;
  totalCommissionableBase: number;
  totalCommissionEarned: number;
  totalTransactionAmount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  notes?: string;
  createdAt: string;
}

export interface EmployeePerformanceSummary {
  employeeId: string;
  employeeName: string;
  commissionPercentage: number;
  weeklyCleaningCostRate: number; // Costo semanal fijo
  weeksCount: number;             // Cantidad de semanas trabajadas
  totalTicketsCount: number;
  totalServicesRendered: number;
  totalServiceRevenue: number;
  totalProductCostDeducted: number;
  totalCommissionableBase: number;
  calculatedCommission: number;
  totalCleaningDeduction: number; // weeksCount * weeklyCleaningCostRate
  netEarnings: number;            // calculatedCommission - totalCleaningDeduction
  salonRetainedRevenue: number;
}

export interface PaymentMethodTotals {
  tarjeta: number;
  efectivo: number;
  transferencia: number;
  otro: number;
}

export interface DailyFinancialSummary {
  date: string;
  totalRevenue: number;
  totalServicesCount: number;
  totalServiceAmount: number;
  totalProductCostConsumed: number;
  totalCommissionableBase: number;
  totalTransactionsCount: number;
  totalCommissionsPayable: number;
  salonNetMargin: number;
  paymentTotals: PaymentMethodTotals; // Totales desglosados por medio de pago
}

export type UserRole = 'ADMIN' | 'CASHIER';

export interface AuthSession {
  username: string;
  role: UserRole;
}

export type ActiveTab = 'ventas' | 'reportes' | 'empleados' | 'catalogos';
