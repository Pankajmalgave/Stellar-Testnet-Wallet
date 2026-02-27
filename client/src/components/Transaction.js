import React, { useState } from 'react';
import axios from 'axios';
import './Transaction.css';

function Transaction({ sourceAccount, onSuccess }) {
    const [formData, setFormData] = useState({
        destinationAccount: '',
        amount: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [transactionResult, setTransactionResult] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.destinationAccount || !formData.amount) {
            setMessage('⚠️ Please fill in all fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setMessage('⚠️ Amount must be greater than 0');
            return;
        }

        setLoading(true);
        setMessage('');
        setTransactionResult(null);

        try {
            console.log('Sending transaction...');
            const response = await axios.post('http://localhost:5000/api/transaction/send', {
                destinationAccount: formData.destinationAccount,
                amount: formData.amount,
            });

            console.log('Transaction successful:', response.data);
            setTransactionResult(response.data);
            setMessage('✅ Transaction successful! Check details below.');
            setFormData({ destinationAccount: '', amount: '', secretKey: '' });

            // Refresh wallet data
            setTimeout(() => onSuccess(), 2000);
        } catch (error) {
            console.error('Transaction error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Transaction failed';
            setMessage('❌ ' + errorMsg);
            setTransactionResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transaction-form-container">
            <h2>Send Native XLM Payment</h2>

            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="sourceAccount">From (Your Account)</label>
                    <input
                        type="text"
                        id="sourceAccount"
                        value={sourceAccount}
                        disabled
                        className="form-input disabled"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="destinationAccount">To (Recipient Account)</label>
                    <input
                        type="text"
                        id="destinationAccount"
                        name="destinationAccount"
                        placeholder="Enter recipient's Stellar account ID"
                        value={formData.destinationAccount}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Amount (XLM)</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder="Enter amount to send"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.0001"
                        min="0"
                        className="form-input"
                    />
                </div>



                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Processing...' : 'Send Payment'}
                </button>
            </form>

            {message && (
                <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {transactionResult && (
                <div className="transaction-result">
                    <h3>Transaction Details</h3>
                    <div className="result-item">
                        <label>Transaction Hash:</label>
                        <code>{transactionResult.hash}</code>
                    </div>
                    <div className="result-item">
                        <label>Ledger:</label>
                        <code>{transactionResult.ledger}</code>
                    </div>
                    <div className="result-item">
                        <label>Envelope XDR:</label>
                        <code className="xdr-code">{transactionResult.envelope_xdr}</code>
                    </div>
                </div>
            )}

            <div className="info-box">
                <h4>ℹ️ Test Account Setup</h4>
                <p>Don't have a testnet account? Visit <a href="https://laboratory.stellar.org/" target="_blank" rel="noopener noreferrer">Stellar Laboratory</a> to:</p>
                <p>The server will sign all transactions using its own configured secret key, so you never enter your private seed here.</p>
                <ul>
                    <li>Generate a new keypair</li>
                    <li>Fund your account via testnet faucet</li>
                    <li>Test transactions and view results</li>
                </ul>
            </div>
        </div>
    );
}

export default Transaction;
