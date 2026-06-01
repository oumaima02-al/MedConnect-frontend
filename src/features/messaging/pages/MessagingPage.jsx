import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewConversationModal from '../components/NewConversationModal';

export default function MessagingPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId || user?.sub || null;

  const [activeConv, setActiveConv] = useState(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);

  const {
    conversations,
    loading: convsLoading,
    error: convsError,
    refresh: refreshConversations,
    archive,
    pin,
    mute,
  } = useConversations(currentUserId);

  const {
    messages,
    loading: msgsLoading,
    sending,
    error: msgsError,
    hasMore,
    searchQuery,
    isSearching,
    send,
    edit,
    remove,
    markRead,
    toggleReaction,
    search,
    clearSearch,
    loadMore,
    notifyTyping,
  } = useMessages(activeConv?.id, currentUserId);

  const handleSelectConv = useCallback((conv) => {
    setActiveConv(conv);
  }, []);

  const handleNewConvCreated = useCallback((conv) => {
    refreshConversations();
    setActiveConv(conv);
  }, [refreshConversations]);

  // Guard: no userId → show warning
  if (!currentUserId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔐</div>
          <h3 style={{ margin: '0 0 8px', fontFamily: "'Sora', sans-serif", color: '#111827' }}>Session requise</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Votre identifiant utilisateur est introuvable. Reconnectez-vous pour accéder à la messagerie.
          </p>
          <a href="/login" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#2ecc71', color: 'white', borderRadius: 50, textDecoration: 'none', fontWeight: 700 }}>
            Se reconnecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // subtract topbar height
      overflow: 'hidden',
      background: 'white',
      borderRadius: 24,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── Left: Conversation list ── */}
      <div style={{
        width: 320,
        flexShrink: 0,
        borderRight: '1px solid #f3f4f6',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ConversationList
          conversations={conversations}
          loading={convsLoading}
          error={convsError}
          activeConvId={activeConv?.id}
          currentUserId={currentUserId}
          onSelectConv={handleSelectConv}
          onArchive={archive}
          onPin={pin}
          onMute={mute}
          onNewConversation={() => setShowNewConvModal(true)}
        />
      </div>

      {/* ── Right: Chat window ── */}
      <ChatWindow
        conversation={activeConv}
        messages={messages}
        loading={msgsLoading}
        sending={sending}
        error={msgsError}
        hasMore={hasMore}
        searchQuery={searchQuery}
        isSearching={isSearching}
        currentUserId={currentUserId}
        onSend={send}
        onEdit={edit}
        onDelete={remove}
        onReact={toggleReaction}
        onLoadMore={loadMore}
        onSearch={search}
        onClearSearch={clearSearch}
        onMarkRead={markRead}
      />

      {/* ── New conversation modal ── */}
      {showNewConvModal && (
        <NewConversationModal
          currentUserId={currentUserId}
          onClose={() => setShowNewConvModal(false)}
          onCreated={handleNewConvCreated}
        />
      )}
    </div>
  );
}
