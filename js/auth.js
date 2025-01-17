const HASH_URL =
  "https://raw.githubusercontent.com/rextv/kill-switch/refs/heads/main/hash.json";
const CHEC_INTERVAL = 30000; // 30 seconds

// Global variable to store the correct password hash
let CORRECT_PASSWORD_HASH = null;

class GetHash {
  constructor() {
    this.isActive = false;
    this.lastCheck = null;
  }

  async fetchAndSetHash() {
    try {
      const response = await fetch(`${HASH_URL}?t=${Date.now()}`);
      const data = await response.json();

      CORRECT_PASSWORD_HASH = data.hash; // Set the global variable
      this.lastCheck = new Date();
      console.log("Hash updated:", CORRECT_PASSWORD_HASH);
    } catch (error) {
      console.error("Failed to fetch hash:", error);
    }
  }

  async start() {
    await this.fetchAndSetHash(); // Fetch the hash at startup
    setInterval(() => this.fetchAndSetHash(), CHEC_INTERVAL);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const ghash = new GetHash();
  await ghash.start(); // Ensure hash is fetched before using it

  // Example: Verify password after hash is fetched
  console.log("Ready for password verification!");
});

const STORAGE_KEY = "awds_auth_token";

function hashPassword(password) {
  return CryptoJS.SHA256(password.toLowerCase()).toString();
}

function verifyPassword(password) {
  if (!CORRECT_PASSWORD_HASH) {
    console.error("Hash not yet loaded. Please wait.");
    return false;
  }
  const hashedPassword = hashPassword(password);
  return hashedPassword === CORRECT_PASSWORD_HASH;
}

function setAuthToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY);
}

function clearAuthToken() {
  localStorage.removeItem(STORAGE_KEY);
}

function checkAuth() {
  const token = getAuthToken();

  if(!CORRECT_PASSWORD_HASH){
    setTimeout(function () {
      if (!token || token !== CORRECT_PASSWORD_HASH) {
        clearAuthToken();
        window.location.href = "/index.html";
        return false;
      }
    }, 1000);
  }
  else if (!token || token !== CORRECT_PASSWORD_HASH) {
    clearAuthToken();
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

function LogincheckAuth() {
  const token = getAuthToken();
  if (!CORRECT_PASSWORD_HASH) {
    setTimeout(function () {
      if (token && token === CORRECT_PASSWORD_HASH) {
        window.location.href = "/terminal.html";
        return true;
      }
    }, 1000);
  }else if (token && token === CORRECT_PASSWORD_HASH) {
      window.location.href = "/terminal.html";
      return true;
    }
  return false;
}