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
    <div className="min-h-screen bg-[#fafbff]">
      <NotificationBanner />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-indigo-950 text-white py-20 md:py-32 px-6">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] bg-indigo-500/20 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/10 border border-white/10 rounded-full">
            Premium Pet Care Experience
          </span>
          
          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.95] mb-8">
            Professional Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
              For Your Best Friend
            </span>
          </h1>

          <p className="text-indigo-100/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Everything from vaccinations to luxury hostel stays. Managed by professional veterinarians using modern pet-care systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/login"
              className="group bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 flex items-center gap-2"
            >
              Book Appointment
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/shop"
              className="bg-white/5 hover:bg-white/10 border border-white/20 px-8 py-4 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all active:scale-95"
            >
              Explore Shop
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic text-slate-900 leading-none mb-4">
              Our Specialized <br /> Services
            </h2>
            <p className="text-slate-500 font-medium">Providing the highest standard of medical and emotional care for your pets.</p>
          </div>
          <div className="hidden md:block w-24 h-1 bg-indigo-600 rounded-full mb-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          <ServiceCard
            icon={<Syringe />}
            title="Vaccination"
            desc="Complete immunization schedules with automated reminders so you never miss a dose."
          />
          <ServiceCard
            icon={<Dog />}
            title="Grooming"
            desc="Professional grooming, therapeutic bathing, and complete hygiene care for all breeds."
          />
          <ServiceCard
            icon={<HostelIcon />}
            title="Pet Hostel"
            desc="Safe, climate-controlled, and comfortable boarding with 24/7 expert monitoring."
          />
          <ServiceCard
            icon={<ShieldCheck />}
            title="Treatment"
            desc="Expert veterinary care for illness, routine checkups, and advanced surgical procedures."
          />
          <ServiceCard
            icon={<ShoppingBag />}
            title="Pet Shop"
            desc="Premium nutrition, curated toys, and essential accessories delivered to your door."
          />
          <ServiceCard
            icon={<Clock />}
            title="Emergency"
            desc="Immediate 24/7 emergency support and critical care for life-threatening situations."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center border-t border-slate-100 bg-white">
        <div className="mb-6 flex justify-center gap-6 grayscale opacity-50">
           {/* Add small logo icons or social links here if needed */}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
          © 2026 PetVeda • Excellence in Veterinary Medicine
        </p>
      </footer>
    </div>
  );
};

/* SERVICE CARD COMPONENT */
const ServiceCard = ({ icon, title, desc }) => {
  return (
    <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300 mb-8">
        {React.cloneElement(icon, { size: 28 })}
      </div>

      <h3 className="text-xl font-black uppercase italic text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>

      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
};

export default Home;