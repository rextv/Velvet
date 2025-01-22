const HASH_URL =
  "https://raw.githubusercontent.com/rextv/kill-switch/refs/heads/main/hash.json";
const HASH_STORAGE_KEY = "velvet_hash";
const AUTH_STORAGE_KEY = "awds_auth_token";
const HASH_TIMESTAMP_KEY = "velvet_hash_timestamp";
const HASH_FETCH_TIMEOUT = 5000; // 5 seconds timeout for fetch
const HASH_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Global variable to store the correct password hash
let CORRECT_PASSWORD_HASH = null;
let isHashFetching = false;
let hashFetchPromise = null;

class GetHash {
  constructor() {
    this.isActive = false;
    this.lastCheck = null;
  }

  async fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async fetchAndSetHash() {
    // If already fetching, return the existing promise
    if (isHashFetching && hashFetchPromise) {
      return hashFetchPromise;
    }

    isHashFetching = true;
    hashFetchPromise = (async () => {
      try {
        const response = await this.fetchWithTimeout(
          `${HASH_URL}?t=${Date.now()}`,
          HASH_FETCH_TIMEOUT
        );
        const data = await response.json();

        CORRECT_PASSWORD_HASH = data.hash;
        localStorage.setItem(HASH_STORAGE_KEY, CORRECT_PASSWORD_HASH);
        localStorage.setItem(HASH_TIMESTAMP_KEY, Date.now().toString());
        this.lastCheck = new Date();
        console.log("Hash updated and stored in localStorage");
      } catch (error) {
        console.error("Failed to fetch hash:", error);
        // If fetch fails, use stored hash if available
        const storedHash = localStorage.getItem(HASH_STORAGE_KEY);
        if (storedHash) {
          CORRECT_PASSWORD_HASH = storedHash;
          console.log("Using stored hash due to fetch failure");
        }
      } finally {
        isHashFetching = false;
        hashFetchPromise = null;
      }
    })();

    return hashFetchPromise;
  }

  isHashExpired() {
    const timestamp = localStorage.getItem(HASH_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp);
    return age > HASH_MAX_AGE;
  }

  async start() {
    try {
      // Try to get hash from localStorage first
      const storedHash = localStorage.getItem(HASH_STORAGE_KEY);
      
      if (!storedHash || this.isHashExpired()) {
        // Show loading indicator if needed
        document.body.style.cursor = 'wait';
        await this.fetchAndSetHash();
        document.body.style.cursor = 'default';
        return;
      }

      CORRECT_PASSWORD_HASH = storedHash;
      console.log("Using hash from localStorage");

      // Update hash if we're on index.html or terminal.html
      const currentPage = window.location.pathname;
      if (currentPage.endsWith('index.html') || currentPage.endsWith('terminal.html')) {
        this.fetchAndSetHash(); // Don't await - let it update in background
      }
    } catch (error) {
      console.error("Error in start:", error);
      // Fallback to stored hash if available
      const storedHash = localStorage.getItem(HASH_STORAGE_KEY);
      if (storedHash) {
        CORRECT_PASSWORD_HASH = storedHash;
        console.log("Using fallback stored hash");
      }
    }
  }
}

// Initialize hash checking only after page is fully loaded
window.addEventListener("load", async () => {
  const ghash = new GetHash();
  await ghash.start();
  console.log("Ready for password verification!");
});

function hashPassword(password) {
  return CryptoJS.SHA256(password.toLowerCase()).toString();
}

function verifyPassword(password) {
  const storedHash = localStorage.getItem(HASH_STORAGE_KEY);
  if (!storedHash) {
    console.error("No hash available. Please wait while we fetch it...");
    return false;
  }
  const hashedPassword = hashPassword(password);
  return hashedPassword === storedHash;
}

function setAuthToken(token) {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

function clearAuthToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function checkAuth() {
  const token = getAuthToken();
  const storedHash = localStorage.getItem(HASH_STORAGE_KEY);

  if (!storedHash) {
    console.error("No hash available. Redirecting to login...");
    window.location.href = "/index.html";
    return false;
  }

  if (!token || token !== storedHash) {
    clearAuthToken();
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

function LogincheckAuth() {
  const token = getAuthToken();
  const storedHash = localStorage.getItem(HASH_STORAGE_KEY);

  if (!storedHash) {
    console.error("No hash available. Please wait...");
    return false;
  }

  if (token && token === storedHash) {
    window.location.href = "/terminal.html";
    return true;
  }
  return false;
}