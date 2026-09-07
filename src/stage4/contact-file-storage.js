export async function fileDatabase(action, id, file) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open("hunter-contact-files", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        "files",
        action === "get" ? "readonly" : "readwrite",
      );
      const store = transaction.objectStore("files");
      if (action === "deleteMany") id.forEach((key) => store.delete(key));
      const request =
        action === "deleteMany"
          ? null
          : action === "put"
            ? store.put(file, id)
            : action === "delete"
              ? store.delete(id)
              : store.get(id);
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function removeContactFileData(files) {
  if (!files.length) return;
  await fileDatabase(
    "deleteMany",
    files.map((file) => file.id),
  );
}
