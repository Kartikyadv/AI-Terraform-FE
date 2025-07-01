// chatDB.js
import { openDB } from 'idb';

// Initialize DB and create 'messages' store if needed
export const initDB = async () => {
  return openDB('ChatDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
};

// Save messages array to IndexedDB
export const saveMessages = async (messages) => {
  const db = await initDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');
  await store.clear(); // clear old
  for (const msg of messages) {
    await store.add(msg); // auto-generates ID
  }
  await tx.done;
};

// Load all messages from IndexedDB
export const loadMessages = async () => {
  const db = await initDB();
  return db.getAll('messages');
};


export const updateFilesInMessage = async (updatedFiles) => {
  const db = await initDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');
  const allMsgs = await store.getAll();

  // Find latest assistant message with files
  const target = [...allMsgs].reverse().find((m) => m.sender === "assistant" && m.files);
  if (!target) return;

  target.files = updatedFiles;
  await store.put(target); // Replace in DB
  await tx.done;
};