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
    const tokenName = document.getElementById('token-name').value;
    const tokenSymbol = document.getElementById('token-symbol').value;
    const totalSupply = parseInt(document.getElementById('token-supply').value);

    if (!wallet) {
        updateStatus('Please connect your wallet first.');
        return;
    }

    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    try {
        const mintKeypair = solanaWeb3.Keypair.generate(); // مفتاح جديد لإنشاء العملة

        // إعداد المعاملة
        const transaction = new solanaWeb3.Transaction().add(
            splToken.Token.createMint(
                connection,
                mintKeypair,
                new solanaWeb3.PublicKey(wallet),
                null,
                totalSupply,
                splToken.TOKEN_PROGRAM_ID
            )
        );

        // توقيع المعاملة
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solanaWeb3.PublicKey(wallet);

        // توقيع المعاملة بواسطة محفظة Phantom
        const signedTransaction = await window.solana.signTransaction(transaction);

        // إرسال المعاملة
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        // انتظار تأكيد المعاملة
        await connection.confirmTransaction(signature, 'confirmed');

        updateStatus(`Token created: ${mintKeypair.publicKey.toBase58()}`);
        checkTokenOnSolscan(mintKeypair.publicKey.toBase58());
    } catch (err) {
        updateStatus('Failed to create token. Check console for details.');
        console.error('Failed to create token:', err);
    }
});

async function checkTokenOnSolscan(tokenAddress) {
    const apiKey = 'sk_live_d5ef998369184404ab27344ba51d9784';
    const url = `https://api.solscan.io/token?tokenAddress=${tokenAddress}&apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.data) {
            updateStatus(`Token info fetched from Solscan: ${JSON.stringify(data.data)}`);
        } else {
            updateStatus('No data found for this token on Solscan.');
        }
    } catch (error) {
        updateStatus('Failed to fetch token info from Solscan.');
        console.error(error);
    }
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}
