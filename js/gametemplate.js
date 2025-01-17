document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gamePath = urlParams.get("game");

  if (!gamePath) {
    console.error("Game path not specified!");
    alert("Game path is missing in the URL! Example: ?game=subway-surfers");
    return;
  }

  try {
    let gameTitle = gamePath
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    document.title = `Velvet - ${gameTitle}`;

    const titleElement = document.getElementById("game-title");
    if (titleElement) {
      titleElement.textContent = gameTitle;
    }

    const gameContainer = document.getElementById("game-content");
    if (gameContainer) {
      gameContainer.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.src = `/games/${gamePath}/index.html`;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.allowFullscreen = true;

      gameContainer.appendChild(iframe);
    }

    console.log("Game loaded successfully:", gamePath);
  } catch (error) {
    console.error("Error loading game:", error);

    const gameContainer = document.getElementById("game-content");
    if (gameContainer) {
      gameContainer.innerHTML = `<p>Failed to load the game. Please try again later.</p>`;
    }
  }

  // Fullscreen button logic
  const fullscreenButton = document.getElementById("fullscreen-button");
  fullscreenButton.addEventListener("click", () => {
    const gameContainer = document.getElementById("game-content");
    if (gameContainer.requestFullscreen) {
      gameContainer.requestFullscreen();
    } else if (gameContainer.webkitRequestFullscreen) {
      // Safari
      gameContainer.webkitRequestFullscreen();
    } else if (gameContainer.mozRequestFullScreen) {
      // Firefox
      gameContainer.mozRequestFullScreen();
    } else if (gameContainer.msRequestFullscreen) {
      // IE/Edge
      gameContainer.msRequestFullscreen();
    }
  });
});
