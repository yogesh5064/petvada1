import React from 'react';
import { ShieldCheck, Dog, Home as HostelIcon, Syringe, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBanner from '../components/NotificationBanner';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <NotificationBanner />
      
      {/* 🚀 Hero Section: Responsive padding and text sizes */}
      <section className="bg-indigo-900 text-white py-16 md:py-28 px-6 md:px-10 flex flex-col items-center text-center">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-6xl font-black mb-6 leading-tight tracking-tighter uppercase italic">
            Professional Care <br className="hidden md:block" /> for Your Best Friend
          </h1>
          <p className="text-base md:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Everything from vaccinations to luxury hostel stays. Managed by professional veterinarians using the latest technology.
          </p>
          
          {/* Action Buttons: Vertical on mobile, Horizontal on PC */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link 
              to="/login" 
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 text-center"
            >
              Book Appointment
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent border-2 border-white/30 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-indigo-900 transition-all active:scale-95 text-center"
            >
              Explore Shop
            </Link>
          </div>
        </div>
      </section>

      {/* 🏥 Services Section: Grid layout 1 col (mobile) to 3 col (desktop) */}
      <section className="py-16 md:py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter italic">Our Specialized Services</h2>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <ServiceCard icon={<Syringe size={24} />} title="Vaccination" desc="Complete immunization schedules with automated reminders for your pets." />
          <ServiceCard icon={<Dog size={24} />} title="Grooming" desc="Professional hair clipping, bathing, and nail trimming services." />
          <ServiceCard icon={<HostelIcon size={24} />} title="Pet Hostel" desc="Safe and comfortable home-away-from-home with 24/7 monitoring." />
          <ServiceCard icon={<ShieldCheck size={24} />} title="Treatment" desc="Expert medical care for illnesses and surgical requirements." />
          <ServiceCard icon={<ShoppingBag size={24} />} title="Pet Shop" desc="Premium food and high-quality accessories delivered to your door." />
          <ServiceCard icon={<Clock size={24} />} title="Emergency" desc="24/7 emergency support for critical pet health situations." />
        </div>
      </section>

      {/* 🐾 Footer Note (Optional but looks good) */}
      <footer className="py-10 text-center border-t border-gray-100">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">© 2026 PetVeda Veterinary Systems</p>
      </footer>
    </div>
  );
};

// Sub-component: ServiceCard (Responsive padding)
const ServiceCard = ({ icon, title, desc }) => (
  <div className="p-6 md:p-8 border-2 rounded-[2rem] hover:shadow-2xl transition-all border-gray-50 hover:border-indigo-100 group bg-white cursor-pointer active:scale-95">
    <div className="bg-indigo-50 text-indigo-600 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
      {icon}
    </div>
    <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Home;