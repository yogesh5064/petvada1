import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Upload, Package, Pill, Scale } from 'lucide-react'; 
import toast from 'react-hot-toast';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const [formData, setFormData] = useState({
    name: '', category: 'Food', sellingPrice: '', purchasePrice: '', 
    quantity: '', batchNumber: '', 
    expiryDate: '', 
    weight: '', unit: 'kg' 
  });
  const [image, setImage] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { 
    Authorization: `Bearer ${userInfo?.token}`,
    'Content-Type': 'multipart/form-data'
  }};

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('https://petvada1.onrender.com/api/products');
      setProducts(data);
    } catch (err) { toast.error("Inventory load fail!"); }
    finally { setLoading(false); }
  };

  const handleNameChange = (name) => {
    setFormData({ ...formData, name });
    const match = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (match) {
      setIsExisting(true);
      setFormData(prev => ({ 
        ...prev, 
        category: match.category, 
        sellingPrice: match.sellingPrice,
        weight: match.weight || '',
        unit: match.unit || 'kg',
        expiryDate: match.currentExpiry ? new Date(match.currentExpiry).toISOString().split('T')[0] : ''
      }));
      toast.success("Product found! Restock mode.");
    } else {
      setIsExisting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.expiryDate) {
      return toast.error("Please select an Expiry Date!");
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      await axios.post('https://petvada1.onrender.com/api/products/add', data, config);
      toast.success(isExisting ? "Stock Updated!" : "New Product Added!");
      setShowModal(false);
      fetchProducts();
      resetForm();
    } catch (err) { 
      const msg = err.response?.data?.message || "Error saving product!";
      toast.error(msg); 
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', category: 'Food', sellingPrice: '', purchasePrice: '', 
      quantity: '', batchNumber: '', expiryDate: '', weight: '', unit: 'kg' 
    });
    setImage(null);
    setIsExisting(false);
  };

  const categories = ['All', 'Food', 'Accessories', 'Medicine'];
  const filteredProducts = filterCategory === 'All' 
    ? products 
    : products.filter(p => p.category === filterCategory);

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-indigo-600 animate-pulse text-xs tracking-widest uppercase">Syncing Inventory... 🏗️</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 p-3 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 italic uppercase tracking-tighter leading-none">Inventory 🏗️</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Manage Units (kg/g) & Stock</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">
            <Plus size={18} /> Add New Stock
          </button>
        </div>

        {/* Category Tabs: Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all snap-center shadow-sm ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50/50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <tr>
                  <th className="p-4 md:p-6">Item & Weight</th>
                  <th className="p-4 md:p-6">Price</th>
                  <th className="p-4 md:p-6">Stock Status</th>
                  <th className="p-4 md:p-6">Batch / Expiry</th>
                  <th className="p-4 md:p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredProducts.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-gray-300 italic uppercase font-black text-xs">No items in this category</td></tr>
                ) : (
                    filteredProducts.map(p => (
                    <tr key={p._id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="p-4 md:p-6">
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                {p.category === 'Medicine' ? <Pill size={18} /> : <Package size={18} />}
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-black text-gray-800 uppercase italic leading-none truncate w-32 md:w-auto">{p.name}</p>
                                <p className="text-[8px] md:text-[9px] text-indigo-500 font-black mt-1 uppercase tracking-tighter">
                                {p.category} {p.weight ? `• ${p.weight}${p.unit}` : ''}
                                </p>
                            </div>
                            </div>
                        </td>
                        <td className="p-4 md:p-6 text-[11px] md:text-sm font-black text-gray-900 italic">₹{p.sellingPrice}</td>
                        
                        <td className="p-4 md:p-6">
                        <div className="flex flex-col gap-1">
                            <span className={`text-[9px] md:text-[11px] font-black uppercase px-2.5 py-1.5 rounded-xl inline-block w-fit shadow-sm border ${
                            p.stock <= 0 
                                ? 'bg-black text-white border-black' 
                                : p.stock < 5 
                                ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                                : 'bg-green-50 text-green-600 border-green-100' 
                            }`}>
                            {p.stock <= 0 ? '🚫 Out of Stock' : `${p.stock} Units Left`}
                            </span>
                            {p.stock > 0 && p.stock < 5 && (
                            <p className="text-[7px] md:text-[8px] font-black text-red-500 uppercase italic tracking-tighter">
                                ⚠️ Refill Required!
                            </p>
                            )}
                        </div>
                        </td>

                        <td className="p-4 md:p-6">
                            <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase italic">B: {p.currentBatch || 'N/A'}</p>
                            <p className="text-[8px] md:text-[9px] font-bold text-orange-500 mt-0.5">{p.currentExpiry ? new Date(p.currentExpiry).toLocaleDateString('en-GB') : 'NO EXP'}</p>
                        </td>
                        <td className="p-4 md:p-6 text-right">
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-200 hover:text-red-600 cursor-pointer" />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL: Responsive Grid Form --- */}
        {showModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 md:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border-t-[8px] border-indigo-600">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-90"><X size={20}/></button>
              
              <div className="mb-6 md:mb-8 italic uppercase font-black text-gray-800">
                <h2 className="text-2xl md:text-3xl tracking-tighter">
                  {isExisting ? 'Restock Item 📦' : 'Add New Item 🆕'}
                </h2>
                <p className="text-[8px] md:text-[9px] text-indigo-500 tracking-widest mt-1">Fill detail for automated analytics</p>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="md:col-span-2">
                  <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Item Name</label>
                  <input type="text" placeholder="e.g. Royal Canin Adult" className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 transition-all" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
                </div>

                <div>
                  <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Category</label>
                  <select className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 appearance-none bg-no-repeat" value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} disabled={isExisting} >
                    <option value="Food">Food</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>

                <div>
                   <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Quantity (Units)</label>
                   <input type="number" placeholder="0" className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600" value={formData.quantity} onChange={(e)=>setFormData({...formData, quantity: e.target.value})} required />
                </div>

                {formData.category === 'Food' && (
                  <div className="md:col-span-2 grid grid-cols-2 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <div>
                      <label className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase ml-2 mb-1 block">Weight Value</label>
                      <input type="number" placeholder="500" className="w-full p-3 bg-white rounded-xl outline-none font-bold text-xs md:text-sm" value={formData.weight} onChange={(e)=>setFormData({...formData, weight: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase ml-2 mb-1 block">Unit</label>
                      <select className="w-full p-3 bg-white rounded-xl outline-none font-bold text-xs md:text-sm" value={formData.unit} onChange={(e)=>setFormData({...formData, unit: e.target.value})}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:col-span-2">
                    <div>
                        <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Selling Price (₹)</label>
                        <input type="number" className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm" value={formData.sellingPrice} onChange={(e)=>setFormData({...formData, sellingPrice: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Purchase Cost (₹)</label>
                        <input type="number" className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm" value={formData.purchasePrice} onChange={(e)=>setFormData({...formData, purchasePrice: e.target.value})} required />
                    </div>
                </div>

                <div>
                  <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Batch No.</label>
                  <input type="text" className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm uppercase" value={formData.batchNumber} onChange={(e)=>setFormData({...formData, batchNumber: e.target.value})} required />
                </div>

                <div>
                  <label className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase ml-2 mb-1 block">Expiry Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3.5 md:p-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs md:text-sm" 
                    value={formData.expiryDate} 
                    onChange={(e)=>setFormData({...formData, expiryDate: e.target.value})} 
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex flex-col items-center p-6 border-2 border-dashed border-indigo-100 rounded-3xl cursor-pointer bg-indigo-50/20 hover:bg-indigo-50 transition-all group">
                    <Upload className="text-indigo-300 group-hover:text-indigo-600 mb-2" size={24} />
                    <span className="text-[8px] md:text-[10px] font-black text-indigo-400 group-hover:text-indigo-600 uppercase tracking-widest">{image ? image.name : 'Upload Item Photo'}</span>
                    <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
                  </label>
                </div>

                <button type="submit" className="md:col-span-2 bg-gray-900 text-white p-5 rounded-[1.8rem] md:rounded-[2.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 mt-4">
                  {isExisting ? 'Update Existing Stock' : 'Add to Master Inventory'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;