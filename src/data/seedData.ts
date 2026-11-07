import { Employee, ServiceCatalogItem, ProductCatalogItem, TransactionEntry } from '../types';
import { getTodayDateString } from '../utils/formatters';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    fullName: 'Valentina Morales',
    commissionPercentage: 50,
    weeklyCleaningCost: 25.00, // Costo de limpieza semanal
    isActive: true,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'emp-02',
    fullName: 'Carlos Mendoza',
    commissionPercentage: 50, // 50% comisión
    weeklyCleaningCost: 30.00, // Costo de limpieza semanal
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'emp-03',
    fullName: 'Sofía Benítez',
    commissionPercentage: 40,
    weeklyCleaningCost: 20.00, // Costo de limpieza semanal
    isActive: true,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'emp-04',
    fullName: 'Mateo Rivas',
    commissionPercentage: 45,
    weeklyCleaningCost: 20.00, // Costo de limpieza semanal
    isActive: true,
    createdAt: '2026-02-15T09:00:00Z',
  },
];

export const INITIAL_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'srv-01',
    serviceName: 'Corte y Peinado',
    defaultPrice: 40.00,
    category: 'Cabello',
  },
  {
    id: 'srv-02',
    serviceName: 'Tinte de Cabello',
    defaultPrice: 40.00, // Monto $40 del ejemplo
    category: 'Coloración',
  },
  {
    id: 'srv-03',
    serviceName: 'Balayage / Mechas',
    defaultPrice: 130.00,
    category: 'Coloración',
  },
  {
    id: 'srv-04',
    serviceName: 'Manicura Semipermanente',
    defaultPrice: 30.00,
    category: 'Uñas',
  },
  {
    id: 'srv-05',
    serviceName: 'Pedicura Spa',
    defaultPrice: 35.00,
    category: 'Uñas',
  },
  {
    id: 'srv-06',
    serviceName: 'Tratamiento de Keratina',
    defaultPrice: 100.00,
    category: 'Tratamientos',
  },
];

export const INITIAL_PRODUCTS: ProductCatalogItem[] = [
  {
    id: 'prod-01',
    productName: 'Tubo de Tinte',
    sku: 'TIN-01',
    defaultCost: 20.00, // Costo $20 del ejemplo
    category: 'Coloración',
  },
  {
    id: 'prod-02',
    productName: 'Polvo Decolorante + Peróxido',
    sku: 'DEC-01',
    defaultCost: 25.00,
    category: 'Coloración',
  },
  {
    id: 'prod-03',
    productName: 'Ampolleta Reparadora',
    sku: 'AMP-01',
    defaultCost: 15.00,
    category: 'Tratamientos',
  },
  {
    id: 'prod-04',
    productName: 'Dosis de Keratina',
    sku: 'KER-01',
    defaultCost: 25.00,
    category: 'Tratamientos',
  },
  {
    id: 'prod-05',
    productName: 'Base y Gel de Uñas',
    sku: 'GEL-01',
    defaultCost: 6.00,
    category: 'Uñas',
  },
];

export function getInitialTransactions(): TransactionEntry[] {
  const today = getTodayDateString();

  const getPastDate = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const yesterday = getPastDate(1);
  const twoDaysAgo = getPastDate(2);
  const threeDaysAgo = getPastDate(3);

  return [
    // Today
    // Ejemplo exacto del usuario: Tinte de cabello, monto $40, costo producto $20. Con comisión 50% = le toca $10
    {
      id: 'tx-1001',
      ticketNumber: 'TK-1001',
      employeeId: 'emp-02',
      employeeName: 'Carlos Mendoza',
      paymentMethod: 'tarjeta',
      services: [
        {
          id: 'item-1',
          serviceId: 'srv-02',
          serviceName: 'Tinte de Cabello',
          serviceAmount: 40.00,
          productId: 'prod-01',
          productName: 'Tubo de Tinte',
          productCost: 20.00,
          netCommissionableBase: 20.00, // $40 - $20 = $20
        },
      ],
      totalServiceAmount: 40.00,
      totalProductCost: 20.00,
      totalCommissionableBase: 20.00,
      totalCommissionEarned: 10.00, // 50% de $20 = $10 exactos
      totalTransactionAmount: 40.00,
      date: today,
      time: '09:30:00',
      createdAt: `${today}T09:30:00Z`,
    },
    {
      id: 'tx-1002',
      ticketNumber: 'TK-1002',
      employeeId: 'emp-01',
      employeeName: 'Valentina Morales',
      paymentMethod: 'efectivo',
      services: [
        {
          id: 'item-2',
          serviceId: 'srv-01',
          serviceName: 'Corte y Peinado',
          serviceAmount: 40.00,
          productCost: 0.00,
          netCommissionableBase: 40.00,
        },
      ],
      totalServiceAmount: 40.00,
      totalProductCost: 0.00,
      totalCommissionableBase: 40.00,
      totalCommissionEarned: 20.00, // 50% de $40 = $20
      totalTransactionAmount: 40.00,
      date: today,
      time: '11:00:00',
      createdAt: `${today}T11:00:00Z`,
    },
    {
      id: 'tx-1003',
      ticketNumber: 'TK-1003',
      employeeId: 'emp-03',
      employeeName: 'Sofía Benítez',
      paymentMethod: 'tarjeta',
      services: [
        {
          id: 'item-3',
          serviceId: 'srv-04',
          serviceName: 'Manicura Semipermanente',
          serviceAmount: 30.00,
          productId: 'prod-05',
          productName: 'Base y Gel de Uñas',
          productCost: 6.00,
          netCommissionableBase: 24.00, // $30 - $6 = $24
        },
      ],
      totalServiceAmount: 30.00,
      totalProductCost: 6.00,
      totalCommissionableBase: 24.00,
      totalCommissionEarned: 9.60, // 40% de $24 = $9.60
      totalTransactionAmount: 30.00,
      date: today,
      time: '12:45:00',
      createdAt: `${today}T12:45:00Z`,
    },
    {
      id: 'tx-1004',
      ticketNumber: 'TK-1004',
      employeeId: 'emp-01',
      employeeName: 'Valentina Morales',
      paymentMethod: 'transferencia',
      services: [
        {
          id: 'item-4',
          serviceId: 'srv-06',
          serviceName: 'Tratamiento de Keratina',
          serviceAmount: 100.00,
          productId: 'prod-04',
          productName: 'Dosis de Keratina',
          productCost: 25.00,
          netCommissionableBase: 75.00, // $100 - $25 = $75
        },
      ],
      totalServiceAmount: 100.00,
      totalProductCost: 25.00,
      totalCommissionableBase: 75.00,
      totalCommissionEarned: 37.50, // 50% de $75 = $37.50
      totalTransactionAmount: 100.00,
      date: today,
      time: '15:20:00',
      createdAt: `${today}T15:20:00Z`,
    },

    // Yesterday
    {
      id: 'tx-0995',
      ticketNumber: 'TK-0995',
      employeeId: 'emp-02',
      employeeName: 'Carlos Mendoza',
      paymentMethod: 'tarjeta',
      services: [
        {
          id: 'item-5',
          serviceId: 'srv-03',
          serviceName: 'Balayage / Mechas',
          serviceAmount: 130.00,
          productId: 'prod-02',
          productName: 'Polvo Decolorante + Peróxido',
          productCost: 25.00,
          netCommissionableBase: 105.00,
        },
      ],
      totalServiceAmount: 130.00,
      totalProductCost: 25.00,
      totalCommissionableBase: 105.00,
      totalCommissionEarned: 52.50, // 50% de $105 = $52.50
      totalTransactionAmount: 130.00,
      date: yesterday,
      time: '10:00:00',
      createdAt: `${yesterday}T10:00:00Z`,
    },
    {
      id: 'tx-0996',
      ticketNumber: 'TK-0996',
      employeeId: 'emp-04',
      employeeName: 'Mateo Rivas',
      paymentMethod: 'efectivo',
      services: [
        {
          id: 'item-6',
          serviceId: 'srv-01',
          serviceName: 'Corte y Peinado',
          serviceAmount: 35.00,
          productCost: 0.00,
          netCommissionableBase: 35.00,
        },
      ],
      totalServiceAmount: 35.00,
      totalProductCost: 0.00,
      totalCommissionableBase: 35.00,
      totalCommissionEarned: 15.75, // 45% de $35 = $15.75
      totalTransactionAmount: 35.00,
      date: yesterday,
      time: '14:00:00',
      createdAt: `${yesterday}T14:00:00Z`,
    },

    // 2 Days ago
    {
      id: 'tx-0990',
      ticketNumber: 'TK-0990',
      employeeId: 'emp-03',
      employeeName: 'Sofía Benítez',
      paymentMethod: 'efectivo',
      services: [
        {
          id: 'item-7',
          serviceId: 'srv-05',
          serviceName: 'Pedicura Spa',
          serviceAmount: 35.00,
          productCost: 0.00,
          netCommissionableBase: 35.00,
        },
      ],
      totalServiceAmount: 35.00,
      totalProductCost: 0.00,
      totalCommissionableBase: 35.00,
      totalCommissionEarned: 14.00, // 40% de $35 = $14
      totalTransactionAmount: 35.00,
      date: twoDaysAgo,
      time: '16:00:00',
      createdAt: `${twoDaysAgo}T16:00:00Z`,
    },

    // 3 Days ago
    {
      id: 'tx-0985',
      ticketNumber: 'TK-0985',
      employeeId: 'emp-02',
      employeeName: 'Carlos Mendoza',
      paymentMethod: 'tarjeta',
      services: [
        {
          id: 'item-8',
          serviceId: 'srv-02',
          serviceName: 'Tinte de Cabello',
          serviceAmount: 40.00,
          productId: 'prod-01',
          productName: 'Tubo de Tinte',
          productCost: 20.00,
          netCommissionableBase: 20.00,
        },
      ],
      totalServiceAmount: 40.00,
      totalProductCost: 20.00,
      totalCommissionableBase: 20.00,
      totalCommissionEarned: 10.00,
      totalTransactionAmount: 40.00,
      date: threeDaysAgo,
      time: '11:15:00',
      createdAt: `${threeDaysAgo}T11:15:00Z`,
    },
  ];
}
