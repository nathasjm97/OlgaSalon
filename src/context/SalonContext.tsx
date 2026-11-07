import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Employee,
  ServiceCatalogItem,
  ProductCatalogItem,
  TransactionEntry,
  EmployeePerformanceSummary,
  DailyFinancialSummary,
  ActiveTab,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  getInitialTransactions,
} from '../data/seedData';
import { getTodayDateString } from '../utils/formatters';
import { fetchServerData, saveServerData } from '../services/api';

interface SalonContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  employees: Employee[];
  services: ServiceCatalogItem[];
  products: ProductCatalogItem[];
  transactions: TransactionEntry[];

  // Employee CRUD
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => { success: boolean; message?: string };

  // Services Catalog CRUD
  addService: (srv: Omit<ServiceCatalogItem, 'id'>) => void;
  updateService: (id: string, srv: Partial<ServiceCatalogItem>) => void;
  deleteService: (id: string) => void;

  // Products / Insumos Catalog CRUD
  addProduct: (prod: Omit<ProductCatalogItem, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<ProductCatalogItem>) => void;
  deleteProduct: (id: string) => void;

  // Transactions CRUD
  addTransaction: (tx: Omit<TransactionEntry, 'id' | 'ticketNumber' | 'createdAt'>) => TransactionEntry;
  updateTransaction: (id: string, tx: Partial<TransactionEntry>) => void;
  deleteTransaction: (id: string) => void;

  // Reporting & Computations
  getDailySummary: (date?: string) => DailyFinancialSummary;
  getEmployeePerformance: (startDate: string, endDate: string) => EmployeePerformanceSummary[];

  // Quick Action
  openNewSaleModal: () => void;
  isNewSaleModalOpen: boolean;
  setIsNewSaleModalOpen: (open: boolean) => void;

  resetToDemoData: () => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES: 'olga_salon_employees_v3',
  SERVICES: 'olga_salon_services_v3',
  PRODUCTS: 'olga_salon_products_v3',
  TRANSACTIONS: 'olga_salon_transactions_v3',
};

// Helper to determine year-week string (e.g., '2026-W45')
function getYearWeekKey(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    const target = new Date(d.valueOf());
    const dayNr = (d.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ventas');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [services, setServices] = useState<ServiceCatalogItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return stored ? JSON.parse(stored) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [products, setProducts] = useState<ProductCatalogItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<TransactionEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  });

  // Initial fetch from server to support multi-device persistence
  useEffect(() => {
    let isMounted = true;
    async function initSync() {
      const serverData = await fetchServerData();
      if (!isMounted) return;
      if (serverData) {
        if (serverData.employees?.length) setEmployees(serverData.employees);
        if (serverData.services?.length) setServices(serverData.services);
        if (serverData.products?.length) setProducts(serverData.products);
        if (serverData.transactions?.length) setTransactions(serverData.transactions);
      } else {
        // Seed server with current local state if server has no file yet
        saveServerData({
          employees,
          services,
          products,
          transactions,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    initSync();

    // Auto-refresh when tab gains focus so other devices' sales reflect immediately
    const handleFocus = async () => {
      const serverData = await fetchServerData();
      if (!isMounted || !serverData) return;
      if (serverData.transactions && serverData.transactions.length !== transactions.length) {
        setTransactions(serverData.transactions);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save changes to localStorage and send update to server
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

      // Push to server database for cross-device synchronization
      saveServerData({
        employees,
        services,
        products,
        transactions,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error saving salon data:', e);
    }
  }, [employees, services, products, transactions]);

  // Employee CRUD
  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees(prev => [newEmp, ...prev]);
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, ...empData } : emp))
    );
  };

  const deleteEmployee = (id: string): { success: boolean; message?: string } => {
    const hasTransactions = transactions.some(t => t.employeeId === id);
    if (hasTransactions) {
      setEmployees(prev =>
        prev.map(emp => (emp.id === id ? { ...emp, isActive: false } : emp))
      );
      return {
        success: true,
        message: 'El empleado tiene historial de servicios. Se marcó como Inactivo para cuidar los números contables.',
      };
    }
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    return { success: true };
  };

  // Services Catalog CRUD
  const addService = (srvData: Omit<ServiceCatalogItem, 'id'>) => {
    const newSrv: ServiceCatalogItem = {
      ...srvData,
      id: `srv-${Date.now()}`,
    };
    setServices(prev => [...prev, newSrv]);
  };

  const updateService = (id: string, srvData: Partial<ServiceCatalogItem>) => {
    setServices(prev =>
      prev.map(srv => (srv.id === id ? { ...srv, ...srvData } : srv))
    );
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(srv => srv.id !== id));
  };

  // Products / Insumos Catalog CRUD
  const addProduct = (prodData: Omit<ProductCatalogItem, 'id'>) => {
    const newProd: ProductCatalogItem = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProd]);
  };

  const updateProduct = (id: string, prodData: Partial<ProductCatalogItem>) => {
    setProducts(prev =>
      prev.map(prod => (prod.id === id ? { ...prod, ...prodData } : prod))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  };

  // Transaction CRUD
  const addTransaction = (txData: Omit<TransactionEntry, 'id' | 'ticketNumber' | 'createdAt'>): TransactionEntry => {
    const nextTicketNum = `TK-${1000 + transactions.length + 1}`;

    const newTx: TransactionEntry = {
      ...txData,
      id: `tx-${Date.now()}`,
      ticketNumber: nextTicketNum,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    return newTx;
  };

  const updateTransaction = (id: string, txData: Partial<TransactionEntry>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...txData } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Daily Financial Summary
  const getDailySummary = (targetDate?: string): DailyFinancialSummary => {
    const date = targetDate || getTodayDateString();
    const dayTransactions = transactions.filter(t => t.date === date);

    let totalServiceAmount = 0;
    let totalProductCostConsumed = 0;
    let totalCommissionableBase = 0;
    let totalServicesCount = 0;
    let totalCommissionsPayable = 0;

    const paymentTotals = {
      tarjeta: 0,
      efectivo: 0,
      transferencia: 0,
      otro: 0,
    };

    dayTransactions.forEach(tx => {
      totalServiceAmount += tx.totalServiceAmount;
      totalProductCostConsumed += tx.totalProductCost;
      totalCommissionableBase += tx.totalCommissionableBase;
      totalServicesCount += tx.services.length;
      totalCommissionsPayable += tx.totalCommissionEarned;

      if (tx.paymentMethod in paymentTotals) {
        paymentTotals[tx.paymentMethod] += tx.totalTransactionAmount;
      } else {
        paymentTotals.otro += tx.totalTransactionAmount;
      }
    });

    const totalRevenue = totalServiceAmount;
    const salonNetMargin = totalRevenue - totalCommissionsPayable;

    return {
      date,
      totalRevenue,
      totalServicesCount,
      totalServiceAmount,
      totalProductCostConsumed,
      totalCommissionableBase,
      totalTransactionsCount: dayTransactions.length,
      totalCommissionsPayable,
      salonNetMargin,
      paymentTotals,
    };
  };

  // Employee Performance Report over date range
  // NOTE: Weekly Cleaning Cost is deducted per active week in range
  const getEmployeePerformance = (startDate: string, endDate: string): EmployeePerformanceSummary[] => {
    const filteredTx = transactions.filter(t => {
      return t.date >= startDate && t.date <= endDate;
    });

    return employees.map(emp => {
      const empTickets = filteredTx.filter(t => t.employeeId === emp.id);

      // Count unique weeks worked by this employee in the range
      const uniqueWeeks = new Set(empTickets.map(t => getYearWeekKey(t.date)));
      const weeksCount = uniqueWeeks.size;

      let totalServiceRevenue = 0;
      let totalProductCostDeducted = 0;
      let totalServicesRendered = 0;
      let calculatedCommission = 0;

      empTickets.forEach(ticket => {
        totalServiceRevenue += ticket.totalServiceAmount;
        totalProductCostDeducted += ticket.totalProductCost;
        totalServicesRendered += ticket.services.length;
        calculatedCommission += ticket.totalCommissionEarned;
      });

      const totalCommissionableBase = Math.max(0, totalServiceRevenue - totalProductCostDeducted);

      // Weekly cleaning cost deduction: weeksCount * emp.weeklyCleaningCost
      const totalCleaningDeduction = weeksCount * emp.weeklyCleaningCost;

      // Net earnings = calculatedCommission - totalCleaningDeduction
      const netEarnings = Math.max(0, calculatedCommission - totalCleaningDeduction);

      // Salon retained = Total Service Revenue - Net Earnings
      const salonRetainedRevenue = totalServiceRevenue - netEarnings;

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        commissionPercentage: emp.commissionPercentage,
        weeklyCleaningCostRate: emp.weeklyCleaningCost,
        weeksCount,
        totalTicketsCount: empTickets.length,
        totalServicesRendered,
        totalServiceRevenue,
        totalProductCostDeducted,
        totalCommissionableBase,
        calculatedCommission,
        totalCleaningDeduction,
        netEarnings,
        salonRetainedRevenue,
      };
    });
  };

  const openNewSaleModal = () => setIsNewSaleModalOpen(true);

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    setEmployees(INITIAL_EMPLOYEES);
    setServices(INITIAL_SERVICES);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(getInitialTransactions());
  };

  return (
    <SalonContext.Provider
      value={{
        activeTab,
        setActiveTab,
        employees,
        services,
        products,
        transactions,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addService,
        updateService,
        deleteService,
        addProduct,
        updateProduct,
        deleteProduct,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getDailySummary,
        getEmployeePerformance,
        openNewSaleModal,
        isNewSaleModalOpen,
        setIsNewSaleModalOpen,
        resetToDemoData,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
