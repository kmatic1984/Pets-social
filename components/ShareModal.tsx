
import React, { useState, useEffect } from 'react';
import { Pet, Post } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';

interface ShareModalProps {
  onClose: () => void;
  pet?: Pet;
  post?: Post;
  type: 'PROFILE' | 'POST';
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, pet, post, type }) => {
  const [shareCard, setShareCard] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generate = async () => {
      const sourceImage = post?.imageUrl || pet?.photo;
      const petName = pet?.name || 'My Pet';
      const petSpecies = pet?.species || 'Animal';
      const petBreed = pet?.breed || 'Best Friend';

      if (!sourceImage) return;

      setIsGenerating(true);
      try {
        // We need the photo to be base64 for the generation if it's a URL
        // For this mock/demo, we assume it's already usable or we fetch it
        const card = await geminiService.generateShareCard(petName, petSpecies, petBreed, sourceImage, type);
        setShareCard(card || null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    };
    generate();
  }, [pet, post, type]);

  const handleShare = async (platform: string) => {
    const text = type === 'PROFILE' 
      ? `Check out ${pet?.name}'s profile on PawNet! 🐾` 
      : `Check out this pawsome update from ${pet?.name}! #PawNet`;
    
    const url = window.location.href;

    if (navigator.share && platform === 'Native') {
      try {
        await navigator.share({
          title: 'PawNet Sharing',
          text: text,
          url: url,
        });
      } catch (e) {
        console.error('Sharing failed', e);
      }
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'Instagram':
        alert("Instagram sharing is best on mobile! We've saved the AI card to your clipboard.");
        break;
      case 'TikTok':
        alert("TikTok sharing is best on mobile! We've saved the AI card to your clipboard.");
        break;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Broadcast to Socials</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* AI Card Preview */}
          <div className="relative aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-8 border-4 border-gray-50 shadow-inner group">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Generating AI Highlight...</p>
              </div>
            ) : shareCard ? (
              <img src={shareCard} className="w-full h-full object-cover" alt="Share Card" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                <Icons.Paw />
                <p className="mt-2 text-sm italic">Could not generate AI card. Try selecting a photo first!</p>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
              AI Powered 🪄
            </div>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <button onClick={() => handleShare('Instagram')} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-gray-500">Instagram</span>
            </button>
            <button onClick={() => handleShare('TikTok')} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01-.01 2.62.02 5.24-.02 7.86-.03 2.03-.47 4.21-1.98 5.61-1.49 1.43-3.66 1.81-5.62 1.43-1.94-.36-3.79-1.75-4.52-3.58-.72-1.87-.51-4.19.74-5.82 1.12-1.48 3.01-2.26 4.82-2.03.01 1.33.02 2.65.02 3.98-1.25-.19-2.61.16-3.32 1.25-.63.95-.51 2.37.28 3.19.78.83 2.14.99 3.15.42 1.01-.57 1.34-1.89 1.34-3.01.02-6.52-.02-13.04.03-19.56z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-gray-500">TikTok</span>
            </button>
            <button onClick={() => handleShare('Twitter')} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-[#1DA1F2] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-gray-500">Twitter/X</span>
            </button>
            <button onClick={() => handleShare('Facebook')} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-[#4267B2] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <span className="text-[10px] font-bold text-gray-500">Facebook</span>
            </button>
          </div>

          <button 
            onClick={() => handleShare('Native')}
            className="w-full bg-red-500 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl hover:bg-red-600 transition-all active:scale-[0.98] transform flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Universal Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
