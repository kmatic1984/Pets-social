
import React, { useState } from 'react';
import { Post, Pet } from '../types';
import { geminiService } from '../services/geminiService';

interface EditPostModalProps {
  post: Post;
  pet: Pet | undefined;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, pet, onClose, onSave }) => {
  const [content, setContent] = useState(post.content);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiCaption = async () => {
    if (!pet) return;
    setIsGenerating(true);
    // In a real app we might pass the existing image too
    const caption = await geminiService.generateCaption(pet.name, pet.species);
    setContent(caption);
    setIsGenerating(false);
  };

  const handleSave = () => {
    onSave({ ...post, content });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Edit Post</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <img src={pet?.photo} className="w-10 h-10 rounded-full object-cover border" alt="" />
            <div>
              <p className="font-bold text-sm text-gray-800">{pet?.name}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Editing Content</p>
            </div>
          </div>

          <div className="relative mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-700 min-h-[150px] focus:ring-2 focus:ring-red-400 outline-none resize-none"
              placeholder="What's on your pet's mind?"
            />
            <button
              type="button"
              onClick={handleAiCaption}
              disabled={isGenerating}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? '🪄 Thinking...' : '🪄 Magic Polish'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-red-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
