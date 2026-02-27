const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const StellarSDK = require('stellar-sdk');

const {
    Keypair,
    TransactionBuilder,
    Operation,
    Asset,
    Networks,
    BASE_FEE,
} = StellarSDK;

const path = require('path');
// load environment variables from server/.env specifically
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// determine server secret (for signing transactions)
let serverSecret = process.env.SERVER_SECRET;
let serverPublic = null;
if (!serverSecret) {
    // generate ephemeral keypair if not provided
    const pair = Keypair.random();
    serverSecret = pair.secret();
    serverPublic = pair.publicKey();
    console.warn('⚠️ WARNING: SERVER_SECRET not configured.');
    console.warn('Using ephemeral keypair for signing. THIS WILL RESET ON RESTART.');
    console.warn(`Generated public key: ${serverPublic}`);
} else {
    try {
        serverPublic = Keypair.fromSecret(serverSecret).publicKey();
    } catch (e) {
        console.error('Invalid SERVER_SECRET in .env');
        process.exit(1);
    }
    console.log(`Server will sign transactions using public key: ${serverPublic}`);
}

// Stellar Testnet Server
const server = new StellarSDK.Horizon.Server('https://horizon-testnet.stellar.org');

// ensure the server account exists on testnet/fund it automatically
(async () => {
    try {
        await server.loadAccount(serverPublic);
        console.log('Server account already exists:', serverPublic);
    } catch (err) {
        console.log('Server account not found, creating via friendbot:', serverPublic);
        try {
            const resp = await fetch(`https://friendbot.stellar.org?addr=${serverPublic}`);
            const json = await resp.json();
            console.log('Friendbot response:', json);
        } catch (ferr) {
            console.error('Failed to fund server account with friendbot', ferr);
        }
    }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/wallet/details', async (req, res) => {
    try {
        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'Account ID is required' });
        }

        // Fetch account details from Stellar Testnet
        const account = await server.accounts().accountId(accountId).call();

        const walletDetails = {
            id: account.id,
            accountSequence: account.sequence,
            balances: account.balances,
            signers: account.signers,
            pagingToken: account.paging_token,
            subentryCount: account.subentry_count,
            lastModifiedLedger: account.last_modified_ledger,
            lastModifiedTime: account.last_modified_time,
        };

        res.json(walletDetails);
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get transaction history
app.get('/api/wallet/transactions/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const limit = Math.min(req.query.limit || 50, 200); // default 50, max 200

        const transactions = await server
            .transactions()
            .forAccount(accountId)
            .limit(limit)
            .order('desc')
            .call();

        res.json(transactions.records);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create and submit transaction
app.post('/api/transaction/send', async (req, res) => {
    try {
        const { destinationAccount, amount } = req.body;
        const secretKey = process.env.SERVER_SECRET;

        if (!destinationAccount || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        if (!secretKey) {
            return res.status(500).json({ error: 'Server secret key not configured' });
        }

        // derive source account from secret
        const sourceKeypair = Keypair.fromSecret(secretKey);
        const sourceAccount = sourceKeypair.publicKey();

        const account = await server.loadAccount(sourceAccount);

        // ensure destination exists (simple payment requires it)
        try {
            await server.accounts().accountId(destinationAccount).call();
        } catch (notFoundErr) {
            if (notFoundErr.response && notFoundErr.response.status === 404) {
                return res.status(400).json({ error: 'Destination account does not exist on the network' });
            }
            // rethrow other errors
            throw notFoundErr;
        }

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(
                Operation.payment({
                    destination: destinationAccount,
                    asset: Asset.native(),
                    amount: amount.toString(),
                })
            )
            .setTimeout(300)
            .build();

        // sign using Keypair object rather than raw secret string
        transaction.sign(sourceKeypair);

        const response = await server.submitTransaction(transaction);

        res.json({
            success: true,
            hash: response.hash,
            ledger: response.ledger,
            envelope_xdr: response.envelope_xdr,
            sourceAccount,
        });
    } catch (error) {
        console.error('Error submitting transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create and submit payment operation
app.post('/api/payment/send', async (req, res) => {
    try {
        const { destinationAccount, amount, assetCode, assetIssuer } = req.body;
        const secretKey = process.env.SERVER_SECRET;

        if (!destinationAccount || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        if (!secretKey) {
            return res.status(500).json({ error: 'Server secret key not configured' });
        }

        const sourceKeypair = Keypair.fromSecret(secretKey);
        const sourceAccount = sourceKeypair.publicKey();

        const account = await server.loadAccount(sourceAccount);

        // ensure destination exists for base payment (custom asset also requires trust line but account must exist)
        try {
            await server.accounts().accountId(destinationAccount).call();
        } catch (notFoundErr) {
            if (notFoundErr.response && notFoundErr.response.status === 404) {
                return res.status(400).json({ error: 'Destination account does not exist on the network' });
            }
            throw notFoundErr;
        }

        let asset;
        if (assetCode && assetIssuer) {
            asset = new Asset(assetCode, assetIssuer);
        } else {
            asset = Asset.native();
        }

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(
                Operation.payment({
                    destination: destinationAccount,
                    asset: asset,
                    amount: amount.toString(),
                })
            )
            .setTimeout(300)
            .build();

        // sign using Keypair object rather than raw secret string
        transaction.sign(sourceKeypair);

        const response = await server.submitTransaction(transaction);

        res.json({
            success: true,
            hash: response.hash,
            ledger: response.ledger,
            envelope_xdr: response.envelope_xdr,
            sourceAccount,
        });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Return the balance for the server account used for signing
app.get('/api/balance', async (req, res) => {
    try {
        const account = await server.loadAccount(serverPublic);
        res.json({ accountId: serverPublic, balances: account.balances });
    } catch (err) {
        console.error('Error fetching server balance:', err);
        res.status(500).json({ error: err.message });
    }
});

// Note: transactions are signed using SERVER_SECRET from .env
// make sure you add a testnet secret key like:
//   SERVER_SECRET=SB...

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
