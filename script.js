let connection;
let wallet;

document.getElementById('connect-button').addEventListener('click', async () => {
    if (window.solana) {
        try {
            const response = await window.solana.connect();
            wallet = response.publicKey.toString();
            updateStatus(`Connected to wallet: ${wallet}`);
        } catch (err) {
            updateStatus('Connection failed. Please try again.');
            console.error(err);
        }
    } else {
        alert('Phantom wallet not found. Please install it.');
    }
});

document.getElementById('create-token-button').addEventListener('click', async () => {
    const tokenName = document.getElementById('token-name').value;
    const tokenSymbol = document.getElementById('token-symbol').value;
    const totalSupply = parseInt(document.getElementById('token-supply').value);

    if (!wallet) {
        updateStatus('Please connect your wallet first.');
        return;
    }

    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    try {
        const mint = await splToken.Token.createMint(
            connection,
            new solanaWeb3.Keypair(),
            wallet,
            null,
            totalSupply,
            splToken.TOKEN_PROGRAM_ID
        );

        updateStatus(`Token created: ${mint.toBase58()}`);
    } catch (err) {
        updateStatus('Failed to create token. Check console for details.');
        console.error('Failed to create token:', err);
    }
});

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}
