let connection;
let wallet;

document.getElementById('connect-button').addEventListener('click', async () => {
    if (window.solana) {
        try {
            const response = await window.solana.connect();
            wallet = response.publicKey.toString();
            console.log('Connected to wallet:', wallet);
        } catch (err) {
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

    // تأكد من ربط المحفظة هنا
    if (!wallet) {
        alert('Please connect your wallet first.');
        return;
    }

    // إعداد الاتصال مع شبكة Solana
    connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    try {
        const mint = await splToken.Token.createMint(
            connection,
            new solanaWeb3.Keypair(), // استخدام مفتاح مزيف هنا، يجب أن تستخدم المفتاح الصحيح
            wallet,
            null,
            totalSupply,
            splToken.TOKEN_PROGRAM_ID
        );
        
        console.log(`Token created: ${mint.toBase58()}`);
    } catch (err) {
        console.error('Failed to create token:', err);
    }
});
