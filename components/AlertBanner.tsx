
import React from 'react';
import { Pet, AlertType } from '../types';
import { Icons } from '../constants';

interface AlertBannerProps {
  pets: Pet[];
}

const AlertBanner: React.FC<AlertBannerProps> = ({ pets }) => {
  const lostPets = pets.filter(p => p.status === AlertType.LOST);
  const today = new Date().toISOString().split('T')[0].slice(5); // MM-DD
  const birthdayPets = pets.filter(p => p.birthday.slice(5) === today);

  if (lostPets.length === 0 && birthdayPets.length === 0) return null;

  return (
    <div className="sticky top-0 z-[60] space-y-1">
      {lostPets.map(pet => (
        <div key={`lost-${pet.id}`} className="bg-red-600 text-white px-5 py-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={pet.photo} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" alt="" />
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-red-600">
                <Icons.Alert />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-100">Escalated Priority Alert</p>
              <p className="text-sm font-bold">{pet.name.toUpperCase()} is missing near {pet.lastSeenLocation || 'last known location'}</p>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 transition-all active:scale-95">
            Share Poster
          </button>
        </div>
      ))}

      {birthdayPets.map(pet => (
        <div key={`bday-${pet.id}`} className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white px-5 py-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-500 delay-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={pet.photo} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" alt="" />
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-orange-500">
                <Icons.Cake />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Birthday Celebration!</p>
              <p className="text-sm font-bold">WISH {pet.name.toUpperCase()} A HAPPY BIRTHDAY! 🎂🥳</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button className="bg-white text-pink-600 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all">
              Wish Happy Birthday
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
