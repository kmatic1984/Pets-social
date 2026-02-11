
import React, { useState } from 'react';
import { Pet } from '../types';
import { Icons } from '../constants';

interface SearchProps {
  pets: Pet[];
  followedOwnerIds: Set<string>;
  onToggleFollow: (ownerId: string) => void;
  currentOwnerId: string;
}

const Search: React.FC<SearchProps> = ({ pets, followedOwnerIds, onToggleFollow, currentOwnerId }) => {
  const [query, setQuery] = useState('');

  const TRENDING = [
    { name: 'Hiking Dogs', count: '12k posts' },
    { name: 'Caturday', count: '45k posts' },
    { name: 'HamsterWheels', count: '8k posts' },
  ];

  const suggestedPets = pets.filter(p => p.ownerId !== currentOwnerId);

  const filteredPets = suggestedPets.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.breed.toLowerCase().includes(query.toLowerCase()) ||
    p.species.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
          <Icons.Search />
        </div>
        <input 
          type="text" 
          className="w-full glass border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-400 transition-all shadow-sm"
          placeholder="Search for breeds, names, or friends..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
    </div>
  );
};

export default Search;
