import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Search, Plus, MessageCircle } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ChatParticipant, Conversation } from '../contexts/MessageContext';

const MessageModal: React.FC = () => {
  const { 
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
  } = useMessage();
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const { users: allUsers } = useData();

  const [newMessage, setNewMessage] = useState('');
  const [showNewChatPanel, setShowNewChatPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<ChatParticipant[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(conv => conv.id === activeConversationId);
  const currentMessages = currentConversation ? getConversationMessages(currentConversation.id) : [];
  const currentParticipants = currentConversation ? getConversationParticipants(currentConversation.id) : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversationId && currentUser) {
      sendMessage(activeConversationId, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = allUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleParticipantSelect = (user: DataUser) => {
    setSelectedParticipants(prev => 
      prev.some(p => p.id === user.id)
        ? prev.filter(p => p.id !== user.id)
        : [...prev, { id: user.id, name: user.name }]
    );
  };

  const handleStartNewChat = () => {
    if (selectedParticipants.length > 0 && currentUser) {
      const participantIds = selectedParticipants.map(p => p.id);
      const newConvId = startNewConversation(participantIds);
      setActiveConversationId(newConvId);
      setShowNewChatPanel(false);
      setSelectedParticipants([]);
      setSearchTerm('');
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (!currentUser) return 'Unknown Chat';

    const otherParticipants = conv.participants.filter(p => p.id !== currentUser.id);
    if (otherParticipants.length === 0) return currentUser.name; // Chat with self
    if (otherParticipants.length === 1) return otherParticipants[0].name;
    return otherParticipants.map(p => p.name).join(', ');
  };

  if (!showMessageModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl h-[90vh] rounded-lg shadow-xl flex ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        {/* Left Panel: Conversation List / New Chat */}
        <div className={`w-1/3 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
            <h3 className="text-lg font-semibold">
              {showNewChatPanel ? (language === 'ko' ? '새 채팅' : 'New Chat') : (language === 'ko' ? '대화' : 'Conversations')}
            </h3>
            <button
              onClick={() => setShowNewChatPanel(prev => !prev)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={showNewChatPanel ? (language === 'ko' ? '대화 목록' : 'Conversation List') : (language === 'ko' ? '새 채팅 시작' : 'Start New Chat')}
            >
              {showNewChatPanel ? <MessageCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {showNewChatPanel ? (
            <div className="flex-1 flex flex-col p-4">
              <input
                type="text"
                placeholder={language === 'ko' ? '사용자 검색...' : 'Search users...'}
                className={`w-full p-2 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredUsers.length === 0 && <p className="text-center text-gray-500">{language === 'ko' ? '사용자를 찾을 수 없습니다.' : 'No users found.'}</p>}
                {filteredUsers.map(user => (
                  <label key={user.id} className="flex items-center p-2 rounded-lg hover:bg-blue-500/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.some(p => p.id === user.id)}
                      onChange={() => handleParticipantSelect(user)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="flex-1">{user.name}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleStartNewChat}
                disabled={selectedParticipants.length === 0}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'ko' ? '채팅 시작' : 'Start Chat'}
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && <p className="text-center text-gray-500 p-4">{language === 'ko' ? '아직 대화가 없습니다.' : 'No conversations yet.'}</p>}
              {conversations.sort((a, b) => {
                const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
                const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
                return timeB - timeA; // Sort by most recent message
              }).map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex items-center p-4 cursor-pointer border-b ${activeConversationId === conv.id ? (isDarkMode ? 'bg-blue-700' : 'bg-blue-100') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}`}
                >
                  <User className="w-8 h-8 mr-3 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-semibold">{getConversationName(conv)}</p>
                    {conv.messages.length > 0 && (
                      <p className="text-sm text-gray-500 truncate">
                        {conv.messages[conv.messages.length - 1].text}
                      </p>
                    )}
                  </div>
                  {conv.messages.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {formatTime(conv.messages[conv.messages.length - 1].timestamp)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Chat View */}
        <div className="w-2/3 flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold">
              {activeConversationId ? getConversationName(currentConversation!) : (language === 'ko' ? '대화를 선택하거나 시작하세요' : 'Select or start a conversation')}
            </h3>
            <button
              onClick={() => setShowMessageModal(false)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversationId ? (
              currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-lg ${message.senderId === currentUser?.id
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs opacity-70">
                        {allUsers.find(u => u.id === message.senderId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {language === 'ko' ? '왼쪽에서 대화를 선택하거나 새 채팅을 시작하세요.' : 'Select a conversation from the left or start a new one.'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeConversationId && (
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ko' ? '메시지를 입력하세요...' : 'Type a message...'}
                  className={`flex-1 p-2 rounded-lg border resize-none h-10 ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;