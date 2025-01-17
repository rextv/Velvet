
const GITHUB_API =
  "https://api.github.com/repos/rextv/kill-switch/contents/status.json";
let currentStatus = false;

async function checkStatus() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/rextv/kill-switch/refs/heads/main/status.json" +
        "?t=" +
        Date.now()
    );
    const data = await response.json();
    updateUI(data.enabled);
  } catch (error) {
    console.error("Status check failed:", error);
    logMessage("Status check failed: " + error.message);
  }
}

async function toggleKillSwitch() {
  const token = document.getElementById("authToken").value;
  if (!token) {
    alert("Please enter GitHub token");
    return;
  }

  try {
    // First get the current file to get its SHA
    const getResponse = await fetch(GITHUB_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const fileInfo = await getResponse.json();

    // Prepare new content
    const newContent = {
      enabled: !currentStatus,
      lastUpdated: new Date().toISOString(),
    };

    // Update file
    const response = await fetch(GITHUB_API, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update kill switch status to ${!currentStatus}`,
        content: btoa(JSON.stringify(newContent, null, 2)),
        sha: fileInfo.sha,
      }),
    });

    if (response.ok) {
      logMessage(
        `Successfully ${
          !currentStatus ? "activated" : "deactivated"
        } kill switch`
      );
      checkStatus();
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Toggle failed:", error);
    logMessage("Toggle failed: " + error.message);
    alert("Operation failed: " + error.message);
  }
}

function updateUI(status) {
  currentStatus = status;
  const statusIndicator = document.getElementById("statusIndicator");
  const toggleButton = document.getElementById("toggleButton");
  const lastChecked = document.getElementById("lastChecked");

  statusIndicator.textContent = status ? "Active" : "Inactive";
  statusIndicator.className = `status-indicator ${
    status ? "status-active" : "status-inactive"
  }`;

  toggleButton.textContent = status
    ? "Deactivate Kill Switch"
    : "Activate Kill Switch";
  toggleButton.className = `button ${
    status ? "button-deactivate" : "button-activate"
  }`;

  lastChecked.textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
}

function logMessage(message) {
  const log = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  log.innerHTML = `[${time}] ${message}<br>` + log.innerHTML;
}

document
  .getElementById("toggleButton")
  .addEventListener("click", toggleKillSwitch);

// Initial check
checkStatus();

// Regular checks
setInterval(checkStatus, 30000);


const KILL_SWITCH_URL =
  "https://raw.githubusercontent.com/rextv/kill-switch/refs/heads/main/status.json";
const HASH_URL =
  "https://api.github.com/repos/rextv/kill-switch/contents/hash.json";
const CHECK_INTERVAL = 30000; // 30 seconds

class KillSwitch {
  constructor() {
    this.isActive = false;
    this.lastCheck = null;
    this.setupHashUploader();
  }

  // Previous KillSwitch methods remain the same

  setupHashUploader() {
    const uploadButton = document.getElementById("uploadHashButton");
    const uploadInput = document.getElementById("uploadHashInput");
    const statusElement = document.getElementById("uploadStatus");
    const authInput = document.getElementById("authToken");

    uploadButton.addEventListener("click", async () => {
      const hash = uploadInput.value.trim();
      const token = authInput.value.trim();

      if (!hash) {
        statusElement.textContent = "Please enter a hash";
        return;
      }

      if (!token) {
        statusElement.textContent = "Please enter your GitHub token";
        return;
      }

      try {
        // First, get the current file to get its SHA
        const response = await fetch(HASH_URL, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        let sha = "";
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }

        // Prepare the new content
        const content = btoa(JSON.stringify({ hash: hash }));

        // Update the file
        const updateResponse = await fetch(HASH_URL, {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Update hash.json",
            content: content,
            sha: sha,
          }),
        });

        if (updateResponse.ok) {
          statusElement.textContent = "Hash uploaded successfully";
          uploadInput.value = "";
        } else {
          const error = await updateResponse.json();
          statusElement.textContent = `Upload failed: ${error.message}`;
        }
      } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
      }
    });
  }
}

// Start monitoring when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const killSwitch = new KillSwitch();
  killSwitch.start();
});

document.getElementById('generateHashButton').addEventListener('click', function() {
  const hashOutput = document.getElementById('hashOutput');
  const uploadHashInput = document.getElementById('uploadHashInput');
  uploadHashInput.value = hashOutput.textContent;
});

function generateHash() {
  const input = document.getElementById('hashInput').value;
  const hashedValue = CryptoJS.SHA256(input.toLowerCase()).toString();
  document.getElementById('hashOutput').textContent = hashedValue;
}