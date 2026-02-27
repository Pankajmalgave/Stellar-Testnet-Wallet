import React, { useState } from 'react';
import axios from 'axios';
import './TransactionHistory.css';

function TransactionHistory({ accountId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [expandedTx, setExpandedTx] = useState(null);

    const handleFetchHistory = async () => {
        if (!accountId) {
            setMessage('⚠️ Please enter an account ID first');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            console.log('Fetching transaction history for:', accountId);
            const response = await axios.get(`http://localhost:5000/api/wallet/transactions/${accountId}?limit=50`);
            console.log('Transactions received:', response.data);
            setTransactions(response.data || []);
            if (response.data.length === 0) {
                setMessage('No transactions found for this account.');
            } else {
                setMessage(`✓ Loaded ${response.data.length} transaction(s)`);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch transaction history';
            setMessage('❌ ' + errorMsg);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        try {
            const date = new Date(isoString);
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            return date.toLocaleString('en-US', options);
        } catch (e) {
            return isoString;
        }
    };

    const toggleExpand = (index) => {
        setExpandedTx(expandedTx === index ? null : index);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="transaction-history-container">
            <h2>📜 Transaction History</h2>
            <p>View past transactions for the selected account.</p>

            <div className="history-actions">
                <button onClick={handleFetchHistory} disabled={loading} className="fetch-button">
                    {loading ? 'Loading...' : 'Load Transaction History'}
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {transactions.length > 0 && (
                <div className="transactions-list">
                    <h3>{transactions.length} Transaction(s) found</h3>
                    {transactions.map((tx, index) => (
                        <div key={index} className="transaction-item">
                            <div
                                className="transaction-header"
                                onClick={() => toggleExpand(index)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="tx-type">
                                    {tx.successful ? '✅' : '❌'} {tx.type || 'Transaction'}
                                </span>
                                <span className="tx-id">{tx.id}</span>
                                <span className="tx-date">{formatDate(tx.created_at)}</span>
                                <span className="tx-toggle">{expandedTx === index ? '▼' : '▶'}</span>
                            </div>

                            {expandedTx === index && (
                                <div className="transaction-details">
                                    <table className="details-table">
                                        <tbody>
                                            <tr>
                                                <td className="label">Hash:</td>
                                                <td className="value">
                                                    {tx.hash}
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(tx.hash)}
                                                        title="Copy hash"
                                                    >
                                                        📋
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="label">Ledger:</td>
                                                <td className="value">{tx.ledger}</td>
                                            </tr>
                                            <tr>
                                                <td className="label">Source Account:</td>
                                                <td className="value">
                                                    {tx.source_account}
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => copyToClipboard(tx.source_account)}
                                                        title="Copy account"
                                                    >
                                                        📋
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="label">Fee Paid:</td>
                                                <td className="value">{tx.fee_paid} stroops</td>
                                            </tr>
                                            <tr>
                                                <td className="label">Op. Count:</td>
                                                <td className="value">{tx.operation_count}</td>
                                            </tr>
                                            <tr>
                                                <td className="label">Status:</td>
                                                <td className="value">
                                                    {tx.successful ? '✅ Successful' : '❌ Failed'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="label">Created:</td>
                                                <td className="value">{formatDate(tx.created_at)}</td>
                                            </tr>
                                            {tx.memo && (
                                                <tr>
                                                    <td className="label">Memo:</td>
                                                    <td className="value">{tx.memo}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TransactionHistory;
