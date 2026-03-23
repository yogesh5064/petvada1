import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Package, ChevronLeft, ShoppingBag, Bone, ToyBrick, Clock, Pill, X, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 
  const BASE_URL = "http://localhost:5000"; 

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (location.pathname === '/cart') setIsCartOpen(true);
  }, [location]);

  useEffect(() => {
    if (cart.length > 0) localStorage.setItem('cartItems', JSON.stringify(cart));
    else localStorage.removeItem('cartItems');
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products`);
        setProducts(data);
      } catch (err) { toast.error("Load fail!"); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const displayProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory ? p.category === activeCategory : true;
    if (searchTerm) return matchesSearch;
    return activeCategory ? matchesCategory : false;
  });

  const addToCart = (product) => {
    const exist = cart.find(x => x._id === product._id);
    if (exist && exist.qty >= product.stock) return toast.error(`Stock low!`);
    if (!exist && product.stock <= 0) return toast.error("Sold out!");

    let newCart = exist 
      ? cart.map(x => x._id === product._id ? { ...exist, qty: exist.qty + 1 } : x)
      : [...cart, { ...product, qty: 1 }];
    setCart(newCart);
    toast.success("Added!", { duration: 800, position: 'bottom-center' });
  };

  const removeFromCart = (product) => {
    const exist = cart.find(x => x._id === product._id);
    let newCart = exist.qty === 1 
      ? cart.filter(x => x._id !== product._id)
      : cart.map(x => x._id === product._id ? { ...exist, qty: exist.qty - 1 } : x);
    setCart(newCart);
  };

  const deleteFromCart = (id) => {
    setCart(cart.filter(x => x._id !== id));
    toast.error("Removed");
  };

  const cartTotal = cart.reduce((a, c) => a + Number(c.sellingPrice) * c.qty, 0);

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-indigo-600 italic text-xs">PetVeda Store... 🐾</div>;

  return (
    <div className="max-w-7xl mx-auto p-1 md:p-8 mt-16 md:mt-0 pb-24 relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            {(activeCategory || searchTerm) && (
              <button onClick={() => {setActiveCategory(null); setSearchTerm('')}} className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600 border border-gray-100"><ChevronLeft size={16} /></button>
            )}
            <h1 className="text-lg md:text-3xl font-black text-gray-800 italic uppercase tracking-tighter">
              {searchTerm ? 'Results' : activeCategory || 'Shop'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/order-history')} className="p-2.5 bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100"><Clock size={16} /></button>
            <button onClick={() => setIsCartOpen(true)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg relative">
              <ShoppingBag size={16} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-white">{cart.length}</span>}
            </button>
          </div>
        </div>

        <div className="relative shadow-sm rounded-xl w-full px-2">
          <input 
            type="text" placeholder="Search..." 
            className="w-full p-3 bg-white rounded-xl outline-none font-bold pl-10 border border-gray-100 focus:ring-1 focus:ring-indigo-500 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-3 text-gray-400" size={16} />
        </div>
      </div>

      {/* CATEGORIES */}
      {!activeCategory && !searchTerm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-2">
          <CategoryCard title="Pet Food" icon={<Bone size={24} />} desc="Kibble & Treats" color="bg-orange-500" onClick={() => setActiveCategory('Food')} />
          <CategoryCard title="Accessories" icon={<ToyBrick size={24} />} desc="Toys & Gear" color="bg-blue-500" onClick={() => setActiveCategory('Accessories')} />
          <CategoryCard title="Medicines" icon={<Pill size={24} />} desc="Health & Care" color="bg-red-500" onClick={() => setActiveCategory('Medicine')} />
        </div>
      )}

      {/* ✅ GRID UPDATE: Phone 3 cols (grid-cols-3), PC 4 cols (lg:grid-cols-4) */}
      {(activeCategory || searchTerm) && (
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-8 px-1">
          {displayProducts.map(product => (
            <ProductCard key={product._id} product={product} onAdd={addToCart} baseUrl={BASE_URL} />
          ))}
        </div>
      )}

      {/* 🛒 CART DRAWER (Full width on mobile) */}
      <div className={`fixed inset-y-0 right-0 z-[600] w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-500 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2"><ShoppingBag className="text-indigo-400" size={18} /><h2 className="text-md font-black uppercase">Basket</h2></div>
          <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-40"><Package size={40}/><p className="font-black uppercase text-[8px] mt-2">Empty</p></div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-2 p-2 bg-white rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : ''} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <h4 className="font-black text-gray-800 uppercase text-[9px] truncate">{item.name}</h4>
                  <p className="text-indigo-600 font-black text-[10px]">₹{item.sellingPrice}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item)} className="px-1.5 bg-gray-100 rounded text-red-500">-</button>
                    <span className="font-black text-[10px]">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="px-1.5 bg-gray-100 rounded text-green-500">+</button>
                  </div>
                </div>
                <button onClick={() => deleteFromCart(item._id)} className="text-gray-300 self-center"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t bg-white space-y-3">
            <div className="flex justify-between items-end"><p className="text-[8px] font-black text-gray-400">Total</p><p className="text-xl font-black italic">₹{cartTotal}</p></div>
            <button onClick={() => { setIsCartOpen(false); navigate('/checkout-verification', { state: { cart, total: cartTotal } }); }} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black uppercase text-[10px]">Checkout</button>
          </div>
        )}
      </div>
      {isCartOpen && <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[550]" />}
    </div>
  );
};

const CategoryCard = ({ title, icon, desc, color, onClick }) => (
  <button onClick={onClick} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-50 text-left active:scale-95">
    <div className={`w-10 h-10 ${color} text-white rounded-lg flex items-center justify-center mb-2`}>{icon}</div>
    <h3 className="text-sm font-black italic text-gray-800 leading-none">{title}</h3>
    <p className="text-[7px] text-gray-400 font-black uppercase mt-0.5">{desc}</p>
  </button>
);

const ProductCard = ({ product, onAdd, baseUrl }) => {
  const imageUrl = product.image ? (product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? `${baseUrl}${product.image}` : `${baseUrl}/${product.image}`)) : null;
  return (
    <div className="bg-white p-1.5 md:p-5 rounded-xl md:rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col h-full active:scale-95 transition-all">
      {/* Image Container: Optimized for 3 columns */}
      <div className="aspect-[4/5] md:aspect-square bg-gray-50 rounded-lg md:rounded-[1.8rem] mb-1.5 flex items-center justify-center relative overflow-hidden">
        {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <Package size={20} className="text-gray-200" />}
        {product.stock <= 0 && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="bg-black text-white text-[6px] font-black px-1.5 py-0.5 rounded-full italic">Sold</span></div>}
        <span className="absolute bottom-1 right-1 bg-white/95 px-1 py-0.5 rounded-md font-black text-[8px] md:text-xs shadow-sm italic text-gray-900 border border-gray-50">₹{product.sellingPrice}</span>
      </div>

      <div className="px-0.5 flex flex-col flex-1">
        <h4 className="font-black text-gray-800 uppercase text-[8px] md:text-[13px] italic truncate leading-tight">{product.name}</h4>
        <div className="flex justify-between items-center mb-1.5">
           <p className="text-[6px] md:text-[8px] font-black text-gray-300 uppercase italic truncate">{product.category}</p>
        </div>
        <button disabled={product.stock <= 0} onClick={() => onAdd(product)} className={`w-full mt-auto py-1.5 rounded-lg font-black text-[7px] md:text-[10px] uppercase transition-all ${product.stock <= 0 ? 'bg-gray-100 text-gray-300' : 'bg-gray-900 text-white shadow-sm'}`}>
          {product.stock <= 0 ? 'Out' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default Shop;