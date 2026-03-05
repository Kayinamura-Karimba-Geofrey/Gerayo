const fetch = require('node-fetch');

async function triggerAlert() {
    const response = await fetch('http://localhost:3000/api/emergency/hardware', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mac: 'FCF5C4A085F0',
            message: 'Emergency'
        })
    });
    const data = await response.json();
    console.log('Trigger Response:', data);
}

triggerAlert();
