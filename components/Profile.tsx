
import React, { useState } from 'react';
import { Owner, Pet, AlertType, Post } from '../types';
import { Icons } from '../constants';
import EditPostModal from './EditPostModal';

interface ProfileProps {
  owner: Owner;
  pets: Pet[];
  posts: Post[];
  onUpdateStatus: (petId: string, status: AlertType, location?: string) => void;
  onUpdatePost: (post: Post) => void;
  followedOwnerIds: Set<string>;
}

const Profile: React.FC<ProfileProps> = ({ owner, pets, posts, onUpdateStatus, onUpdatePost, followedOwnerIds }) => {
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState<'pets' | 'posts' | 'following'>('pets');

  const handleEscalate = (pet: Pet) => {
    if (pet.status === AlertType.LOST) {
      onUpdateStatus(pet.id, AlertType.NONE);
    } else {
      setEditingPetId(pet.id);
    }
  };

  const confirmLost = (petId: string) => {
    onUpdateStatus(petId, AlertType.LOST, location);
    setEditingPetId(null);
    setLocation('');
  };

  const myPosts = posts.filter(p => p.ownerId === owner.id);
  const myPets = pets.filter(p => p.ownerId === owner.id);

  // Derive followed owner names for the list view
  const followedOwners = [
    { id: 'owner-2', name: 'Sarah Miller', avatar: 'https://picsum.photos/seed/sarah/150' },
    { id: 'owner-3', name: 'James Wilson', avatar: 'https://picsum.photos/seed/james/150' },
  ].filter(o => followedOwnerIds.has(o.id));

  return (
    <div className="pb-10">
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center border border-gray-100">
        <div className="relative inline-block mb-4">
          <img src={owner.avatar} className="w-24 h-24 rounded-full border-4 border-red-100 object-cover" alt={owner.name} />
          <button className="absolute bottom-0 right-0 bg-red-500 text-white p-1.5 rounded-full border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800">{owner.name}</h2>
        
        <div className="flex justify-center gap-8 my-4">
          <div className="text-center cursor-pointer hover:opacity-70 transition-opacity">
            <p className="font-bold text-gray-800 text-lg">{owner.followersCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Followers</p>
          </div>
          <div onClick={() => setActiveTab('following')} className="text-center cursor-pointer hover:opacity-70 transition-opacity">
            <p className="font-bold text-gray-800 text-lg">{followedOwnerIds.size + (owner.followingCount || 0)}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Following</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {owner.socialLinks.map(link => (
            <span key={link.platform} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-gray-100">
              <span className="text-red-400">{link.platform}</span> {link.handle}
            </span>
          ))}
          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">+ Link Social</button>
        </div>
      </section>

      <div className="flex mb-6 bg-gray-100 p-1 rounded-2xl mx-2">
        <button 
          onClick={() => setActiveTab('pets')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pets' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
        >
          My Pack
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
        >
          Posts
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}
        >
          Following
        </button>
      </div>

      {activeTab === 'pets' ? (
        <div className="grid grid-cols-1 gap-4 px-2">
          {myPets.map(pet => (
            <div key={pet.id} className={`bg-white rounded-3xl p-4 shadow-sm border transition-all ${pet.status === AlertType.LOST ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
              <div className="flex gap-4">
                <img src={pet.photo} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt={pet.name} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{pet.name}</h4>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                    </div>
                    <div className="flex gap-1">
                      {pet.status === AlertType.LOST ? (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Missing</span>
                      ) : (
                        <Icons.Paw />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleEscalate(pet)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        pet.status === AlertType.LOST 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {pet.status === AlertType.LOST ? 'Safe: Cancel Alert' : 'Emergency: Report Lost'}
                    </button>
                    <button className="flex-1 bg-yellow-400 text-gray-800 py-2 rounded-xl text-xs font-bold hover:bg-yellow-500">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {editingPetId === pet.id && (
                <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-red-200 animate-in slide-in-from-top-2">
                  <p className="text-sm font-bold text-red-600 mb-2">Escalate Missing Alert</p>
                  <input 
                    type="text" 
                    placeholder="Last seen location..."
                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-red-400 outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => confirmLost(pet.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold">Broadcast Alert</button>
                    <button onClick={() => setEditingPetId(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : activeTab === 'posts' ? (
        <div className="grid grid-cols-2 gap-3 px-2">
          {myPosts.map(post => (
            <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-black">
              {post.videoUrl ? (
                <div className="w-full h-full relative">
                  <video src={post.videoUrl} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-2 right-2 text-white">
                    <Icons.Play />
                  </div>
                </div>
              ) : (
                <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => setEditingPost(post)}
                  className="bg-white text-gray-800 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Accounts you follow</h3>
          {followedOwners.map(o => (
            <div key={o.id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm animate-in fade-in slide-in-from-left-2">
              <div className="flex items-center gap-3">
                <img src={o.avatar} className="w-12 h-12 rounded-full object-cover border" alt="" />
                <span className="font-bold text-gray-800 text-sm">{o.name}</span>
              </div>
              <button className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-xl text-xs font-bold border">Following</button>
            </div>
          ))}
          {followedOwners.length === 0 && (
            <div className="py-20 text-center text-gray-400 italic text-sm">
              You aren't following any other packs yet.
            </div>
          )}
        </div>
      )}

      {editingPost && (
        <EditPostModal 
          post={editingPost}
          pet={pets.find(p => p.id === editingPost.petId)}
          onClose={() => setEditingPost(null)}
          onSave={onUpdatePost}
        />
      )}
    </div>
  );
};

export default Profile;
