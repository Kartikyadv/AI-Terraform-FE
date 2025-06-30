import { openDB } from 'idb';

const DB_NAME = 'chatDB';
const STORE_NAME = 'messages';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

export const addMessageToDB = async (message) => {
  const db = await initDB();
  await db.add(STORE_NAME, message);
};

export const getAllMessagesFromDB = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const clearAllMessagesFromDB = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
