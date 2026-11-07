import React, { useState, useEffect } from 'react';
import { ProductCatalogItem } from '../../types';
import { X, FlaskConical, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  productToEdit: ProductCatalogItem | null;
  onClose: () => void;
  onSave: (data: Omit<ProductCatalogItem, 'id'>) => void;
  onUpdate: (id: string, data: Partial<ProductCatalogItem>) => void;
}

export const ProductModal: React.FC<Props> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [defaultCost, setDefaultCost] = useState<number>(20);
  const [category, setCategory] = useState<ProductCatalogItem['category']>('Coloración');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setProductName(productToEdit.productName);
      setSku(productToEdit.sku);
      setDefaultCost(productToEdit.defaultCost);
      setCategory(productToEdit.category);
    } else {
      setProductName('');
      setSku(`INS-${Math.floor(100 + Math.random() * 900)}`);
      setDefaultCost(20);
      setCategory('Coloración');
    }
    setErrorMessage('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMessage('Escriba el nombre del producto o insumo.');
      return;
    }
    if (defaultCost < 0) {
      setErrorMessage('El costo debe ser mayor o igual a 0.');
      return;
    }

    const payload = {
      productName: productName.trim(),
      sku: sku.trim().toUpperCase() || 'INS-01',
      defaultCost: Number(defaultCost),
      category,
    };

    if (productToEdit) {
      onUpdate(productToEdit.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-900">
              {productToEdit ? 'Editar Insumo' : 'Nuevo Insumo de Consumo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-sm text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Nombre del Insumo / Producto:
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Ej. Tubo de Tinte, Dosis de Keratina, Ampolleta"
              className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Costo del Insumo ($):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={defaultCost}
                  onChange={e => setDefaultCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">
                Categoría:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="Coloración">Coloración</option>
                <option value="Tratamientos">Tratamientos</option>
                <option value="Uñas">Uñas</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
            >
              Guardar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
