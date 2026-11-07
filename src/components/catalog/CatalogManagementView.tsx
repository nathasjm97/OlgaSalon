import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { ServiceCatalogItem, ProductCatalogItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ServiceModal } from './ServiceModal';
import { ProductModal } from './ProductModal';
import {
  Scissors,
  Plus,
  Search,
  Edit2,
  Trash2,
  FlaskConical,
} from 'lucide-react';

export const CatalogManagementView: React.FC = () => {
  const {
    services,
    products,
    addService,
    updateService,
    deleteService,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useSalon();

  const [catalogSubTab, setCatalogSubTab] = useState<'services' | 'products'>('services');
  const [searchTerm, setSearchTerm] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceCatalogItem | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductCatalogItem | null>(null);

  const filteredServices = services.filter(srv => {
    const q = searchTerm.toLowerCase().trim();
    return !q || srv.serviceName.toLowerCase().includes(q);
  });

  const filteredProducts = products.filter(prod => {
    const q = searchTerm.toLowerCase().trim();
    return !q || prod.productName.toLowerCase().includes(q);
  });

  const handleOpenNewService = () => {
    setServiceToEdit(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceCatalogItem) => {
    setServiceToEdit(srv);
    setIsServiceModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductCatalogItem) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Precios e Insumos
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {catalogSubTab === 'services' ? (
            <button
              onClick={handleOpenNewService}
              className="flex items-center gap-2 px-6 py-3 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Nuevo Servicio</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewProduct}
              className="flex items-center gap-2 px-6 py-3 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestaña */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-1">
        <button
          onClick={() => setCatalogSubTab('services')}
          className={`flex items-center gap-2 pb-3 text-base font-bold transition-colors border-b-2 ${
            catalogSubTab === 'services'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Scissors className="w-5 h-5" />
          Servicios ({services.length})
        </button>

        <button
          onClick={() => setCatalogSubTab('products')}
          className={`flex items-center gap-2 pb-3 text-base font-bold transition-colors border-b-2 ${
            catalogSubTab === 'products'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-5 h-5" />
          Insumos de Consumo ({products.length})
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={
            catalogSubTab === 'services'
              ? 'Buscar servicio...'
              : 'Buscar insumo...'
          }
          className="w-full text-base bg-transparent focus:outline-none text-slate-900 font-medium"
        />
      </div>

      {/* Tabla de Servicios */}
      {catalogSubTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                  <th className="py-4 px-6">Servicio</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6 text-right">Precio ($)</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map(srv => (
                  <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-base">{srv.serviceName}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">
                      {srv.category}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-slate-900 text-base">
                      {formatCurrency(srv.defaultPrice)}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${srv.serviceName}"?`)) {
                              deleteService(srv.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
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
        </div>
      )}

      {/* Tabla de Insumos */}
      {catalogSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                  <th className="py-4 px-6">Insumo / Producto</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6 text-right">Costo Consumo ($)</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-base">{prod.productName}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">
                      {prod.category}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-amber-800 text-base">
                      {formatCurrency(prod.defaultCost)}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${prod.productName}"?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
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
        </div>
      )}

      <ServiceModal
        isOpen={isServiceModalOpen}
        serviceToEdit={serviceToEdit}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={addService}
        onUpdate={updateService}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => setIsProductModalOpen(false)}
        onSave={addProduct}
        onUpdate={updateProduct}
      />
    </div>
  );
};
