import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides current user info
import { useData } from './DataContext'; // Import useData to get allUsers
import { User as DataUser } from './DataContext'; // Alias to avoid conflict with local User type

export interface ChatParticipant {
  id: string;
  name: string;
  // Add other relevant user info if needed, e.g., avatar, email
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'sent' | 'received'; // 'sent' if current user is sender, 'received' otherwise
}

export type ConversationType = 'individual' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: ChatParticipant[];
  messages: Message[];
  name: string; // For group chats, or derived from participant names for individual chats
  lastMessageTimestamp?: string;
}

interface MessageContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  showMessageModal: boolean;
  setShowMessageModal: (show: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
  startNewConversation: (participantIds: string[], name?: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getConversationParticipants: (conversationId: string) => ChatParticipant[];
  addParticipantsToConversation: (conversationId: string, newParticipantIds: string[]) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { user: currentUser } = useAuth(); // Get current authenticated user
  const { users: allUsers } = useData(); // Get all users from DataContext
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Helper to get participant names for conversation naming
  const getParticipantNames = useCallback((participants: ChatParticipant[], currentUserId: string) => {
    if (participants.length === 1) {
      return participants[0].name; // 1:1 chat with self, or just one participant
    }
    const otherParticipants = participants.filter(p => p.id !== currentUserId);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name; // 1:1 chat with another user
    }
    return otherParticipants.map(p => p.name).join(', '); // Group chat
  }, []);

  const startNewConversation = useCallback((participantIds: string[], name?: string): string => {
    if (!currentUser) {
      console.error("No current user to start a conversation.");
      return '';
    }

    const allParticipantIds = Array.from(new Set([...participantIds, currentUser.id]));
    const participants: ChatParticipant[] = allParticipantIds
      .map(pId => allUsers.find(u => u.id === pId))
      .filter((p): p is DataUser => p !== undefined)
      .map(p => ({ id: p.id, name: p.name }));

    // Check for existing individual conversation
    if (participants.length === 2) { // 1:1 chat
      const existingConversation = conversations.find(conv =>
        conv.type === 'individual' &&
        conv.participants.some(p => p.id === currentUser.id) &&
        conv.participants.some(p => p.id === participants.find(p => p.id !== currentUser.id)?.id)
      );
      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
        return existingConversation.id;
      }
    }

    const newConversationId = `conv-${Date.now()}`;
    const conversationName = name || getParticipantNames(participants, currentUser.id);

    const newConversation: Conversation = {
      id: newConversationId,
      type: participants.length > 2 ? 'group' : 'individual', // If more than 2 participants (including self), it's a group
      participants,
      messages: [],
      name: conversationName,
      lastMessageTimestamp: new Date().toISOString(),
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversationId);
    return newConversationId;
  }, [currentUser, conversations, getParticipantNames, allUsers]);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    if (!currentUser) {
      console.error("No current user to send a message.");
      return;
    }
    if (!text.trim()) return;

    setConversations(prevConversations =>
      prevConversations.map(conv => {
        if (conv.id === conversationId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
            type: 'sent', // Always 'sent' from the current user's perspective
          };
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessageTimestamp: newMessage.timestamp,
          };
        }
        return conv;
      }).sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA; // Sort by most recent message
      })
    );
  }, [currentUser]);

  const getConversationMessages = useCallback((conversationId: string): Message[] => {
    return conversations.find(conv => conv.id === conversationId)?.messages || [];
  }, [conversations]);

  const getConversationParticipants = useCallback((conversationId: string): ChatParticipant[] => {
    return conversations.find(conv => conv.id === conversationId)?.participants || [];
  }, [conversations]);

  const addParticipantsToConversation = useCallback((conversationId: string, newParticipantIds: string[]) => {
    setConversations(prevConversations =>
      prevConversations.map(conv => {
        if (conv.id === conversationId && conv.type === 'group') {
          const existingParticipantIds = new Set(conv.participants.map(p => p.id));
          const participantsToAdd: ChatParticipant[] = newParticipantIds
            .filter(pId => !existingParticipantIds.has(pId))
            .map(pId => allUsers.find(u => u.id === pId))
            .filter((p): p is DataUser => p !== undefined)
            .map(p => ({ id: p.id, name: p.name }));

          if (participantsToAdd.length > 0) {
            const updatedParticipants = [...conv.participants, ...participantsToAdd];
            return {
              ...conv,
              participants: updatedParticipants,
              name: getParticipantNames(updatedParticipants, currentUser?.id || ''), // Update group name
            };
          }
        }
        return conv;
      })
    );
  }, [currentUser, getParticipantNames, allUsers]);

  // Dummy data for initial testing
  // useEffect(() => {
  //   if (currentUser && conversations.length === 0) {
  //     const dummyUser1: ChatParticipant = { id: 'dummy1', name: '더미 사용자 1' };
  //     const dummyUser2: ChatParticipant = { id: 'dummy2', name: '더미 사용자 2' };
  //     const dummyUser3: ChatParticipant = { id: 'dummy3', name: '더미 사용자 3' };

  //     const initialConversations: Conversation[] = [
  //       {
  //         id: 'conv-1',
  //         type: 'individual',
  //         participants: [currentUser, dummyUser1],
  //         name: dummyUser1.name,
  //         messages: [
  //           { id: 'msg-1', conversationId: 'conv-1', senderId: dummyUser1.id, text: '안녕하세요!', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'received' },
  //           { id: 'msg-2', conversationId: 'conv-1', senderId: currentUser.id, text: '네, 안녕하세요!', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'sent' },
  //         ],
  //         lastMessageTimestamp: new Date(Date.now() - 300000).toISOString(),
  //       },
  //       {
  //         id: 'conv-2',
  //         type: 'group',
  //         participants: [currentUser, dummyUser2, dummyUser3],
  //         name: '팀 프로젝트',
  //         messages: [
  //           { id: 'msg-3', conversationId: 'conv-2', senderId: dummyUser2.id, text: '오늘 회의는 몇 시인가요?', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'received' },
  //           { id: 'msg-4', conversationId: 'conv-2', senderId: currentUser.id, text: '오후 3시입니다.', timestamp: new Date(Date.now() - 450000).toISOString(), type: 'sent' },
  //           { id: 'msg-5', conversationId: 'conv-2', senderId: dummyUser3.id, text: '알겠습니다!', timestamp: new Date(Date.now() - 100000).toISOString(), type: 'received' },
  //         ],
  //         lastMessageTimestamp: new Date(Date.now() - 100000).toISOString(),
  //       },
  //     ];
  //     setConversations(initialConversations);
  //   }
  // }, [currentUser, conversations.length]);


  return (
    <MessageContext.Provider value={{
      conversations,
      activeConversationId,
      showMessageModal,
      setShowMessageModal,
      setActiveConversationId,
      startNewConversation,
      sendMessage,
      getConversationMessages,
      getConversationParticipants,
      addParticipantsToConversation,
    }}>
      {children}
    </MessageContext.Provider>
  );
};