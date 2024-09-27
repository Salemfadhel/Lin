let connection;
let wallet;

const TOKEN_CREATION_COST_IN_USD = 0.5;

async function getSOLPrice() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
}

async function getUserSOLBalance() {
    const publicKey = new solanaWeb3.PublicKey(wallet);
    const balance = await connection.getBalance(publicKey);
    return balance / solanaWeb3.LAMPORTS_PER_SOL; // تحويل إلى SOL
}

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
    if (!wallet) {
        updateStatus('Please connect your wallet first.');
        return;
    }

    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    try {
        const solPrice = await getSOLPrice();
        const costInSOL = TOKEN_CREATION_COST_IN_USD / solPrice;

        const userBalance = await getUserSOLBalance();
        if (userBalance < costInSOL) {
            updateStatus(`Insufficient balance. You need at least ${costInSOL.toFixed(2)} SOL to create a token.`);
            return;
        }

        const mintKeypair = solanaWeb3.Keypair.generate();
        
        const transaction = new solanaWeb3.Transaction();
        transaction.add(
            splToken.Token.createMint(
                connection,
                mintKeypair,
                new solanaWeb3.PublicKey(wallet),
                null,
                1, // يمكن تغيير هذه القيمة وفقًا للاحتياجات
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
