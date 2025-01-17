const KILL_SWITCH_URL =
  "https://raw.githubusercontent.com/rextv/kill-switch/refs/heads/main/status.json";
const CHECK_INTERVAL = 30000; // 30 seconds

class KillSwitch {
  constructor() {
    this.isActive = false;
    this.lastCheck = null;
  }

  async checkStatus() {
    try {
      // Add cache buster to avoid GitHub's caching
      const response = await fetch(`${KILL_SWITCH_URL}?t=${Date.now()}`);
      const data = await response.json();

      this.lastCheck = new Date();

      if (data.enabled && !this.isActive) {
        this.activate();
      }
    } catch (error) {
      console.error("Kill switch check failed:", error);
    }
  }

  activate() {
    this.isActive = true;
    document.body.innerHTML = `
            <style>
                body {
                    background-color: #1a1a1a;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .warning {
                    background-color: #2d2d2d;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 0 40px rgba(0,0,0,0.5);
                    width: 80%;
                    max-width: 800px;
                    text-align: center;
                }
                .warning h3 {
                    margin-top: 0;
                    color: #40E0D0;
                    font-size: 36px;
                    margin-bottom: 30px;
                }
                .warning p {
                    color: #ffffff;
                    margin: 25px 0;
                    font-size: 24px;
                    line-height: 1.5;
                }
            </style>
            <div class="warning">
                <h3>⚠️ 10-D-M Error</h3>
                <p>Kill Switch Enabled</p>
            </div>
        `;
  }

  start() {
    this.checkStatus();
    setInterval(() => this.checkStatus(), CHECK_INTERVAL);
  }
}

// Start monitoring when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const killSwitch = new KillSwitch();
  killSwitch.start();
});