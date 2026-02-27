# 🚀 Stellar Testnet Wallet Manager

A full-stack web application for managing Stellar testnet accounts, viewing wallet details, and performing transactions and payments.

---

## ✨ Features

- 🔐 Wallet Access by Public Key
- 💰 View Account Balances (XLM & Custom Assets)
- 📜 Transaction History
- 💸 Send Native XLM Payments
- 🪙 Send Custom Asset Payments
- 🌐 Full Stellar Testnet Integration
- 🧾 View Transaction Hash, Ledger & XDR

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- Stellar SDK
- CORS

### Frontend
- React 18
- Axios
- Responsive CSS

---

## 📂 Project Structure

```
stellar/
│
├── server/
│   ├── index.js
│   └── .env
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── App.js
│       └── index.js
│
├── package.json
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Node.js (v14+)
- npm

### Setup

```bash
git clone <your-repository-url>
cd stellar
npm install
cd client
npm install
cd ..
```

---

## ▶️ Run Application

### Development Mode (Frontend + Backend)

```bash
npm run dev
```

Backend runs on:
```
http://localhost:5000
```

Frontend runs on:
```
http://localhost:3000
```

---

## 📡 API Endpoints

### Get Wallet Details
```
POST /api/wallet/details
```

### Get Transaction History
```
GET /api/wallet/transactions/:accountId
```

### Send Native XLM
```
POST /api/transaction/send
```

### Send Custom Asset
```
POST /api/payment/send
```

---

## 🔐 Security Notes

- This project is for **Stellar Testnet only**
- Never expose secret keys publicly
- Store secrets inside `.env`
- Add `.env` to `.gitignore`

---

## 🌐 Stellar Testnet Info

- Network Passphrase:  
  `Test SDF Network ; September 2015`

- Horizon API:  
  `https://horizon-testnet.stellar.org`

---

## 🧪 Testing

1. Create two testnet accounts
2. Fund using Stellar testnet faucet
3. Send payments between accounts
4. Verify on:
   https://stellar.expert/explorer/testnet

---

## 📚 Resources

- Stellar Documentation  
  https://developers.stellar.org/

- Stellar Laboratory  
  https://laboratory.stellar.org/

---

## 📄 License

ISC

---

## 👨‍💻 Author

Pankaj Malgave  
SY AI & DS  
VIT