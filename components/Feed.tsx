
import React, { useState } from 'react';
import { Post, Pet, AlertType } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import VideoPlayer from './VideoPlayer';
import ShareModal from './ShareModal';

interface FeedProps {
  posts: Post[];
  pets: Pet[];
  onUpdatePost: (post: Post) => void;
  onToggleLike: (postId: string) => void;
  onComment: (postId: string) => void;
  currentOwnerId?: string;
}

const Feed: React.FC<FeedProps> = ({ posts, pets, onUpdatePost, onToggleLike, onComment, currentOwnerId }) => {
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isMagicWorking, setIsMagicWorking] = useState(false);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  
  const getPetInfo = (petId: string) => pets.find(p => p.id === petId);

  // Sorting posts: Escalated (LOST) posts come first
  const sortedPosts = [...posts].sort((a, b) => {
    const petA = getPetInfo(a.petId);
    const petB = getPetInfo(b.petId);
    if (petA?.status === AlertType.LOST && petB?.status !== AlertType.LOST) return -1;
    if (petA?.status !== AlertType.LOST && petB?.status === AlertType.LOST) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Active Escalated Stories (Mockup) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {pets.filter(p => p.status !== AlertType.NONE).map(pet => (
          <div key={pet.id} className="flex-shrink-0 flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`w-16 h-16 rounded-full p-1 border-2 transition-transform group-hover:scale-110 ${
              pet.status === AlertType.LOST ? 'border-red-500 animate-pulse' : 'border-yellow-400'
            }`}>
              <img src={pet.photo} className="w-full h-full rounded-full object-cover" alt={pet.name} />
            </div>
            <span className={`text-[10px] font-bold ${pet.status === AlertType.LOST ? 'text-red-500' : 'text-yellow-600'}`}>
              {pet.status === AlertType.LOST ? 'URGENT' : 'BDAY!'}
            </span>
          </div>
        ))}
      </div>

      {sortedPosts.map(post => {
        const pet = getPetInfo(post.petId);
        const isOwner = currentOwnerId === post.ownerId;
        const isEditing = inlineEditingId === post.id;
        const isUrgent = pet?.status === AlertType.LOST;

        return (
          <article 
            key={post.id} 
            className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border transition-all hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              isUrgent ? 'border-red-400 ring-2 ring-red-100 ring-offset-4' : 'border-gray-100'
            }`}
          >
            {isUrgent && (
              <div className="bg-red-500 text-white text-[10px] font-bold py-2 px-4 flex items-center justify-between uppercase tracking-widest">
                <span>Priority Emergency Broadcast</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  Live Sync
                </div>
              </div>
            )}

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={pet?.photo} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt={pet?.name} />
                <div>
                  <h3 className="font-bold text-gray-800 leading-tight">{pet?.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{pet?.breed}</p>
                    {post.location && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                        <Icons.MapPin />
                        <span>{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="aspect-square w-full bg-black relative">
              {post.videoUrl ? (
                <VideoPlayer src={post.videoUrl} className="w-full h-full" />
              ) : post.imageUrl ? (
                <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post content" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-sm px-10 text-center">
                  This post has no media.
                </div>
              )}
              
              {isUrgent && (
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-red-400 flex items-center gap-2">
                  <Icons.Alert /> Missing Alert
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex gap-5 mb-4">
                <button 
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-2 transition-all transform active:scale-125 ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                >
                  <Icons.Heart />
                  <span className="text-sm font-bold">{post.likes}</span>
                </button>
                <button 
                  onClick={() => onComment(post.id)}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <Icons.Message />
                  <span className="text-sm font-bold">{post.comments}</span>
                </button>
                <button 
                  onClick={() => setSharingPost(post)}
                  className="ml-auto text-gray-600 hover:text-green-500 transition-colors"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                <span className="font-bold mr-2 text-gray-900">{pet?.name}</span>
                {post.content}
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(post.timestamp)}
                </p>
                {isUrgent && (
                   <button className="text-[10px] font-bold text-red-500 underline underline-offset-4 decoration-red-200">Help Spread Word</button>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {sharingPost && (
        <ShareModal 
          type="POST"
          post={sharingPost}
          pet={getPetInfo(sharingPost.petId)}
          onClose={() => setSharingPost(null)}
        />
      )}
    </div>
  );
};

export default Feed;
