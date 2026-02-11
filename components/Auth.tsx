
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Owner, SocialLink, Pet, AlertType } from '../types';
import { geminiService } from '../services/geminiService';

interface AuthProps {
  onLogin: (user: Owner, extractedPet?: Pet) => void;
}

type AuthStep = 'welcome' | 'link' | 'authorize' | 'scanning' | 'found' | 'loading';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [step, setStep] = useState<AuthStep>('welcome');
  const [selectedProvider, setSelectedProvider] = useState<{ name: string; icon: string; color: string; handlePrefix: string } | null>(null);
  const [handle, setHandle] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState('Initiating Deep Scan...');

  const socialProviders = [
    { name: 'Instagram', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', icon: '📸', handlePrefix: '@' },
    { name: 'TikTok', color: 'bg-black', icon: '🎵', handlePrefix: '@' },
    { name: 'Twitter', color: 'bg-[#1DA1F2]', icon: '🐦', handlePrefix: '@' },
    { name: 'Facebook', color: 'bg-[#1877F2]', icon: '👥', handlePrefix: 'fb.com/' },
  ];

  const initiateProvider = (provider: typeof socialProviders[0]) => {
    setSelectedProvider(provider);
    setHandle('');
    setStep('link');
  };

  const handleLinkNext = () => {
    if (!handle) return;
    setStep('authorize');
  };

  const handleDeny = () => {
    setStep('welcome');
    setSelectedProvider(null);
  };

  const runExtraction = async () => {
    setStep('scanning');
    const statuses = [
      `Connecting to ${selectedProvider?.name} API...`,
      `Fetching bio for ${handle}...`,
      'Analyzing recent profile activity...',
      'Running AI Pet Detection on photos...',
      'Mapping animal relationship graph...',
      'Extracting breed and species details...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        setScanStatus(statuses[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    const data = await geminiService.extractPetFromSocialProfile(handle, selectedProvider?.name || 'Social Media');
    setExtractedData(data);
    setStep('found');
  };

  const handleAuthorize = () => {
    if (!selectedProvider) return;
    runExtraction();
  };

  const handleFinalize = () => {
    setStep('loading');
    setIsAuthenticating(true);
    
    setTimeout(() => {
      const mockLinks: SocialLink[] = [
        { platform: selectedProvider!.name as any, handle: `${selectedProvider!.handlePrefix}${handle}` }
      ];
      
      const ownerId = `owner-${Date.now()}`;
      const newUser: Owner = {
        id: ownerId,
        name: handle || 'New Pack Leader',
        avatar: `https://picsum.photos/seed/${handle}/150`,
        socialLinks: mockLinks,
        followingCount: 0,
        followersCount: 0,
        isOpenToDating: true
      };

      let extractedPet: Pet | undefined;
      if (extractedData) {
        extractedPet = {
          id: `pet-${Date.now()}`,
          name: extractedData.petName,
          species: extractedData.species,
          breed: extractedData.breed,
          birthday: extractedData.birthday,
          photo: `https://picsum.photos/seed/${extractedData.petName}/600/600`,
          ownerId: ownerId,
          status: AlertType.NONE,
          bio: extractedData.bio,
          recentSocialActivity: extractedData.recentActivity
        };
      }
      
      onLogin(newUser, extractedPet);
      setIsAuthenticating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-100 rounded-full blur-[100px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse [animation-delay:2s]" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        
        {step === 'welcome' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="bg-red-500 p-6 rounded-[2rem] text-white shadow-2xl shadow-red-200 mb-8 transform hover:rotate-6 transition-transform cursor-pointer active:scale-90">
                <Icons.Paw />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">PawNet</h1>
              <p className="text-gray-500 font-medium max-w-[240px]">The premier social network for animals and their humans.</p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Auto-Link Your Account To Join</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {socialProviders.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => initiateProvider(p)}
                    className={`${p.color} text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-95 transition-all group`}
                  >
                    <span className="text-2xl group-hover:animate-bounce">{p.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <span className="relative bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Or continue with</span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => initiateProvider({ name: 'Google', icon: '🔍', color: 'bg-white', handlePrefix: '' })}
                  className="w-full bg-white border-2 border-gray-50 py-4 rounded-2xl flex items-center justify-center gap-4 hover:border-red-100 hover:bg-red-50/10 transition-all active:scale-[0.98] group"
                >
                  <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5" alt="Google" />
                  <span className="font-bold text-gray-700">Google Account</span>
                </button>

                <button 
                  onClick={() => initiateProvider({ name: 'Apple', icon: '🍎', color: 'bg-black', handlePrefix: '' })}
                  className="w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all active:scale-[0.98] group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.61-3.19 1.61-1.12 0-1.63-.64-2.88-.64-1.27 0-1.85.62-2.88.62-1.03 0-2.07-.63-3.11-1.61C2.93 18.25 1.5 14.86 1.5 11.83c0-3.3 2.05-5.06 4.02-5.06 1.05 0 1.95.62 2.67.62.68 0 1.48-.62 2.76-.62 1.34 0 2.45.69 3.19 1.76-2.9 1.71-2.43 5.4 0 6.64-.69 1.75-1.62 3.52-2.84 5.11zM12.03 5.34c.04-2.28 1.9-4.14 4.09-4.14 0 2.22-1.86 4.14-4.09 4.14z"/></svg>
                  <span className="font-bold">Apple ID</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'link' && selectedProvider && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center mb-8">
              <div className={`w-20 h-20 ${selectedProvider.color} rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl mb-6`}>
                {selectedProvider.icon === '🔍' ? <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-10 h-10" alt="Google" /> : selectedProvider.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Your {selectedProvider.name}</h2>
              <p className="text-gray-500 text-sm">Enter your social handle to sync your profile and pack data.</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">{selectedProvider.handlePrefix}</span>
                </div>
                <input 
                  type="text" 
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-400 transition-all font-bold text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleLinkNext}
                  disabled={!handle}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  Verify & Connect
                </button>
                <button 
                  onClick={() => setStep('welcome')}
                  className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'authorize' && selectedProvider && (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Icons.Paw />
              </div>
              <div className="text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 8 4 4-4 4"/><path d="M2 12h20"/><path d="m6 16-4-4 4-4"/></svg>
              </div>
              <div className={`w-12 h-12 ${selectedProvider.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {selectedProvider.icon === '🔍' ? <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" alt="Google" /> : selectedProvider.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Auto-Import Enabled</h2>
            <p className="text-gray-500 text-sm mb-8 px-4">
              PawNet will automatically extract your pet's details and recent social activities from <span className="font-bold text-gray-800">{selectedProvider.name}</span>.
            </p>

            <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 p-1.5 rounded-full mt-0.5">
                   <Icons.Sparkles />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">AI Pet Extraction</p>
                  <p className="text-[10px] text-gray-500">Extract Name, Species, Breed, and Birthday automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 p-1.5 rounded-full mt-0.5">
                   <Icons.Video />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Activity Sync</p>
                  <p className="text-[10px] text-gray-500">Sync recent social media milestones as pet life updates.</p>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleAuthorize}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-all active:scale-95"
              >
                Start Auto-Import
              </button>
              <button 
                onClick={handleDeny}
                className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
              >
                Deny
              </button>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-[6px] border-red-100 border-t-red-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-red-500">
                <Icons.Magic />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Scanning Social Profile...</h2>
              <p className="text-sm text-gray-400 font-medium animate-pulse">{scanStatus}</p>
            </div>
          </div>
        )}

        {step === 'found' && extractedData && (
          <div className="animate-in zoom-in duration-500 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-green-100 p-1 mb-6 relative">
              <img src={`https://picsum.photos/seed/${extractedData.petName}/150`} className="w-full h-full rounded-full object-cover" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet Detected!</h2>
            <p className="text-gray-500 text-sm mb-6">We found <span className="font-bold text-red-500">{extractedData.petName}</span> on your {selectedProvider?.name}.</p>

            <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 space-y-4 text-left">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Extracted Bio</p>
                <p className="text-xs text-gray-700 italic">"{extractedData.bio}"</p>
              </div>
              <div className="flex justify-between border-t pt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Species</p>
                  <p className="text-xs font-bold text-gray-800">{extractedData.species}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Breed</p>
                  <p className="text-xs font-bold text-gray-800">{extractedData.breed}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recent Social Milestone</p>
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <span className="text-xl">🏆</span>
                  <p className="text-xs font-medium text-gray-800">{extractedData.recentActivity}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinalize}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-red-600 transition-all active:scale-95"
            >
              Confirm & Enter Pack
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Finalizing Sync...</h2>
              <p className="text-sm text-gray-400 font-medium animate-pulse">Establishing secure Paws-Link</p>
            </div>
          </div>
        )}

        <div className="pt-8 text-center">
          <p className="text-[10px] text-gray-400 px-6 leading-relaxed">
            By linking, you agree to our <span className="text-red-500 font-bold hover:underline cursor-pointer">Terms of Paws</span> and <span className="text-red-500 font-bold hover:underline cursor-pointer">Cookie Policy</span>.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-gray-400 text-xs font-bold animate-pulse">
        <Icons.Heart /> Join millions of linked packs
      </div>
    </div>
  );
};

export default Auth;
