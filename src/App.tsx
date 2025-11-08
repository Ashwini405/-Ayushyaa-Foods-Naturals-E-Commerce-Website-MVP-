import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import { db, ProductWithVariants } from './lib/firebase';
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

function App() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const categoriesCol = collection(db, "categories");
      let categoriesSnapshot = await getDocs(categoriesCol);
      
      if (categoriesSnapshot.empty) {
        await addDoc(collection(db, 'categories'), {
          name: 'Foods',
          slug: 'foods',
          description: 'Natural food products and nutrition',
          created_at: new Date().toISOString()
        });
        await addDoc(collection(db, 'categories'), {
          name: 'Naturals',
          slug: 'naturals',
          description: 'Natural personal care and herbal products',
          created_at: new Date().toISOString()
        });
        categoriesSnapshot = await getDocs(categoriesCol);
      }

      const categoriesMap = new Map();
      categoriesSnapshot.docs.forEach(doc => {
        const catData = doc.data();
        categoriesMap.set(doc.id, { 
          id: doc.id, 
          name: catData.name || 'Uncategorized',
          slug: catData.slug || 'uncategorized',
          description: catData.description || '',
          created_at: catData.created_at || ''
        });
      });

      const productsCol = collection(db, "products");
      const q = query(productsCol, where("is_active", "==", true));
      const productSnapshot = await getDocs(q);
      const productList = productSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: { id: '', name: '', slug: '', description: '', created_at: '' },
          variants: []
        } as unknown as ProductWithVariants;
      });

      const productsWithDetails = await Promise.all(
        productList.map(async (product) => {
          const category = product.category_id && categoriesMap.has(product.category_id)
            ? categoriesMap.get(product.category_id)
            : { id: '', name: 'Uncategorized', slug: 'uncategorized', description: '', created_at: '' };

          const variantsCol = collection(db, `products/${product.id}/variants`);
          const variantSnapshot = await getDocs(variantsCol);
          const variants = variantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

          return {
            ...product,
            category,
            variants,
          };
        })
      );

      setProducts(productsWithDetails);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category?.slug?.toLowerCase() === activeCategory.toLowerCase());

  const foodsCount = products.filter((p) => p.category?.slug?.toLowerCase() === 'foods').length;
  const naturalsCount = products.filter((p) => p.category?.slug?.toLowerCase() === 'naturals').length;

  return (
    <div className="min-h-screen bg-[#F8F8F3]">
      <Header 
        onCartClick={() => setCartOpen(true)} 
        onLoginClick={() => setLoginOpen(true)}
      />
      <Hero />

      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Leaf className="w-12 h-12 text-[#9FC98D] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Back to Roots
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At Ayushyaa Foods & Naturals, we believe in the power of nature. Our products are crafted with
              100% natural ingredients, free from chemicals and preservatives. We bring you the goodness of
              traditional recipes and herbal wisdom, helping you reconnect with natural wellness. From nutritious
              laddus to herbal personal care, every product is made with care for your health and happiness.
            </p>
          </div>
        </div>
      </section>

      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Our Products
            </h2>
            <p className="text-lg text-gray-600">
              Explore our range of natural and organic products
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeCategory === 'all'
                  ? 'bg-[#9FC98D] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveCategory('foods')}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeCategory === 'foods'
                  ? 'bg-[#9FC98D] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Foods ({foodsCount})
            </button>
            <button
              onClick={() => setActiveCategory('naturals')}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeCategory === 'naturals'
                  ? 'bg-[#9FC98D] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Naturals ({naturalsCount})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#9FC98D]"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-[#9FC98D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Natural</h3>
              <p className="text-gray-600">
                No chemicals, preservatives, or artificial ingredients
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-[#9FC98D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Traditional Recipes</h3>
              <p className="text-gray-600">
                Time-tested formulations passed down through generations
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-[#9FC98D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                Every product is made with care and quality control
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <Checkout
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onLoginRequired={() => {
          setCheckoutOpen(false);
          setLoginOpen(true);
        }}
      />

      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <Signup
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
}

export default App;
