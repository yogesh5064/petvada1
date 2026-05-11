import React from 'react';
import {
  ShieldCheck,
  Dog,
  Home as HostelIcon,
  Syringe,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBanner from '../components/NotificationBanner';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">

      <NotificationBanner />

      {/* HERO SECTION */}
      <section className="bg-indigo-900 text-white py-16 md:py-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tight leading-tight mb-6">
            Professional Care <br className="hidden md:block" />
            for Your Best Friend
          </h1>

          <p className="text-indigo-200 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Everything from vaccinations to luxury hostel stays. Managed by professional veterinarians using modern pet-care systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition active:scale-95"
            >
              Book Appointment
            </Link>

            <Link
              to="/shop"
              className="border-2 border-white/30 hover:bg-white hover:text-indigo-900 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition active:scale-95"
            >
              Explore Shop
            </Link>
          </div>

        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic text-gray-800">
            Our Specialized Services
          </h2>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          <ServiceCard
            icon={<Syringe size={24} />}
            title="Vaccination"
            desc="Complete immunization schedules with automated reminders."
          />

          <ServiceCard
            icon={<Dog size={24} />}
            title="Grooming"
            desc="Professional grooming, bathing, and hygiene care."
          />

          <ServiceCard
            icon={<HostelIcon size={24} />}
            title="Pet Hostel"
            desc="Safe and comfortable boarding with 24/7 monitoring."
          />

          <ServiceCard
            icon={<ShieldCheck size={24} />}
            title="Treatment"
            desc="Expert veterinary care for illness and surgery."
          />

          <ServiceCard
            icon={<ShoppingBag size={24} />}
            title="Pet Shop"
            desc="Premium food and accessories delivered to your door."
          />

          <ServiceCard
            icon={<Clock size={24} />}
            title="Emergency"
            desc="24/7 emergency support for critical situations."
          />

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center border-t border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          © 2026 PetVeda Veterinary Systems
        </p>
      </footer>

    </div>
  );
};

/* SERVICE CARD */
const ServiceCard = ({ icon, title, desc }) => {
  return (
    <div className="p-6 md:p-8 border border-gray-100 rounded-3xl bg-white hover:shadow-xl hover:border-indigo-100 transition-all active:scale-95 group">

      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition mb-6">
        {icon}
      </div>

      <h3 className="text-lg md:text-xl font-black uppercase italic text-gray-800 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed">
        {desc}
      </p>

    </div>
  );
};

export default Home;