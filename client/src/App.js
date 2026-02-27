import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import WalletDetails from './components/WalletDetails';
import Transaction from './components/Transaction';
import Payment from './components/Payment';
import TransactionHistory from './components/TransactionHistory';

import { useEffect } from 'react';

function App() {
    const [accountId, setAccountId] = useState('');
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('wallet');
    const [serverBalance, setServerBalance] = useState(null);

    const fetchWalletDetails = async () => {
        if (!accountId.trim()) {
            setError('Please enter a valid Account ID (public key)');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Fetching wallet details for:', accountId);
            const response = await axios.post('http://localhost:5000/api/wallet/details', { accountId });
            console.log('Wallet data received:', response.data);
            setWalletData(response.data);
            setSuccess('Wallet loaded successfully!');

            // Fetch transactions
            try {
                const txResponse = await axios.get(`http://localhost:5000/api/wallet/transactions/${accountId}?limit=10`);
                setTransactions(txResponse.data || []);
            } catch (txErr) {
                console.warn('Could not fetch transactions:', txErr.message);
                setTransactions([]);
            }

            // also refresh server balance
            fetchServerBalance();
        } catch (err) {
            console.error('Error fetching wallet:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch wallet details';
            setError(errorMsg);
            setWalletData(null);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchServerBalance = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/balance');
            setServerBalance(res.data);
        } catch (e) {
            console.warn('Unable to fetch server balance', e.message);
            setServerBalance(null);
        }
    };

    const handleRefresh = async () => {
        if (accountId.trim()) {
            await fetchWalletDetails();
        }
        await fetchServerBalance();
    };

    useEffect(() => {
        fetchServerBalance();
    }, []);


    return (
        <div className="App">
            <header className="App-header">
                <h1>🌟 Stellar Testnet Wallet</h1>
                <p>Access, view, and manage your Stellar testnet accounts with ease</p>
                {serverBalance && (
                    <div style={{ marginTop: '10px', fontSize: '0.9em', opacity: 0.9 }}>
                        <strong>Server account:</strong> {serverBalance.accountId}<br />
                        <strong>Balance:</strong> {serverBalance.balances.map(b => `${b.asset_type === 'native' ? 'XLM' : b.asset_code}:${b.balance}`).join(' , ')}
                    </div>
                )}
            </header>

            <div className="container">
                <div className="wallet-input-section">
                    <h2>Wallet Access</h2>
                    <p style={{ color: '#666', marginBottom: '15px' }}>
                        Enter your Stellar public key (account ID) to view wallet details.  The server will sign transactions on your behalf using its own testnet key.
                    </p>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter Stellar Account ID (public key) - e.g., GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTBY4V5LLYMLVSXPWXONOH63ON"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchWalletDetails()}
                            disabled={loading}
                        />
                        <button onClick={fetchWalletDetails} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Loading...
                                </>
                            ) : (
                                'Fetch Wallet'
                            )}
                        </button>
                    </div>
                    {error && <div className="error-message">⚠️ {error}</div>}
                    {success && <div className="success-message">✓ {success}</div>}
                </div>

                {walletData && (
                    <>
                        <div className="tabs">
                            {serverBalance && (
                                <span style={{ marginLeft: 'auto', color: '#fff', fontSize: '0.9em' }}>
                                    Server Balance: {serverBalance.balances.map(b => `${b.asset_type === 'native' ? 'XLM' : b.asset_code}:${b.balance}`).join(' , ')}
                                </span>
                            )}
                            <button
                                className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wallet')}
                            >
                                💼 Wallet Details
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'transaction' ? 'active' : ''}`}
                                onClick={() => setActiveTab('transaction')}
                            >
                                📤 Send XLM
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
                                onClick={() => setActiveTab('custom')}
                            >
                                💳 Custom Payment
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                📜 History
                            </button>
                            <button
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '0.9em' }}
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        <div className="content-section">
                            {activeTab === 'wallet' && (
                                <WalletDetails walletData={walletData} transactions={transactions} />
                            )}
                            {activeTab === 'transaction' && (
                                <Transaction sourceAccount={accountId} onSuccess={handleRefresh} />
                            )}
                            {activeTab === 'custom' && (
                                <Payment sourceAccount={accountId} onSuccess={handleRefresh} />
                            )}
                            {activeTab === 'history' && (
                                <TransactionHistory accountId={accountId} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
