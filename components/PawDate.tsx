
import React, { useState } from 'react';
import { PetEvent, Pet, EventType } from '../types';
import { Icons } from '../constants';

interface PawDateProps {
  events: PetEvent[];
  pets: Pet[];
  onJoinEvent: (eventId: string) => void;
  currentOwnerId: string;
}

const PawDate: React.FC<PawDateProps> = ({ events, pets, onJoinEvent, currentOwnerId }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'discovery'>('events');

  // Mock Discovery Profiles
  const DISCOVERY_PROFILES = [
    {
      id: 'owner-2',
      name: 'Sarah Miller',
      avatar: 'https://picsum.photos/seed/sarah/150',
      tagline: 'Loves sunset walks and Golden Retrievers.',
      pets: pets.filter(p => p.ownerId === 'owner-2')
    },
    {
      id: 'owner-3',
      name: 'James Wilson',
      avatar: 'https://picsum.photos/seed/james/150',
      tagline: 'Cat dad looking for someone who doesn’t mind fur on their clothes.',
      pets: pets.filter(p => p.ownerId === 'owner-3')
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="text-center bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border border-red-100 shadow-inner">
        <div className="inline-block p-4 bg-white rounded-full shadow-md text-red-500 mb-4 scale-110">
          <Icons.Heart />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">PawDate Hub</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">Where pet lovers find their perfect match, for both their fur-babies and themselves.</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl mx-2">
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'events' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
        >
          <Icons.MapPin /> Events
        </button>
        <button 
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'discovery' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
        >
          <Icons.Search /> Discover
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="space-y-4 px-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Upcoming Date Events</h3>
            <button className="text-xs font-bold text-red-500 underline decoration-red-200 underline-offset-4">Host Event</button>
          </div>
          
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-all">
              <div className="h-40 relative">
                <img src={event.imageUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-50">
                  {event.type}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-1">{event.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icons.MapPin />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-500">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(event.date)}</p>
                    <p className="text-[10px] text-gray-400 font-medium">@ 6:30 PM</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/attendee${i}/40/40`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      +{event.attendeesCount - 3}
                    </div>
                  </div>
                  <button 
                    onClick={() => onJoinEvent(event.id)}
                    className="bg-red-500 text-white px-6 py-2 rounded-2xl text-sm font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                  >
                    I'm Interested
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 px-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Single Pet Owners Nearby</h3>
          {DISCOVERY_PROFILES.map(profile => (
            <div key={profile.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={profile.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-red-100" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full text-white border-2 border-white">
                    <Icons.Heart />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{profile.name}</h4>
                  <p className="text-xs text-gray-500">{profile.tagline}</p>
                </div>
                <button className="bg-gray-50 text-gray-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                  <Icons.Message />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Their Fuzzy Pack</p>
                <div className="flex gap-3">
                  {profile.pets.map(pet => (
                    <div key={pet.id} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-100">
                      <img src={pet.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{pet.name}</p>
                        <p className="text-[9px] text-gray-400">{pet.breed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mt-2">
                <button className="flex-1 bg-red-50 text-red-500 py-3 rounded-2xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">Pass</button>
                <button className="flex-1 bg-red-500 text-white py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all">Paw Match</button>
              </div>
            </div>
          ))}
          <div className="text-center py-10 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="text-4xl mb-2">💘</div>
            <p className="text-sm font-bold text-gray-800">No more packs in your area!</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Try expanding your search radius</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PawDate;
