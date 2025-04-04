// Konfigurácia
const API_URL = 'http://173.249.28.254:3000'; // URL tvojho API
const API_KEY = 'tvoj-secret-api-kluc'; // Nahraď svojím API kľúčom

// Funkcia na odoslanie požiadavky na vytvorenie servera
document.getElementById('create-server-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Zastaví štandardné odoslanie formulára

    // Získanie hodnôt z formulára
    const serverName = document.getElementById('server-name').value.trim();
    const serverVersion = document.getElementById('server-version').value.trim();
    const responseMessage = document.getElementById('response-message');

    // Skontroluj, či sú hodnoty zadané
    if (!serverName || !serverVersion) {
        responseMessage.textContent = 'Prosím, vyplň všetky polia!';
        responseMessage.style.color = 'red';
        return;
    }

    responseMessage.textContent = 'Vytváram server...';
    responseMessage.style.color = 'blue';

    // Odoslanie požiadavky na API
    try {
        const response = await fetch(`${API_URL}/create-server`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                name: serverName,
                version: serverVersion
            })
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = `✅ Server bol úspešne vytvorený na porte ${data.port}: ${data.message}`;
            responseMessage.style.color = 'green';
            loadServers(); // Načítaj aktualizovaný zoznam serverov
        } else {
            responseMessage.textContent = `❌ Chyba: ${data.error}`;
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Chyba pri komunikácii s API:', error);
        responseMessage.textContent = `❌ Chyba: ${error.message}`;
        responseMessage.style.color = 'red';
    }
});

// Funkcia na načítanie zoznamu serverov
async function loadServers() {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = '<p>Načítavam zoznam serverov...</p>';

    try {
        const response = await fetch(`${API_URL}/list-servers`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.servers) {
            throw new Error(data.error || 'Neplatná odpoveď od API');
        }

        if (data.servers.length === 0) {
            serverList.innerHTML = '<p>Žiadne servery nie sú momentálne spustené.</p>';
            return;
        }

        serverList.innerHTML = data.servers.map(server => `
            <div class="server-item">
                <strong>${server.name}</strong> beží na porte ${server.port}
                <button onclick="deleteServer('${server.name}', this)">🗑️ Odstrániť</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Chyba pri načítavaní serverov:', error);
        serverList.innerHTML = `<p style="color: red;">❌ Chyba pri načítaní serverov: ${error.message}</p>`;
    }
}

// Funkcia na odstránenie servera
async function deleteServer(serverName, button) {
    if (!confirm(`Naozaj chceš odstrániť server "${serverName}"?`)) return;

    button.disabled = true;
    button.textContent = '⏳ Odstraňujem...';

    try {
        const response = await fetch(`${API_URL}/delete-server`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                name: serverName
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Server ${serverName} bol úspešne odstránený!`);
            loadServers(); // Načítaj aktualizovaný zoznam serverov
        } else {
            alert(`❌ Chyba: ${data.error}`);
        }
    } catch (error) {
        console.error('Chyba pri odstraňovaní servera:', error);
        alert(`❌ Chyba: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = '🗑️ Odstrániť';
    }
}

// Načítaj zoznam serverov pri načítaní stránky
window.onload = loadServers;
