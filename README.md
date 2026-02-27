# Stellar Testnet Wallet Manager

A full-stack web application for managing Stellar testnet accounts, viewing wallet details, and performing transactions and payments.

## Features

✅ **Wallet Access by ID** - Fetch and view wallet details using account public key
✅ **Balance Viewing** - Display all asset balances held by the account
✅ **Transaction History** - View recent transactions for the account
✅ **Native XLM Payments** - Send XLM payments between accounts
✅ **Custom Asset Payments** - Send custom-issued assets on the Stellar network
✅ **Testnet Integration** - Full integration with Stellar testnet network
✅ **Transaction Details** - View transaction hash, ledger, and XDR envelope

## Tech Stack

**Backend:**
- Node.js with Express.js
- Stellar SDK for blockchain interaction
- CORS support for frontend communication

**Frontend:**
- React 18
- Axios for HTTP requests
- Responsive CSS styling

## Project Structure

```
stellar/
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   └── .env               # Environment variables
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── WalletDetails.js
│       │   ├── Transaction.js
│       │   └── Payment.js
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── package.json           # Root dependencies
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd stellar
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment (optional):**
   - Edit `server/.env` if needed (default PORT=5000)

## Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

This command starts:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
cd client
npm start
```

### Production Build
```bash
npm run build
```

## API Endpoints

### Get Wallet Details
```
POST /api/wallet/details
Body: { "accountId": "GXXXXXXXXX..." }
Response: Wallet details including balances, signers, and transaction history
```

### Get Transaction History
```
GET /api/wallet/transactions/:accountId?limit=10
Response: Array of recent transactions
```

### Send Payment (Native XLM)
```
POST /api/transaction/send
Body: {
  "destinationAccount": "GYYYYYYYYY...",
  "amount": "100"
}
Response: Transaction hash and envelope XDR
```
*Note:* the server signs every transaction using the secret key configured in `.env` (or an ephemeral key generated at startup if none is set). The destination account **must already exist** on the network (otherwise you'll receive a 400 error).

### Send Custom Asset Payment
```
POST /api/payment/send
Body: {
  "destinationAccount": "GYYYYYYYYY...",
  "amount": "100",
  "assetCode": "USD",
  "assetIssuer": "GZZZZZZZZZ..."
}
Response: Transaction hash and envelope XDR
```
*Note:* the server signs every transaction using the secret key configured in `.env` (or an ephemeral key generated at startup if none is set). The destination account **must already exist** on the network, and it must trust the asset you’re sending.

## Usage Guide

### 1. Create a Testnet Account
- Visit [Stellar Laboratory](https://laboratory.stellar.org/)
- Generate a new keypair
- Fund your account using the testnet faucet
- Save your public and secret keys securely

### 2. View Wallet Details
- Enter your Stellar account ID (public key) in the input field
- Click "Fetch Wallet"
- View your balances, signers, and recent transactions

### 3. Send a Payment
- Go to "Send Payment" tab
- Enter recipient's account ID and amount
- The server will sign the transaction automatically
- Click "Send Payment"

### 4. Send Custom Assets
- Go to "Custom Payment" tab
- Uncheck "Use Native XLM"
- Specify asset code and issuer
- Provide recipient details and amount
- The server will sign the payment automatically

## Important Security Notes

⚠️ **Server now manages the secret key internally – you don’t enter it in the UI.**
- This application is for testnet only
- Always use testnet accounts (not production)
- Store the secret key in `.env` and do not commit it to version control
- For production, use proper key management solutions (HSM, vaults, etc.)

## Stellar Network Details

- **Testnet Network Passphrase:** `Test SDF Network ; September 2015`
- **Testnet Horizon API:** `https://horizon-testnet.stellar.org`
- **Base Fee:** 100 stroops
- **Minimum Account Balance:** 2 XLM (1 XLM base + 1 XLM for transaction fee)

## Testing

To test transactions on testnet:
1. Create two test accounts
2. Fund both accounts using the testnet faucet
3. Launch the application
4. Send test payments between accounts
5. View transaction details on [Stellar Expert](https://stellar.expert/explorer/testnet)

## Troubleshooting

### Port Already in Use
- Change PORT in `server/.env`
- Update proxy in `client/package.json`

### CORS Errors
- Ensure backend is running on port 5000
- Check frontend is configured to use correct proxy

### Transaction Failures
- Verify account has sufficient XLM balance
- Ensure secret key is correct
- Check recipient account exists and trusts the asset (for custom assets)
- Verify transaction sequence number

### Account Not Found
- Confirm account ID is valid (starts with 'G')
- Verify account has been funded on testnet
- Check account on [Stellar Expert](https://stellar.expert/explorer/testnet)

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK (JavaScript)](https://github.com/stellar/js-stellar-sdk)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Horizon API Reference](https://developers.stellar.org/api/introduction/index.html)

## License

ISC

## Support

For issues or questions:
1. Check Stellar documentation
2. Visit [Stellar Stack Exchange](https://stellar.stackexchange.com/)
3. Join [Stellar Discord Community](https://discord.gg/stellar)

stellar\output_Screen_shot\Screenshot 2026-02-27 173858.png
stellar\output_Screen_shot\Screenshot 2026-02-27 173949.png
