
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pet, AlertType } from '../types';
import { Icons } from '../constants';

interface SearchProps {
  pets: Pet[];
  followedOwnerIds: Set<string>;
  onToggleFollow: (ownerId: string) => void;
  currentOwnerId: string;
}

const Search: React.FC<SearchProps> = ({ pets, followedOwnerIds, onToggleFollow, currentOwnerId }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'adoption'>('discover');
  const navigate = useNavigate();

  const TRENDING = [
    { name: 'Hiking Dogs', count: '12k posts' },
    { name: 'Caturday', count: '45k posts' },
    { name: 'HamsterWheels', count: '8k posts' },
  ];

  const suggestedPets = pets.filter(p => p.ownerId !== currentOwnerId && p.status !== AlertType.ADOPTION);
  const adoptionPets = pets.filter(p => p.status === AlertType.ADOPTION);

  const filteredPets = suggestedPets.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.breed.toLowerCase().includes(query.toLowerCase()) ||
    p.species.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAdoption = adoptionPets.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.breed.toLowerCase().includes(query.toLowerCase()) ||
    p.species.toLowerCase().includes(query.toLowerCase())
  );

  const handleInquiry = (pet: Pet) => {
    alert(`Inquiry sent to the owner of ${pet.name}! Navigating you to messages...`);
    navigate('/messages');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
          <Icons.Search />
        </div>
        <input 
          type="text" 
          className="w-full glass border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-400 transition-all shadow-sm"
          placeholder={activeTab === 'discover' ? "Search for breeds, names, or friends..." : "Search for your perfect match..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl mx-2">
        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'discover' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Discover
        </button>
        <button 
          onClick={() => setActiveTab('adoption')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'adoption' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Icons.Heart /> Adoption
        </button>
      </div>

      {activeTab === 'discover' ? (
        <>
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Trending PawTags</h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(tag => (
                <button key={tag.name} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-col hover:shadow-md transition-shadow">
                  <span className="font-bold text-gray-800">#{tag.name}</span>
                  <span className="text-[10px] text-gray-400">{tag.count}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
              {query ? 'Results' : 'Suggested Animals'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(query ? filteredPets : suggestedPets).map(pet => {
                const isFollowing = followedOwnerIds.has(pet.ownerId);
                return (
                  <div key={pet.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                    <img src={pet.photo} className="w-20 h-20 rounded-full object-cover border-2 border-red-50" alt={pet.name} />
                    <div className="text-center">
                      <h4 className="font-bold text-gray-800">{pet.name}</h4>
                      <p className="text-xs text-gray-400">{pet.breed}</p>
                    </div>
                    <button 
                      onClick={() => onToggleFollow(pet.ownerId)}
                      className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        isFollowing 
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
              {query && filteredPets.length === 0 && (
                <div className="col-span-2 text-center py-10 text-gray-400 italic">
                  No fuzzy friends found matching "{query}"
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="space-y-6">
          <div className="px-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Pets Seeking Forever Homes</h3>
            <p className="text-[10px] text-gray-500 italic">Every animal deserves a loving family. 🐾</p>
          </div>

          <div className="space-y-4 px-2">
            {(query ? filteredAdoption : adoptionPets).map(pet => (
              <div key={pet.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-right-4 duration-500">
                <div className="relative shrink-0">
                  <img src={pet.photo} className="w-28 h-28 rounded-2xl object-cover border-2 border-red-50" alt={pet.name} />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                    <Icons.Heart />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 text-lg">{pet.name}</h4>
                      <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-100">For Adoption</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-2">{pet.breed}</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 italic">"{pet.bio}"</p>
                  </div>
                  <button 
                    onClick={() => handleInquiry(pet)}
                    className="mt-3 bg-red-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors shadow-md active:scale-95"
                  >
                    Inquire About Adoption
                  </button>
                </div>
              </div>
            ))}
            {(query ? filteredAdoption : adoptionPets).length === 0 && (
              <div className="text-center py-20 text-gray-400 italic">
                {query ? `No adoption matches for "${query}"` : "All fuzzy friends have found homes! Check back soon."}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Search;
