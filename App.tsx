
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertType, Pet, Post, Owner, PetEvent, EventType, PetAlert } from './types';
import { Icons, COLORS } from './constants';
import Feed from './components/Feed';
import Profile from './components/Profile';
import CreatePost from './components/CreatePost';
import Search from './components/Search';
import AlertBanner from './components/AlertBanner';
import Messages from './components/Messages';
import PawDate from './components/PawDate';
import Auth from './components/Auth';

const INITIAL_PETS: Pet[] = [
  { 
    id: 'pet-1', 
    name: 'Luna', 
    species: 'Cat', 
    breed: 'Maine Coon', 
    birthday: '2020-05-15', 
    photo: 'https://picsum.photos/seed/catluna/600/600', 
    ownerId: 'owner-1', 
    status: AlertType.NONE,
    customAlerts: [
      { id: 'al-1', title: 'Vet Checkup', date: '2024-05-20', type: 'VET', description: 'Annual rabies shot and general physical.' }
    ]
  },
  { 
    id: 'pet-2', 
    name: 'Cooper', 
    species: 'Dog', 
    breed: 'Golden Retriever', 
    birthday: '2018-11-20', 
    photo: 'https://picsum.photos/seed/dogcooper/600/600', 
    ownerId: 'owner-1', 
    status: AlertType.NONE,
    customAlerts: [
      { id: 'al-2', title: 'Heartworm Meds', date: '2024-05-01', type: 'MED' }
    ]
  },
  { id: 'pet-3', name: 'Milo', species: 'Dog', breed: 'Beagle', birthday: '2021-02-10', photo: 'https://picsum.photos/seed/milo/600/600', ownerId: 'owner-2', status: AlertType.NONE },
  { id: 'pet-4', name: 'Oliver', species: 'Cat', breed: 'Siamese', birthday: '2019-08-22', photo: 'https://picsum.photos/seed/oliver/600/600', ownerId: 'owner-3', status: AlertType.NONE },
  { id: 'pet-adopt-1', name: 'Buddy', species: 'Dog', breed: 'Labrador Mix', birthday: '2022-01-10', photo: 'https://picsum.photos/seed/buddyadopt/600/600', ownerId: 'owner-4', status: AlertType.ADOPTION, bio: 'A high-energy pup looking for an active family to go on runs with! Super friendly and loves kids.' },
  { id: 'pet-adopt-2', name: 'Whiskers', species: 'Cat', breed: 'Tabby', birthday: '2021-06-05', photo: 'https://picsum.photos/seed/whiskersadopt/600/600', ownerId: 'owner-5', status: AlertType.ADOPTION, bio: 'Quiet, independent, but loves a good head scratch. Whiskers is looking for a calm forever home.' }
];

const INITIAL_POSTS: Post[] = [
  { id: 'p-1', petId: 'pet-1', ownerId: 'owner-1', content: "Moth hunting level: Pro. 😼", imageUrl: 'https://picsum.photos/seed/catpost1/800/800', likes: 42, comments: 5, timestamp: new Date() },
  { id: 'p-3', petId: 'pet-2', ownerId: 'owner-1', content: "Big stick energy! 🐕💨", videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', likes: 88, comments: 14, timestamp: new Date() }
];

const INITIAL_EVENTS: PetEvent[] = [
  {
    id: 'e-1',
    title: 'Puppy Speed Dating',
    description: 'Find a playmate for your pup and maybe a date for yourself! Complimentary treats for all.',
    location: 'Central Bark Park',
    date: new Date(Date.now() + 86400000 * 3),
    organizerId: 'owner-2',
    attendeesCount: 12,
    type: EventType.DATE,
    imageUrl: 'https://picsum.photos/seed/speeddate/800/400'
  },
  {
    id: 'e-2',
    title: 'Cat Cafe Singles Mixer',
    description: 'A cozy evening for cat lovers to connect over coffee and kittens.',
    location: 'Meow & Mingle Cafe',
    date: new Date(Date.now() + 86400000 * 5),
    organizerId: 'owner-3',
    attendeesCount: 8,
    type: EventType.DATE,
    imageUrl: 'https://picsum.photos/seed/catmixer/800/400'
  }
];

interface Notification {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
}

const Toast: React.FC<{ notification: Notification; onClear: () => void }> = ({ notification, onClear }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(onClear, 5000);
    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <div 
      onClick={() => { navigate('/messages'); onClear(); }}
      className="fixed top-4 left-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl border border-red-100 p-4 flex items-center gap-4 cursor-pointer animate-in slide-in-from-top-10 duration-500 hover:scale-[1.02] active:scale-[0.98] transition-transform md:left-auto md:right-4 md:w-80"
    >
      <img src={notification.senderAvatar} className="w-12 h-12 rounded-full object-cover border-2 border-red-50" alt="" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm truncate">{notification.senderName}</h4>
        <p className="text-gray-500 text-xs truncate">{notification.text}</p>
      </div>
      <button className="text-gray-300 hover:text-gray-500" onClick={(e) => { e.stopPropagation(); onClear(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
};

const Navbar: React.FC<{ unreadCount: number }> = ({ unreadCount }) => {
  const location = useLocation();
  const activeClass = "text-red-500";
  const inactiveClass = "text-gray-400";

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass z-50 px-6 py-4 flex justify-around items-center rounded-t-3xl shadow-2xl md:top-0 md:bottom-auto md:flex-col md:h-screen md:w-20 md:rounded-none md:rounded-r-3xl md:py-10">
      <Link to="/" className={location.pathname === '/' ? activeClass : inactiveClass}><Icons.Home /></Link>
      <Link to="/search" className={location.pathname === '/search' ? activeClass : inactiveClass}><Icons.Search /></Link>
      <Link to="/pawdate" className={location.pathname === '/pawdate' ? activeClass : inactiveClass}><Icons.Heart /></Link>
      <Link to="/create" className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"><Icons.Plus /></Link>
      <Link to="/messages" className={`relative ${location.pathname === '/messages' ? activeClass : inactiveClass}`}>
        <Icons.Message />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </Link>
      <Link to="/profile" className={location.pathname === '/profile' ? activeClass : inactiveClass}><Icons.User /></Link>
    </nav>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Owner | null>(null);
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [events, setEvents] = useState<PetEvent[]>(INITIAL_EVENTS);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followedOwnerIds, setFollowedOwnerIds] = useState<Set<string>>(new Set(['owner-2']));

  const addPost = (newPost: Post) => setPosts([newPost, ...posts]);
  const updatePost = (updatedPost: Post) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  
  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentlyLiked = !!p.isLiked;
        return {
          ...p,
          likes: currentlyLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !currentlyLiked
        };
      }
      return p;
    }));
  };

  const incrementComments = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: p.comments + 1 };
      }
      return p;
    }));
  };

  const updatePetStatus = (petId: string, status: AlertType, location?: string) => setPets(prev => prev.map(p => p.id === petId ? { ...p, status, lastSeenLocation: location } : p));

  const handleAddPetAlert = (petId: string, alert: PetAlert) => {
    setPets(prev => prev.map(p => {
      if (p.id === petId) {
        return {
          ...p,
          customAlerts: [...(p.customAlerts || []), alert]
        };
      }
      return p;
    }));
  };

  const handleRemovePetAlert = (petId: string, alertId: string) => {
    setPets(prev => prev.map(p => {
      if (p.id === petId) {
        return {
          ...p,
          customAlerts: p.customAlerts?.filter(a => a.id !== alertId)
        };
      }
      return p;
    }));
  };

  const handleIncomingMessage = (text: string, senderName: string, senderAvatar: string) => {
    if (window.location.hash !== '#/messages') {
      setNotification({
        id: Date.now().toString(),
        text,
        senderName,
        senderAvatar
      });
      setUnreadCount(prev => prev + 1);
    }
  };

  const toggleFollow = (ownerId: string) => {
    setFollowedOwnerIds(prev => {
      const next = new Set(prev);
      if (next.has(ownerId)) next.delete(ownerId);
      else next.add(ownerId);
      return next;
    });
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendeesCount: e.attendeesCount + 1 } : e));
    alert("You're on the list! Don't forget to bring your fuzzy plus-one! 🐾❤️");
  };

  const handleLogin = (user: Owner, extractedPet?: Pet) => {
    if (extractedPet) {
      setPets(prev => [extractedPet, ...prev]);
      
      // Also create a first post for the extracted activity
      if (extractedPet.recentSocialActivity) {
        const firstPost: Post = {
          id: `p-extracted-${Date.now()}`,
          petId: extractedPet.id,
          ownerId: user.id,
          content: `Extracted Social Update: ${extractedPet.recentSocialActivity} 🐾✨`,
          imageUrl: extractedPet.photo,
          likes: 5,
          comments: 1,
          timestamp: new Date()
        };
        setPosts(prev => [firstPost, ...prev]);
      }
    } else if (user.id !== 'owner-1') {
      // Basic fallback if no pet extracted
      const starterPet: Pet = {
         id: `pet-${Date.now()}`,
         name: 'Sparky',
         species: 'Dog',
         breed: 'Puppy',
         birthday: '2023-01-01',
         photo: 'https://picsum.photos/seed/sparky/600/600',
         ownerId: user.id,
         status: AlertType.NONE
      };
      setPets(prev => [starterPet, ...prev]);
    }
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen pb-24 md:pb-0 md:pl-20">
        {notification && <Toast notification={notification} onClear={() => setNotification(null)} />}
        <AlertBanner pets={pets} />
        <main className="max-w-xl mx-auto px-4 pt-4">
          <header className="flex items-center justify-between mb-6 pt-2">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-red-500 p-2 rounded-xl text-white"><Icons.Paw /></span>
              PawNet
            </h1>
          </header>
          <Routes>
            <Route path="/" element={<Feed posts={posts} pets={pets} onUpdatePost={updatePost} onToggleLike={toggleLike} onComment={incrementComments} currentOwnerId={currentUser.id} />} />
            <Route path="/search" element={<Search pets={pets} followedOwnerIds={followedOwnerIds} onToggleFollow={toggleFollow} currentOwnerId={currentUser.id} />} />
            <Route path="/pawdate" element={<PawDate events={events} pets={pets} onJoinEvent={handleJoinEvent} currentOwnerId={currentUser.id} />} />
            <Route path="/create" element={<CreatePost pets={pets.filter(p => p.ownerId === currentUser.id)} ownerId={currentUser.id} onPostCreated={addPost} />} />
            <Route path="/messages" element={<Messages currentOwner={currentUser} onIncomingMessage={handleIncomingMessage} onMessagesViewed={() => setUnreadCount(0)} />} />
            <Route path="/profile" element={
              <Profile 
                owner={currentUser} 
                pets={pets} 
                posts={posts} 
                onUpdateStatus={updatePetStatus} 
                onUpdatePost={updatePost} 
                followedOwnerIds={followedOwnerIds} 
                onAddAlert={handleAddPetAlert}
                onRemoveAlert={handleRemovePetAlert}
                onLogout={handleLogout}
              />
            } />
          </Routes>
        </main>
        <Navbar unreadCount={unreadCount} />
      </div>
    </HashRouter>
  );
};

export default App;
