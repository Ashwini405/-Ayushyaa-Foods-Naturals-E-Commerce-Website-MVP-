import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { ProductWithVariants } from '../lib/supabase';
import { addToCart } from '../lib/cart';

interface ProductModalProps {
  product: ProductWithVariants;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      product,
      variant: selectedVariant,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <div className="mb-4">
            <span className="inline-block bg-[#9FC98D] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {product.category.name}
            </span>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Size/Weight
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedVariant.id === variant.id
                      ? 'border-[#9FC98D] bg-[#9FC98D] bg-opacity-10'
                      : 'border-gray-200 hover:border-[#9FC98D]'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{variant.weight}</div>
                  <div className="text-lg font-bold text-[#9FC98D]">₹{variant.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#9FC98D] transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#9FC98D] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <span className="text-lg font-semibold text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-[#9FC98D]">
              ₹{(selectedVariant.price * quantity).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#9FC98D] text-white hover:bg-[#8BB87C]'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
