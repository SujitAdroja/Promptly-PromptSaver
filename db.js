// db.js - shared IndexedDB helper

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PromptDB", 3);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("prompts")) {
        const promptsStore = db.createObjectStore("prompts", {
          keyPath: "id",
          autoIncrement: true,
        });
        promptsStore.createIndex("categoryId", "categoryId", { unique: false });
      }

      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("theme")) {
        db.createObjectStore("theme", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function savePrompt(prompt) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readwrite");
    const store = tx.objectStore("prompts");
    store.add({
      text: { value: prompt.value, tagName: prompt.tagName },
      createdAt: Date.now(),
      isFavorite: false,
      category: prompt.category,
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function getAllPrompts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readonly");
    const store = tx.objectStore("prompts");
    const request = store.getAll();
    request.onsuccess = () => {
      // Sort by createdAt descending (latest first)
      const sorted = request.result.sort((a, b) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function clearPrompts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readwrite");
    const store = tx.objectStore("prompts");
    store.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function deletePrompt(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readwrite");
    const store = tx.objectStore("prompts");
    store.delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function searchPrompts(query) {
  const prompts = await getAllPrompts();
  const searchTerm = query.toLowerCase();

  return prompts.filter((prompt) => {
    return (
      prompt.text.value.toLowerCase().includes(searchTerm) ||
      // prompt.category.toLowerCase().includes(searchTerm) ||
      prompt.text.tagName.toLowerCase().includes(searchTerm)
    );
  });
}

// Toggle favorite
async function toggleFavorite(id, isFavorite) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readwrite");
    const store = tx.objectStore("prompts");

    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (!item) return resolve(null);

      item.isFavorite = isFavorite;
      store.put(item);
      tx.oncomplete = () => resolve(item);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getFavorites() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readonly");
    const store = tx.objectStore("prompts");

    const results = [];
    const request = store.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.isFavorite) results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function addCategory(name) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readwrite");
    const store = tx.objectStore("categories");

    const request = store.add({ name, createdAt: Date.now() });

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getAllCategories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readonly");
    const store = tx.objectStore("categories");
    const request = store.getAll();
    request.onsuccess = () => {
      const sorted = request.result.sort((a, b) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}
async function toggleCategory(id, category) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readwrite");
    const store = tx.objectStore("prompts");

    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (!item) return resolve(null);

      item.category = category;
      store.put(item);
      tx.oncomplete = () => resolve(item);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getPromptsByCategory(categoryName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("prompts", "readonly");
    const store = tx.objectStore("prompts");

    const results = [];
    const request = store.openCursor();

    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        // Check if the prompt belongs to the given category
        if (cursor.value.category === categoryName) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results); // return all results after iteration
      }
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

async function removeCategory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readwrite");
    const store = tx.objectStore("categories");

    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}
async function removeItemFromCategory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("categories", "readwrite");
    const store = tx.objectStore("categories");

    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveTheme(value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("theme", "readwrite");
    const store = tx.objectStore("theme");
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      const addReq = store.add({ dark: value });

      addReq.onsuccess = () => resolve(addReq.result);
      addReq.onerror = (e) => reject(e.target.error);
    };

    clearReq.onerror = (e) => reject(e.target.error);
  });
}

async function getTheme() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("theme", "readwrite");
    const store = tx.objectStore("theme");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result[0]);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}
