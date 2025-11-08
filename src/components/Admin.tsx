import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, ProductWithVariants, uploadProductImage } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { LogOut, Plus, Edit2, Trash2, Home, Package, Upload } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'edit'>('view');
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    base_price: 0,
    category_id: '',
    is_active: true,
    weight: '',
    price: 0,
    stock: 100,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadProducts();
      loadCategories();
    }
  }, [isAuthenticated, user, navigate]);

  const loadCategories = async () => {
    try {
      const categoriesCol = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCol);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
      }));
      
      if (categoriesList.length === 0) {
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
        const newSnapshot = await getDocs(categoriesCol);
        const newList = newSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
        }));
        setCategories(newList);
      } else {
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const productsCol = collection(db, 'products');
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: { id: '', name: '', slug: '', description: '', created_at: '' },
          variants: []
        } as unknown as ProductWithVariants;
      });

      const categoriesCol = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCol);
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
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData({ ...formData, image_url: '' });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadProductImage(selectedImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      if (!imageUrl) {
        alert('Please provide a product image');
        setLoading(false);
        return;
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image_url: imageUrl,
        base_price: formData.base_price,
        category_id: formData.category_id,
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await addDoc(collection(db, `products/${docRef.id}/variants`), {
        id: `${docRef.id}-${formData.weight}`,
        product_id: docRef.id,
        weight: formData.weight,
        price: formData.price,
        stock: formData.stock,
        is_active: true,
      });

      alert('Product added successfully!');
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        base_price: 0,
        category_id: '',
        is_active: true,
        weight: '',
        price: 0,
        stock: 100,
      });
      setSelectedImage(null);
      setImagePreview('');
      loadProducts();
      setActiveTab('view');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductWithVariants) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      image_url: product.image_url,
      base_price: product.base_price,
      category_id: product.category_id,
      is_active: product.is_active,
      weight: product.variants[0]?.weight || '',
      price: product.variants[0]?.price || 0,
      stock: product.variants[0]?.stock || 100,
    });
    setSelectedImage(null);
    setImagePreview('');
    setActiveTab('edit');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      let imageUrl = formData.image_url;
      
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadProductImage(selectedImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const productRef = doc(db, 'products', selectedProduct.id);
      await updateDoc(productRef, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image_url: imageUrl,
        base_price: formData.base_price,
        category_id: formData.category_id,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      });

      if (selectedProduct.variants.length > 0) {
        const variantRef = doc(db, `products/${selectedProduct.id}/variants`, selectedProduct.variants[0].id);
        await updateDoc(variantRef, {
          weight: formData.weight,
          price: formData.price,
          stock: formData.stock,
        });
      }

      alert('Product updated successfully!');
      setSelectedProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        base_price: 0,
        category_id: '',
        is_active: true,
        weight: '',
        price: 0,
        stock: 100,
      });
      setSelectedImage(null);
      setImagePreview('');
      loadProducts();
      setActiveTab('view');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const variantsCol = collection(db, `products/${productId}/variants`);
      const variantSnapshot = await getDocs(variantsCol);
      
      for (const variantDoc of variantSnapshot.docs) {
        await deleteDoc(doc(db, `products/${productId}/variants`, variantDoc.id));
      }

      await deleteDoc(doc(db, 'products', productId));
      
      alert('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const toggleProductStatus = async (product: ProductWithVariants) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      });
      loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F3]">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Ayushyaa Foods & Naturals" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#9FC98D] transition"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-semibold">Home</span>
              </button>
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#9FC98D] transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'view'
                ? 'bg-[#9FC98D] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>View Products</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              setSelectedProduct(null);
              setFormData({
                name: '',
                slug: '',
                description: '',
                image_url: '',
                base_price: 0,
                category_id: '',
                is_active: true,
                weight: '',
                price: 0,
                stock: 100,
              });
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'add'
                ? 'bg-[#9FC98D] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {activeTab === 'view' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
              <p className="text-gray-600 mt-1">Total Products: {products.length}</p>
            </div>
            
            {productsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#9FC98D]"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products found. Add your first product!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{product.category?.name || 'No Category'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">₹{product.base_price}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {product.variants[0]?.stock || 0} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Product"
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
            )}
          </div>
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {activeTab === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
            <form onSubmit={activeTab === 'add' ? handleSubmit : handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="e.g., Multigrain Laddu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="e.g., multigrain-laddu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                  placeholder="Describe the product..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image *</label>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2 bg-[#9FC98D] text-white rounded-lg cursor-pointer hover:bg-[#8BB87C] transition">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {(imagePreview || formData.image_url) && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>

                  {uploadingImage && (
                    <div className="flex items-center space-x-2 text-[#9FC98D]">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#9FC98D]"></div>
                      <span className="text-sm">Uploading image...</span>
                    </div>
                  )}

                  {(imagePreview || formData.image_url) && (
                    <div>
                      <img 
                        src={imagePreview || formData.image_url} 
                        alt="Preview" 
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200" 
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                    <p>• Maximum size: 5MB</p>
                    <p>• Recommended: Square images (1:1 ratio)</p>
                  </div>

                  {!selectedImage && !formData.image_url && (
                    <input
                      type="hidden"
                      required
                      value={formData.image_url}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Weight *</label>
                    <input
                      type="text"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                      placeholder="e.g., 250g, 500g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#9FC98D] focus:ring-[#9FC98D] border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Product Active
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#9FC98D] text-white py-3 rounded-lg font-semibold hover:bg-[#8BB87C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (activeTab === 'add' ? 'Adding...' : 'Updating...') : (activeTab === 'add' ? 'Add Product' : 'Update Product')}
                </button>
                {activeTab === 'edit' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('view');
                      setSelectedProduct(null);
                      setFormData({
                        name: '',
                        slug: '',
                        description: '',
                        image_url: '',
                        base_price: 0,
                        category_id: '',
                        is_active: true,
                        weight: '',
                        price: 0,
                        stock: 100,
                      });
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
