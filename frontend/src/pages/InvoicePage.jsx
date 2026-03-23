import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Printer, ArrowLeft, MapPin } from 'lucide-react';

const InvoicePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, customer, invoiceNo, totalAmount } = state || {};

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const finalTotal = totalAmount || cart?.reduce((a, b) => a + Number(b.amount), 0) || 0;

  useEffect(() => {
    if (!state) { navigate('/admin/billing'); return; }
    
    const syncInventory = async () => {
      try {
        for (let item of cart) {
          await axios.post('https://petvada1.onrender.com/api/products/add', {
            name: item.name,
            quantity: -(item.qty)
          }, config);
        }
      } catch (err) { console.error("Inventory sync failed"); }
    };
    syncInventory();
  }, [state, cart, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      
      {/* 🛠️ ACTION BAR (Ye print mein nahi dikhega) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between no-print px-4">
        <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-bold shadow hover:bg-gray-200 transition-all">
          <ArrowLeft size={18}/> Back to Billing
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition-all">
          <Printer size={18}/> Print Now
        </button>
      </div>

      {/* 📄 CLEAN PRINT AREA */}
      <div className="invoice-box bg-white mx-auto print:m-0 print:border-2 border-black relative flex flex-col justify-between overflow-hidden text-black">
        
        {/* HEADER SECTION */}
        <div>
          <div className="p-6 border-b-2 border-black flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                SHARMAS PET CARE HOSPITAL
              </h1>
              <p className="text-[10px] font-bold uppercase flex items-center gap-1">
                <MapPin size={10}/> Sec. 2, Indra Gandhi Nagar, Jagatpura, Jaipur - 302017
              </p>
              <p className="text-[10px] font-bold">Contact: 9782945062</p>
              <p className="text-[9px] font-bold mt-2 border-t border-black/10 pt-1 uppercase">DL: DRUG/2024-25/128033, 128034</p>
            </div>
            <div className="text-right">
              <div className="border-2 border-black px-3 py-1 text-sm font-black mb-2 inline-block">TAX INVOICE</div>
              <p className="text-xs font-black">{invoiceNo}</p>
              <p className="text-[10px] font-bold mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* CUSTOMER & DETAILS */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            <div className="p-4 border-r-2 border-black">
              <p className="text-[9px] font-black uppercase text-gray-500">Pet Owner Details:</p>
              <p className="text-sm font-black uppercase">{customer?.name || 'Walk-In Customer'}</p>
              <p className="text-xs font-bold mt-1">{customer?.mobile || 'No Contact'}</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-[9px] font-black uppercase text-gray-500">Place of Supply:</p>
              <p className="text-xs font-bold uppercase">Rajasthan (08)</p>
            </div>
          </div>

          {/* BILL TABLE */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-black uppercase">
                <th className="p-3 border-r-2 border-black w-10 text-center">#</th>
                <th className="p-3 border-r-2 border-black text-left">Description</th>
                <th className="p-3 border-r-2 border-black text-center">Batch</th>
                <th className="p-3 border-r-2 border-black text-center">Qty</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cart?.map((item, idx) => (
                <tr key={idx} className="border-b border-black/20 font-bold h-10">
                  <td className="p-2 border-r-2 border-black text-center">{idx + 1}</td>
                  <td className="p-2 border-r-2 border-black uppercase italic">{item.name}</td>
                  <td className="p-2 border-r-2 border-black text-center font-mono text-xs">{item.batch || '---'}</td>
                  <td className="p-2 border-r-2 border-black text-center">{item.qty}</td>
                  <td className="p-2 text-right font-black">₹{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              {/* Extra spacing to keep footer at bottom */}
              <tr className="flex-grow">
                <td colSpan="5" className="h-20"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 💰 FOOTER (Simplified Black & White) */}
        <div className="border-t-2 border-black">
          <div className="flex justify-between items-stretch">
            <div className="p-4 flex-grow border-r-2 border-black italic text-[9px] font-bold">
              <p className="underline mb-1 font-black">TERMS & CONDITIONS:</p>
              <p>1. Goods once sold will not be taken back.</p>
              <p>2. Bank: SBI | A/c: 61255429365 | IFSC: SBIN0031976</p>
            </div>
            <div className="w-[40%] p-4 flex flex-col justify-center items-end border-l border-black">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Net Payable:</p>
              <h2 className="text-3xl font-black italic">₹{Number(finalTotal).toFixed(2)}</h2>
            </div>
          </div>
          <div className="p-2 text-[8px] font-black uppercase italic text-center border-t-2 border-black">
            This is a computer generated invoice. No signature required.
          </div>
        </div>

      </div>

      <style>{`
        /* Hide EVERYTHING except the invoice-box during print */
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body * { visibility: hidden; background: white !important; color: black !important; }
          .invoice-box, .invoice-box * { visibility: visible; }
          .invoice-box {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid black !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }

        .invoice-box {
          width: 210mm;
          min-height: 148mm;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;