import React from 'react';
import {
  ShieldCheck,
  Dog,
  Home as HostelIcon,
  Syringe,
  Clock,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBanner from '../components/NotificationBanner';

const Home = () => {
  return (
    // md:pl-64 adding space for the sidebar on desktop
    <div className="min-h-screen bg-[#fafbff] md:pl-64 transition-all duration-300">
      <NotificationBanner />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-indigo-950 text-white py-16 md:py-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] bg-indigo-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center mt-10 md:mt-0">
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/10 border border-white/10 rounded-full">
            Premium Pet Care Experience
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-8">
            Professional Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
              For Your Best Friend
            </span>
          </h1>

          <p className="text-indigo-100/80 text-lg max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Everything from vaccinations to luxury hostel stays managed by professional veterinarians.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/login"
              className="group bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all active:scale-95 flex items-center gap-2"
            >
              Book Appointment <ArrowRight size={18} />
            </Link>
            <Link
              to="/shop"
              className="bg-white/5 border border-white/20 px-8 py-4 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all hover:bg-white/10"
            >
              Explore Shop
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-16">
           <h2 className="text-3xl md:text-5xl font-black uppercase italic text-slate-900 mb-4">
              Our Specialized Services
            </h2>
            <div className="w-20 h-1.5 bg-indigo-600 rounded-full mx-auto md:mx-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard icon={<Syringe />} title="Vaccination" desc="Complete immunization schedules with automated reminders." />
          <ServiceCard icon={<Dog />} title="Grooming" desc="Professional grooming, bathing, and hygiene care." />
          <ServiceCard icon={<HostelIcon />} title="Pet Hostel" desc="Safe and comfortable boarding with 24/7 monitoring." />
          <ServiceCard icon={<ShieldCheck />} title="Treatment" desc="Expert veterinary care for illness and surgery." />
          <ServiceCard icon={<ShoppingBag />} title="Pet Shop" desc="Premium food and accessories delivered to your door." />
          <ServiceCard icon={<Clock />} title="Emergency" desc="24/7 emergency support for critical situations." />
        </div>
      </section>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc }) => (
  <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all">
    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3 className="text-xl font-black uppercase italic text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Home;