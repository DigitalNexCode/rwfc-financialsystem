import { faker } from '@faker-js/faker';

// --- INTERFACES ---
export interface ClientMessage {
  id: number;
  from: 'client' | 'staff';
  text: string;
  timestamp: string;
  author: string;
  isEncrypted?: boolean;
}

export interface Conversation {
  id: number;
  clientId: number;
  clientName: string;
  clientAvatar: string;
  status: 'unassigned' | 'assigned';
  assigneeId?: number;
  assigneeName?: string;
  messages: ClientMessage[];
  lastMessageTimestamp: Date;
}

// --- MOCK DATABASE ---
let conversations: Conversation[] = [];
// Correctly generate initials as faker.person.initials is not available.
let clients = Array.from({ length: 15 }, (_, i) => {
  const companyName = faker.company.name();
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: i + 1,
    name: companyName,
    avatar: initials,
  };
});


const initializeConversations = () => {
  if (conversations.length > 0) return;

  // Create some unassigned conversations
  for (let i = 0; i < 3; i++) {
    const client = faker.helpers.arrayElement(clients);
    const firstMessageTime = faker.date.recent({ days: 2 });
    conversations.push({
      id: i + 1,
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar,
      status: 'unassigned',
      lastMessageTimestamp: firstMessageTime,
      messages: [
        {
          id: 1,
          from: 'client',
          text: faker.lorem.sentence(),
          timestamp: firstMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: client.name,
        },
      ],
    });
  }

  // Create some assigned conversations
  for (let i = 3; i < 7; i++) {
    const client = faker.helpers.arrayElement(clients);
    const staffMember = { id: faker.number.int({ min: 1, max: 5 }), name: faker.person.fullName() };
    const firstMessageTime = faker.date.recent({ days: 5 });

    conversations.push({
      id: i + 1,
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar,
      status: 'assigned',
      assigneeId: staffMember.id,
      assigneeName: staffMember.name,
      lastMessageTimestamp: faker.date.recent({ days: 1 }),
      messages: [
        { id: 1, from: 'client', text: faker.lorem.sentence(), timestamp: firstMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), author: client.name },
        { id: 2, from: 'staff', text: faker.lorem.sentence(), timestamp: faker.date.recent({ refDate: firstMessageTime }).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), author: staffMember.name, isEncrypted: true },
        { id: 3, from: 'client', text: faker.lorem.sentence(), timestamp: faker.date.recent({ days: 1 }).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), author: client.name },
      ],
    });
  }
  
  conversations.sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
};

// Initialize once
initializeConversations();

// --- API FUNCTIONS ---
export const getUnassignedConversations = (): Conversation[] => {
  return conversations.filter(c => c.status === 'unassigned');
};

export const getConversationByClientId = (clientId: number): Conversation | undefined => {
  return conversations.find(c => c.clientId === clientId);
};

export const claimConversation = (conversationId: number, staffId: number, staffName: string): void => {
  const conversation = conversations.find(c => c.id === conversationId);
  if (conversation && conversation.status === 'unassigned') {
    conversation.status = 'assigned';
    conversation.assigneeId = staffId;
    conversation.assigneeName = staffName;
  }
};

export const addMessageToConversation = (conversationId: number, message: Omit<ClientMessage, 'id'>): void => {
  const conversation = conversations.find(c => c.id === conversationId);
  if (conversation) {
    const newMessage = { ...message, id: conversation.messages.length + 1 };
    conversation.messages.push(newMessage);
    conversation.lastMessageTimestamp = new Date();
  }
};

export const findOrCreateConversationForClient = (clientId: number, clientName: string, clientAvatar: string): Conversation => {
  let conversation = conversations.find(c => c.clientId === clientId);
  if (!conversation) {
    conversation = {
      id: conversations.length + 1,
      clientId,
      clientName,
      clientAvatar,
      status: 'unassigned',
      messages: [],
      lastMessageTimestamp: new Date(),
    };
    conversations.unshift(conversation);
  }
  return conversation;
};
