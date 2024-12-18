export class IndexedDBService {
  private dbName = "personalCloudDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("files")) {
          const store = db.createObjectStore("files", { keyPath: "id" });
          store.createIndex("syncStatus", "syncStatus", { unique: false });
          store.createIndex("userId", "userId", { unique: false });
        }
      };
    });
  }

  async saveFile(file: File, userId: string): Promise<string> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          syncStatus: "pending",
          userId,
          createdAt: new Date(),
        };

        const transaction = this.db!.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");
        const request = store.add(fileData);

        request.onsuccess = () => resolve(fileData.id);
        request.onerror = () => reject(request.error);
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async getFile(id: string): Promise<any> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingFiles(userId: string): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");
      const index = store.index("syncStatus");
      const request = index.getAll("pending");

      request.onsuccess = () => {
        const files = request.result.filter((file) => file.userId === userId);
        resolve(files);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncStatus(
    id: string,
    status: "synced" | "failed"
  ): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      const request = store.get(id);

      request.onsuccess = () => {
        const file = request.result;
        file.syncStatus = status;
        const updateRequest = store.put(file);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
