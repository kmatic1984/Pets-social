
import React, { useState, useRef } from 'react';
import { Pet, Post } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import VideoPlayer from './VideoPlayer';

interface CreatePostProps {
  pets: Pet[];
  ownerId: string;
  onPostCreated: (post: Post) => void;
}

const PREDEFINED_THEMES = [
  { label: 'Birthday 🎂', value: 'Birthday' },
  { label: 'Holiday 🎄', value: 'Holiday' },
  { label: 'Adventure 🏔️', value: 'Adventure' },
  { label: 'Space 🚀', value: 'Space Explorer' },
  { label: 'Super Hero 🦸', value: 'Superhero' },
  { label: 'Pirate 🏴‍☠️', value: 'Pirate' },
  { label: 'Royal 👑', value: 'Royal King or Queen' },
  { label: 'Gaming 🎮', value: 'Gamer' },
];

const CreatePost: React.FC<CreatePostProps> = ({ pets, ownerId, onPostCreated }) => {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  
  const [stickerTheme, setStickerTheme] = useState('');
  const [showStickerInput, setShowStickerInput] = useState(false);
  const [generatedStickers, setGeneratedStickers] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isVideo) { setVideo(result); setImage(null); }
        else { setImage(result); setVideo(null); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsProcessing(true);
    setProcessingMsg('Fetching current location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real production app, we would reverse geocode these coordinates.
        // For this demo, we'll format them nicely and use a mock locality.
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        setLocationTag(`Near ${coords}`);
        setIsProcessing(false);
        setProcessingMsg('');
      },
      (error) => {
        console.error(error);
        setIsProcessing(false);
        setProcessingMsg('');
        alert("Paws up! We couldn't fetch your location. Please check your permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleAiEdit = async () => {
    if (!image || !editPrompt) return;
    setIsProcessing(true);
    setProcessingMsg('Applying edits...');
    const result = await geminiService.editImage(editPrompt, image);
    if (result) {
      setImage(result);
      setEditPrompt('');
      setShowEditInput(false);
    }
    setIsProcessing(false);
    setProcessingMsg('');
  };

  const handleResonateBg = async () => {
    if (!image || !content) {
      alert("Please write a caption first so the AI knows what vibe to resonate with! 🪄");
      return;
    }
    setIsProcessing(true);
    setProcessingMsg('Resonating background...');
    const result = await geminiService.resonateBackground(content, image);
    if (result) {
      setImage(result);
    }
    setIsProcessing(false);
    setProcessingMsg('');
  };

  const handleAnimate = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProcessingMsg('Animating photo (Veo)...');
    const result = await geminiService.animatePhoto(image, content);
    if (result) {
      setVideo(result);
      setImage(null);
    }
    setIsProcessing(false);
    setProcessingMsg('');
  };

  const handleGenerateSticker = async (themeToUse?: string) => {
    const finalTheme = themeToUse || stickerTheme;
    const sourceImage = image || pets.find(p => p.id === selectedPetId)?.photo;
    if (!sourceImage || !finalTheme) return;
    
    setIsProcessing(true);
    setProcessingMsg(`Crafting ${finalTheme} sticker...`);
    const result = await geminiService.generateSticker(finalTheme, sourceImage);
    if (result) {
      setGeneratedStickers(prev => [result, ...prev]);
      setStickerUrl(result);
      setStickerTheme('');
      setShowStickerInput(false);
    }
    setIsProcessing(false);
    setProcessingMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !image && !video) return;
    onPostCreated({
      id: `p-${Date.now()}`,
      petId: selectedPetId,
      ownerId,
      content,
      imageUrl: image || undefined,
      videoUrl: video || undefined,
      stickerUrl: stickerUrl || undefined,
      location: locationTag || undefined,
      likes: 0,
      comments: 0,
      timestamp: new Date(),
    });
    setContent(''); setImage(null); setVideo(null); setStickerUrl(null); setLocationTag(null);
    alert('Shared successfully and synced to linked socials! 🐾');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold text-gray-800">Create New Post</h2>
        <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Sync Active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Who is posting?</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {pets.map(pet => (
                <button key={pet.id} type="button" onClick={() => setSelectedPetId(pet.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${selectedPetId === pet.id ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <img src={pet.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <span className="text-sm font-bold text-gray-800">{pet.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button 
              type="button" 
              onClick={handleGetLocation}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${locationTag ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
            >
              <Icons.MapPin />
              {locationTag ? locationTag : 'Tag Location'}
            </button>
            {locationTag && (
              <button 
                type="button" 
                onClick={() => setLocationTag(null)}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's happening?" className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-gray-700 min-h-[120px] focus:ring-2 focus:ring-red-400 outline-none resize-none border" />
          <div className="absolute bottom-3 right-3 flex gap-2">
             <span className="text-[10px] font-bold text-gray-300 uppercase">Resonates with AI tools below</span>
          </div>
        </div>

        {/* Media Upload Section */}
        <div>
          <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          {image ? (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden aspect-video border group shadow-inner bg-gray-50">
                <img src={image} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImage(null)} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-md z-10 hover:bg-red-500 transition-colors"><Icons.Plus /></button>
                
                {stickerUrl && (
                  <div className="absolute bottom-6 right-6 w-24 h-24 drop-shadow-2xl animate-bounce">
                    <img src={stickerUrl} className="w-full h-full object-contain" alt="Sticker" />
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-red-600 animate-pulse">{processingMsg || 'AI is working...'}</p>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button type="button" title="Resonate Background" onClick={handleResonateBg} className="bg-white p-4 rounded-full text-purple-500 shadow-xl transform hover:scale-110 transition-transform active:scale-95"><Icons.Sparkles /></button>
                   <button type="button" title="Edit with Prompt" onClick={() => setShowEditInput(!showEditInput)} className="bg-white p-4 rounded-full text-gray-800 shadow-xl transform hover:scale-110 transition-transform active:scale-95"><Icons.Magic /></button>
                   <button type="button" title="Animate (Veo)" onClick={handleAnimate} className="bg-white p-4 rounded-full text-red-500 shadow-xl transform hover:scale-110 transition-transform active:scale-95"><Icons.Video /></button>
                   <button type="button" title="Generate Sticker" onClick={() => setShowStickerInput(!showStickerInput)} className="bg-white p-4 rounded-full text-yellow-500 shadow-xl transform hover:scale-110 transition-transform active:scale-95">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                   </button>
                </div>
              </div>
              
              {showEditInput && (
                <div className="flex gap-2 animate-in slide-in-from-top-2">
                  <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="E.g. Add a retro film grain..." className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  <button type="button" onClick={handleAiEdit} className="bg-red-500 text-white px-4 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform">Apply</button>
                </div>
              )}
            </div>
          ) : video ? (
            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-lg">
              <VideoPlayer src={video} className="w-full h-full" loop={false} />
              <button type="button" onClick={() => setVideo(null)} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-red-500 transition-colors"><Icons.Plus /></button>
              {isProcessing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                  <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-red-600">{processingMsg}</p>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-red-400 hover:text-red-400 transition-all group bg-gray-50/50">
              <div className="bg-white p-5 rounded-2xl shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                <Icons.Video />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold block">Upload Photo or Video</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">AI Resonance available for images</span>
              </div>
            </button>
          )}
        </div>

        {/* AI Stickers Section */}
        <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <span className="text-yellow-500 text-lg">✨</span> Pet Stickers
            </h3>
            <button 
              type="button" 
              onClick={() => setShowStickerInput(!showStickerInput)}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors underline decoration-red-200 underline-offset-4"
            >
              {showStickerInput ? 'Close Themes' : '+ Create AI Sticker'}
            </button>
          </div>

          {showStickerInput && (
            <div className="mb-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleGenerateSticker(t.value)}
                    disabled={isProcessing}
                    className="bg-white border border-yellow-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 p-3 bg-white rounded-2xl shadow-sm border border-yellow-100">
                <input 
                  type="text" 
                  value={stickerTheme} 
                  onChange={(e) => setStickerTheme(e.target.value)} 
                  placeholder="Or enter custom style: Cyberpunk, Neon..." 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <button 
                  type="button" 
                  onClick={() => handleGenerateSticker()}
                  disabled={isProcessing || !stickerTheme}
                  className="bg-yellow-500 text-white px-5 rounded-xl text-xs font-bold disabled:opacity-50 shadow-md active:scale-95 transition-transform"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-2 min-h-[90px]">
            {generatedStickers.map((url, i) => (
              <button 
                key={i} 
                type="button" 
                onClick={() => setStickerUrl(url === stickerUrl ? null : url)}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all p-2 bg-white shadow-sm ${stickerUrl === url ? 'border-yellow-500 bg-yellow-50 scale-110 rotate-3 z-10' : 'border-transparent hover:border-gray-200'}`}
              >
                <img src={url} className="w-full h-full object-contain" alt="" />
              </button>
            ))}
            {generatedStickers.length === 0 && !showStickerInput && (
              <div className="text-[10px] text-gray-400 italic flex items-center justify-center w-full h-12">
                Use AI to turn your pet into a custom sticker! 🐾
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={isProcessing} className="w-full bg-red-500 text-white py-5 rounded-3xl font-bold text-lg shadow-xl hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 transform hover:-translate-y-1">
          {isProcessing ? processingMsg || 'AI is working...' : 'Broadcast to All Socials'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
