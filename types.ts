
export enum AlertType {
  NONE = 'NONE',
  LOST = 'LOST',
  BIRTHDAY = 'BIRTHDAY',
  ADOPTION = 'ADOPTION',
}

export enum EventType {
  DATE = 'DATE',
  PLAYDATE = 'PLAYDATE',
  COMMUNITY = 'COMMUNITY',
}

export interface PetAlert {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'VET' | 'MED' | 'GROOM' | 'OTHER';
}

export interface SocialLink {
  platform: 'Instagram' | 'TikTok' | 'Twitter' | 'Facebook';
  handle: string;
}

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  socialLinks: SocialLink[];
  followingCount?: number;
  followersCount?: number;
  isOpenToDating?: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthday: string;
  photo: string;
  ownerId: string;
  status: AlertType;
  lastSeenLocation?: string;
  bio?: string;
  customAlerts?: PetAlert[];
  recentSocialActivity?: string; // New field for extracted social activity
}

export interface Post {
  id: string;
  petId: string;
  ownerId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  stickerUrl?: string;
  location?: string;
  likes: number;
  comments: number;
  timestamp: Date;
  isEscalated?: boolean;
  isLiked?: boolean;
}

export interface PetEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  organizerId: string;
  attendeesCount: number;
  type: EventType;
  imageUrl: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
  groundingUrls?: { title: string; uri: string }[];
}

export interface Conversation {
  id: string;
  participantId: string; // The owner ID we are chatting with
  participantName: string;
  participantAvatar: string;
  lastMessage?: string;
  isAssistant?: boolean;
}
