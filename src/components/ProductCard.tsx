import { ProductWithVariants } from '../lib/firebase';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithVariants;
  onViewDetails: (product: ProductWithVariants) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const priceDisplay = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-semibold text-[#9FC98D] uppercase">
            {product.category.name}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#9FC98D]">{priceDisplay}</span>
          <button
            onClick={() => onViewDetails(product)}
            className="bg-[#9FC98D] text-white px-4 py-2 rounded-lg hover:bg-[#8BB87C] transition flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
