let connection;
let wallet;

document.getElementById('connect-button').addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
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
    const totalSupply = parseInt(document.getElementById('token-supply').value);

    if (!wallet) {
        updateStatus('Please connect your wallet first.');
        return;
    }

    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    try {
        const mintKeypair = solanaWeb3.Keypair.generate();
        
        const transaction = new solanaWeb3.Transaction();

        transaction.add(
            splToken.Token.createMint(
                connection,
                mintKeypair,
                new solanaWeb3.PublicKey(wallet),
                null,
                totalSupply,
                splToken.TOKEN_PROGRAM_ID
            )
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solanaWeb3.PublicKey(wallet);

        const signedTransaction = await window.solana.signTransaction(transaction);
        
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        await connection.confirmTransaction(signature, 'confirmed');

        updateStatus(`Token created: ${mintKeypair.publicKey.toBase58()}`);
    } catch (err) {
        updateStatus('Failed to create token. Check console for details.');
        console.error('Failed to create token:', err);
    }
});

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}
