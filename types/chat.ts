export interface ChatAuthor {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  author: ChatAuthor;
  replyToId: string | null;
  replyTo: { id: string; content: string; author: { fullName: string } } | null;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'file' | 'voice' | 'video' | 'sticker' | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  attachmentDuration: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
