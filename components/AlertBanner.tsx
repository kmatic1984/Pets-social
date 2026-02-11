
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
        <div key={`lost-${pet.id}`} className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full">
              <img src={pet.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Missing Alert Escalated</p>
              <p className="text-sm font-semibold">{pet.name} was last seen at {pet.lastSeenLocation || 'Unknown'}</p>
            </div>
          </div>
          <Icons.Alert />
        </div>
      ))}

      {birthdayPets.map(pet => (
        <div key={`bday-${pet.id}`} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full">
              <img src={pet.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Birthday Celebration!</p>
              <p className="text-sm font-semibold">Wish {pet.name} a happy birthday today! 🎂</p>
            </div>
          </div>
          <Icons.Cake />
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
