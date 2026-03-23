import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, ChevronLeft, ChevronRight, FileText, X, Pill, Info, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('https://petvada1.onrender.com/api/appointments', config);
      setAppointments(data);
    } catch (err) { toast.error("History load nahi ho saki!"); }
    finally { setLoading(false); }
  };

  const filteredHistory = appointments.filter(app => {
    const appDate = new Date(app.date);
    if (filterDate) return new Date(app.date).toISOString().split('T')[0] === filterDate;
    return appDate.getMonth() === selectedMonth && appDate.getFullYear() === selectedYear;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-indigo-600 animate-pulse text-xs tracking-widest uppercase">LOADING ARCHIVES... 🏛️</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-3 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 italic tracking-tighter uppercase leading-none">Medical Archives 🏛️</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Historical patient records & prescriptions</p>
          </div>

          {/* Desktop Filters / Mobile Toggle */}
          <div className="w-full lg:w-auto">
             <button 
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className="lg:hidden w-full flex items-center justify-center gap-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm font-black text-[10px] uppercase text-indigo-600"
             >
               <Filter size={16}/> {showMobileFilters ? 'Hide Filters' : 'Show History Filters'}
             </button>

             <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-3 bg-white p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 mt-3 lg:mt-0`}>
                <div className="relative flex-1 min-w-[140px]">
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border-none outline-none font-bold text-[11px]" />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select disabled={filterDate !== ''} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="flex-1 sm:flex-none p-2 bg-gray-50 rounded-xl border-none outline-none font-black text-[10px] uppercase disabled:opacity-30">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select disabled={filterDate !== ''} value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="flex-1 sm:flex-none p-2 bg-gray-50 rounded-xl border-none outline-none font-black text-[10px] uppercase disabled:opacity-30">
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
                <button onClick={() => { setFilterDate(''); setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} className="w-full sm:w-auto text-[10px] font-black text-red-500 uppercase px-2 py-1">Reset</button>
             </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="p-4 md:p-6">Patient</th>
                  <th className="p-4 md:p-6">Date</th>
                  <th className="p-4 md:p-6 hidden md:table-cell">Service</th>
                  <th className="p-4 md:p-6">Status</th>
                  <th className="p-4 md:p-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-300 italic uppercase font-black text-[10px]">No records found</td></tr>
                ) : (
                  filteredHistory.map((app) => (
                    <tr 
                      key={app._id} 
                      onClick={() => setSelectedReport(app)} 
                      className="hover:bg-indigo-50/50 transition-all cursor-pointer group"
                    >
                      <td className="p-4 md:p-6">
                        <p className="font-black text-gray-800 uppercase italic text-[11px] md:text-sm group-hover:text-indigo-600 leading-none mb-1">{app.petName}</p>
                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold">Owner: {app.user?.name || 'Guest'}</p>
                      </td>
                      <td className="p-4 md:p-6 text-[10px] md:text-xs font-bold text-gray-700 whitespace-nowrap">
                        {new Date(app.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-4 md:p-6 hidden md:table-cell">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase">{app.category}</span>
                      </td>
                      <td className="p-4 md:p-6">
                        <span className={`text-[8px] md:text-[9px] font-black px-2 py-1 rounded-full uppercase ${app.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        <FileText size={18} className="ml-auto text-gray-300 group-hover:text-indigo-500 transition-all" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MEDICAL REPORT SIDE DRAWER --- */}
        {selectedReport && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]" onClick={() => setSelectedReport(null)}></div>
            <div className="fixed right-0 top-0 h-full w-[90%] md:w-full md:max-w-md bg-white z-[210] shadow-2xl p-6 md:p-8 animate-in slide-in-from-right duration-300 overflow-y-auto rounded-l-[2rem] md:rounded-none">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-indigo-600">Case Summary 📑</h2>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Archive Record ID: {selectedReport._id.slice(-6)}</p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <div className="p-5 md:p-6 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-2 tracking-widest">Patient Details</p>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase text-gray-800 leading-none">{selectedReport.petName}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Breed/Species</p>
                      <p className="text-[10px] md:text-xs font-bold uppercase">{selectedReport.breed || selectedReport.petId?.species || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Visit Date</p>
                      <p className="text-[10px] md:text-xs font-bold">{new Date(selectedReport.date).toDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Pill size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Prescribed Medicine</span>
                    </div>
                    <div className="p-4 md:p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <p className="text-xs md:text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedReport.adminNote || selectedReport.prescription?.medicine || "No medical records found."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">General Observations</span>
                    </div>
                    <div className="p-4 md:p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                      <p className="text-xs md:text-sm font-bold text-gray-700 italic leading-relaxed">
                        {selectedReport.prescription?.instructions || "Routine checkup - No special instructions recorded."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedReport(null)}
                className="w-full mt-10 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
              >
                Close Record
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;