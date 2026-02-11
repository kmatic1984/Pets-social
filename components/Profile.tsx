
import React, { useState } from 'react';
import { Owner, Pet, AlertType, Post, PetAlert, SocialLink } from '../types';
import { Icons } from '../constants';
import EditPostModal from './EditPostModal';
import ShareModal from './ShareModal';
import { geminiService } from '../services/geminiService';

interface ProfileProps {
  owner: Owner;
  pets: Pet[];
  posts: Post[];
  onUpdateStatus: (petId: string, status: AlertType, location?: string) => void;
  onUpdatePost: (post: Post) => void;
  followedOwnerIds: Set<string>;
  onAddAlert?: (petId: string, alert: PetAlert) => void;
  onRemoveAlert?: (petId: string, alertId: string) => void;
  onLogout?: () => void;
}

type SyncStep = 'select' | 'link' | 'authorize' | 'loading';

const Profile: React.FC<ProfileProps> = ({ 
  owner, 
  pets, 
  posts, 
  onUpdateStatus, 
  onUpdatePost, 
  followedOwnerIds,
  onAddAlert,
  onRemoveAlert,
  onLogout
}) => {
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [sharingPet, setSharingPet] = useState<Pet | null>(null);
  const [location, setLocation] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [activeTab, setActiveTab] = useState<'pets' | 'posts' | 'following'>('pets');
  
  // New Social Sync State
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [syncStep, setSyncStep] = useState<SyncStep>('select');
  const [selectedSyncProvider, setSelectedSyncProvider] = useState<any>(null);
  const [syncHandle, setSyncHandle] = useState('');
  const [linkedSocials, setLinkedSocials] = useState<SocialLink[]>(owner.socialLinks);

  const handleEscalate = (pet: Pet) => {
    if (pet.status === AlertType.LOST) {
      onUpdateStatus(pet.id, AlertType.NONE);
    } else {
      setEditingPetId(pet.id);
    }
  };

  const confirmLost = async (pet: Pet) => {
    setIsEscalating(true);
    try {
      await geminiService.generateAlertGraphic(
        pet.name, 
        pet.species, 
        pet.breed, 
        pet.photo, 
        'LOST', 
        location
      );
      
      onUpdateStatus(pet.id, AlertType.LOST, location);
      alert(`Priority alert broadcasted to: ${linkedSocials.map(l => l.platform).join(', ')} 📢`);
    } catch (e) {
      onUpdateStatus(pet.id, AlertType.LOST, location);
    } finally {
      setIsEscalating(false);
      setEditingPetId(null);
      setLocation('');
    }
  };

  const startSyncFlow = () => {
    setShowSyncMenu(true);
    setSyncStep('select');
    setSyncHandle('');
  };

  const initiateSyncProvider = (provider: any) => {
    setSelectedSyncProvider(provider);
    setSyncStep('link');
  };

  const handleAuthorizeSync = () => {
    setSyncStep('loading');
    setTimeout(() => {
      const newLink: SocialLink = { 
        platform: selectedSyncProvider.name as any, 
        handle: `${selectedSyncProvider.handlePrefix}${syncHandle}` 
      };
      setLinkedSocials(prev => [...prev.filter(l => l.platform !== newLink.platform), newLink]);
      setSyncStep('select');
      setShowSyncMenu(false);
      setSelectedSyncProvider(null);
      setSyncHandle('');
    }, 2000);
  };

  const myPosts = posts.filter(p => p.ownerId === owner.id);
  const myPets = pets.filter(p => p.ownerId === owner.id);

  const followedOwners = Array.from(followedOwnerIds).map(id => {
    const representativePet = pets.find(p => p.ownerId === id);
    return {
      id,
      name: representativePet ? `Friend of ${representativePet.name}` : `Pack Leader ${id}`,
      avatar: representativePet?.photo || `https://picsum.photos/seed/${id}/150`
    };
  });

  const socialProviders = [
    { name: 'Instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', icon: '📸', handlePrefix: '@' },
    { name: 'TikTok', color: 'bg-black', icon: '🎵', handlePrefix: '@' },
    { name: 'Twitter', color: 'bg-[#1DA1F2]', icon: '🐦', handlePrefix: '@' },
    { name: 'Facebook', color: 'bg-[#1877F2]', icon: '👥', handlePrefix: 'fb.com/' },
  ];

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center border border-gray-100">
        <div className="relative inline-block mb-4">
          <img src={owner.avatar} className="w-24 h-24 rounded-full border-4 border-red-100 object-cover shadow-lg" alt={owner.name} />
          <button className="absolute bottom-0 right-0 bg-red-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">{owner.name}</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Authorized Pack Leader</p>
        
        <div className="flex justify-center gap-8 my-4">
          <div className="text-center">
            <p className="font-bold text-gray-800 text-lg">{owner.followersCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-lg">{(owner.followingCount || 0) + followedOwnerIds.size}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Following</p>
          </div>
        </div>

        {/* Linked Social Accounts with Sync Flow */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 relative overflow-hidden min-h-[120px] flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authorized Platforms</p>
            <button 
              onClick={startSyncFlow}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
            >
              + Link New
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {linkedSocials.map(link => (
              <span key={link.platform} className="bg-white text-gray-600 px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-2 border border-gray-100 shadow-sm animate-in zoom-in-95">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-red-400">{link.platform}</span> {link.handle}
              </span>
            ))}
            {linkedSocials.length === 0 && !showSyncMenu && (
              <p className="text-[10px] text-gray-400 italic py-1 text-center w-full">No accounts authorized yet.</p>
            )}
          </div>

          {showSyncMenu && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-2">
              <button 
                onClick={() => setShowSyncMenu(false)}
                className="absolute top-2 right-2 text-gray-400 p-2 hover:text-gray-600"
              >
                <Icons.Plus className="rotate-45" />
              </button>

              {syncStep === 'select' && (
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Social Provider</p>
                  <div className="grid grid-cols-4 gap-3">
                    {socialProviders.map(p => (
                      <button 
                        key={p.name}
                        onClick={() => initiateSyncProvider(p)}
                        className={`w-12 h-12 ${p.color} rounded-xl text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-transform`}
                      >
                        {p.icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {syncStep === 'link' && selectedSyncProvider && (
                <div className="w-full max-w-[240px] animate-in slide-in-from-right-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 ${selectedSyncProvider.color} rounded-lg flex items-center justify-center text-white text-sm shadow-md`}>
                      {selectedSyncProvider.icon}
                    </div>
                    <p className="text-xs font-bold text-gray-800">Link {selectedSyncProvider.name}</p>
                  </div>
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <span className="text-[10px] font-bold text-gray-400">{selectedSyncProvider.handlePrefix}</span>
                    </div>
                    <input 
                      type="text" 
                      value={syncHandle}
                      onChange={(e) => setSyncHandle(e.target.value)}
                      placeholder="username"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-red-400 font-bold"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSyncStep('authorize')}
                      disabled={!syncHandle}
                      className="flex-1 bg-red-500 text-white py-2 rounded-xl text-[10px] font-bold shadow-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button onClick={() => setSyncStep('select')} className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-xl text-[10px] font-bold">Back</button>
                  </div>
                </div>
              )}

              {syncStep === 'authorize' && selectedSyncProvider && (
                <div className="text-center space-y-3 animate-in zoom-in-95">
                  <div className={`w-12 h-12 ${selectedSyncProvider.color} rounded-xl mx-auto flex items-center justify-center text-white text-xl shadow-xl`}>
                    {selectedSyncProvider.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">Authorize Account?</h4>
                    <p className="text-[9px] text-gray-500 max-w-[180px] mx-auto mt-1 font-medium">Link {selectedSyncProvider.handlePrefix}{syncHandle} to enable priority broadcasts.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAuthorizeSync}
                      className="bg-red-500 text-white px-5 py-2 rounded-xl text-[10px] font-bold shadow-lg"
                    >
                      Allow
                    </button>
                    <button 
                      onClick={() => setSyncStep('link')}
                      className="bg-gray-100 text-gray-500 px-5 py-2 rounded-xl text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {syncStep === 'loading' && (
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[9px] font-bold text-gray-400 animate-pulse tracking-widest uppercase">Syncing Profiles...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setSharingPet(myPets[0] || null)}
            className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            Broadcast Pack Highlight
          </button>
          <button 
            onClick={onLogout}
            className="w-full bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100"
          >
            Sign Out
          </button>
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-800 text-lg">{pet.name}</h4>
                        {pet.status === AlertType.LOST && (
                          <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse uppercase">Urgent</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                    </div>
                    <button 
                      onClick={() => setSharingPet(pet)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleEscalate(pet)}
                      disabled={isEscalating}
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
                <div className="mt-4 p-5 bg-white rounded-[2rem] border-2 border-red-200 shadow-xl animate-in slide-in-from-top-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500 text-white p-2 rounded-xl animate-pulse">
                      <Icons.Alert />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-600 leading-tight">Priority Emergency Escalation</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Broadcast to all authorized socials</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <Icons.MapPin />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Last seen location (e.g. Central Park)..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Broadcasting to:</p>
                      <div className="flex flex-wrap gap-2">
                        {linkedSocials.map(l => (
                          <div key={l.platform} className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-1 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-700">{l.platform}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        disabled={isEscalating || !location}
                        onClick={() => confirmLost(pet)} 
                        className="flex-1 bg-red-500 text-white py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transform active:scale-95 transition-all"
                      >
                        {isEscalating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Broadcasting...
                          </>
                        ) : 'Broadcast Emergency'}
                      </button>
                      <button 
                        onClick={() => setEditingPetId(null)} 
                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl text-sm font-bold hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 px-2">
          {followedOwners.map(o => (
            <div key={o.id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <img src={o.avatar} className="w-12 h-12 rounded-full object-cover border" alt="" />
                <span className="font-bold text-gray-800 text-sm">{o.name}</span>
              </div>
              <button className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-xl text-xs font-bold border">Following</button>
            </div>
          ))}
        </div>
      )}

      {sharingPet && (
        <ShareModal 
          type="PROFILE"
          pet={sharingPet}
          onClose={() => setSharingPet(null)}
        />
      )}
    </div>
  );
};

export default Profile;
