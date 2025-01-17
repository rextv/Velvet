function formatGameName(gameName) {
    return gameName
        .split('-')
        .map(word => {
            return word.length > 1
                ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                : word.toLowerCase();
        })
        .join(' ');
}

function openInBlank(url) {
    const win = window.open('about:blank', '_blank');
    if (win) {
        win.document.write(`
            <style>
                body {
                    background-color: #1a1a1a;
                    font-family: Arial, sans-serif;
                }
            </style>
            <div id="warning" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #2d2d2d; padding: 40px; border-radius: 20px; box-shadow: 0 0 40px rgba(0,0,0,0.5); z-index: 9999; width: 80%; max-width: 800px; text-align: center;">
                <h3 style="margin-top: 0; color: #40E0D0; font-size: 36px; margin-bottom: 30px;">⚠️ Privacy Notice</h3>
                <p style="color: #ffffff; margin: 25px 0; font-size: 24px; line-height: 1.5;">Please close the terminal tab to prevent tracking while playing.</p>
                <button onclick="closeWarningAndLoad()" style="background: #40E0D0; border: none; padding: 15px 40px; border-radius: 10px; color: #1a1a1a; cursor: pointer; margin-top: 20px; font-size: 24px; font-weight: bold; transition: all 0.3s ease;">Got it!</button>
            </div>
            <script>
                function closeWarningAndLoad() {
                    document.getElementById('warning').remove();
                    document.body.style.margin = '0';
                    document.body.style.height = '100vh';
                    const iframe = document.createElement('iframe');
                    iframe.style.border = 'none';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.margin = '0';
                    iframe.src = '${url}';
                    document.body.appendChild(iframe);
                }
            </script>
        `);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    const gameGrid = document.getElementById('gameGrid');
    games.sort((a, b) => a.path.localeCompare(b.path));
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        card.onclick = () => {
            if (game.path) {
                openInBlank("/games.html?game=" + game.path);
            }
        };

        const gamename = formatGameName(game.path);

        card.innerHTML = `
            <img src="/img/gameicons/${game.path}.${game.image}" alt="${gamename}">
            <h3 class="game-title">${gamename}</h3>
        `;

        gameGrid.appendChild(card);
    });

    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-container');
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('DOMContentLoaded', performSearch);
    searchForm.addEventListener('submit', event => {
        event.preventDefault();
    });

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const gameContainers = document.querySelectorAll('.game-card');

        gameContainers.forEach(container => {
            const title = container.querySelector('.game-title').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }
});