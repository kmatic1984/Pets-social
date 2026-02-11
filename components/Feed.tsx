
import React, { useState } from 'react';
import { Post, Pet, AlertType } from '../types';
import { Icons } from '../constants';
import EditPostModal from './EditPostModal';
import VideoPlayer from './VideoPlayer';

interface FeedProps {
  posts: Post[];
  pets: Pet[];
  onUpdatePost: (post: Post) => void;
  onToggleLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ posts, pets, onUpdatePost, onToggleLike, onComment }) => {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const getPetInfo = (petId: string) => pets.find(p => p.id === petId);

  const handleLikeClick = (postId: string) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    onToggleLike(postId);
  };

  const handleCommentClick = (postId: string) => {
    const response = confirm("Would you like to leave a quick mock comment? (increments count)");
    if (response) {
      onComment(postId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Escalated Stories (Mockup) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {pets.map(pet => (
          <div key={pet.id} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className={`w-16 h-16 rounded-full p-1 border-2 ${pet.status === AlertType.LOST ? 'border-red-500 animate-pulse' : 'border-yellow-400'}`}>
              <img src={pet.photo} className="w-full h-full rounded-full object-cover" alt={pet.name} />
            </div>
            <span className="text-xs font-medium text-gray-600">{pet.name}</span>
          </div>
        ))}
      </div>

      {posts.map(post => {
        const pet = getPetInfo(post.petId);
        return (
          <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <button 
                onClick={() => setEditingPost(post)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                aria-label="Edit Post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
              </button>
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

              {/* AI Sticker Badge Overlay */}
              {post.stickerUrl && (
                <div className="absolute bottom-4 right-4 w-24 h-24 drop-shadow-2xl z-20 hover:scale-110 transition-transform cursor-pointer">
                  <img src={post.stickerUrl} className="w-full h-full object-contain" alt="AI Sticker" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex gap-4 mb-3">
                <button 
                  onClick={() => handleLikeClick(post.id)}
                  className={`flex items-center gap-1.5 transition-all transform active:scale-125 ${post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={post.isLiked ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-transform duration-200"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span className="text-sm font-bold">{post.likes}</span>
                </button>
                <button 
                  onClick={() => handleCommentClick(post.id)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-sm font-bold">{post.comments}</span>
                </button>
                <button className="ml-auto text-gray-600 hover:text-green-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                <span className="font-bold mr-2 text-gray-900">{pet?.name}</span>
                {post.content}
              </p>
              <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-bold">
                {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(post.timestamp)}
              </p>
            </div>
          </article>
        );
      })}

      {editingPost && (
        <EditPostModal 
          post={editingPost} 
          pet={getPetInfo(editingPost.petId)}
          onClose={() => setEditingPost(null)}
          onSave={onUpdatePost}
        />
      )}
    </div>
  );
};

export default Feed;
