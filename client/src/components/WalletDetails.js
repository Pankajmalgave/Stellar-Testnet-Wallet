import React, { useState } from 'react';
import './WalletDetails.css';

function WalletDetails({ walletData, transactions }) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const formatBalance = (balance) => {
        return parseFloat(balance).toFixed(4);
    };

    return (
        <div className="wallet-details">
            <div className="details-grid">
                <div className="detail-card">
                    <h3>💼 Account ID</h3>
                    <p className="account-id">{walletData.id}</p>
                    <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(walletData.id, 'accountId')}
                        title="Copy to clipboard"
                    >
                        {copiedIndex === 'accountId' ? '✓ Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="detail-card">
                    <h3>🔢 Sequence</h3>
                    <p className="highlight">{walletData.accountSequence}</p>
                </div>

                <div className="detail-card">
                    <h3>📝 Subentry Count</h3>
                    <p>{walletData.subentryCount}</p>
                </div>

                <div className="detail-card">
                    <h3>📊 Last Modified</h3>
                    <p>{walletData.lastModifiedLedger}</p>
                </div>
            </div>

            <div className="balances-section">
                <h3>💰 Account Balances</h3>
                {walletData.balances.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No balances found</p>
                ) : (
                    <div className="balances-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Balance</th>
                                    <th>Limit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {walletData.balances.map((balance, index) => (
                                    <tr key={index}>
                                        <td>
                                            {balance.asset_type === 'native'
                                                ? '⭐ XLM (Native)'
                                                : `${balance.asset_code} (${balance.asset_issuer?.slice(0, 8)}...)`}
                                        </td>
                                        <td className="balance-amount">{formatBalance(balance.balance)}</td>
                                        <td>{balance.limit || '∞'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="signers-section">
                <h3>🔐 Account Signers</h3>
                {walletData.signers.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No signers found</p>
                ) : (
                    <div className="signers-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Public Key</th>
                                    <th>Weight</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {walletData.signers.map((signer, index) => (
                                    <tr key={index}>
                                        <td className="signer-key">
                                            {signer.key.slice(0, 12)}...{signer.key.slice(-8)}
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(signer.key, `signer-${index}`)}
                                                title="Copy to clipboard"
                                                style={{ marginLeft: '8px' }}
                                            >
                                                {copiedIndex === `signer-${index}` ? '✓' : '📋'}
                                            </button>
                                        </td>
                                        <td>{signer.weight}</td>
                                        <td><span className="type-badge">{signer.type}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {transactions && transactions.length > 0 && (
                <div className="transactions-section">
                    <h3>📜 Recent Transactions</h3>
                    <div className="transactions-list">
                        {transactions.slice(0, 5).map((tx, index) => (
                            <div key={index} className="transaction-item">
                                <div className="tx-header">
                                    <span className="tx-hash">
                                        <strong>TX:</strong> {tx.hash.slice(0, 16)}...
                                    </span>
                                    <span className="tx-type">{tx.type}</span>
                                </div>
                                <div className="tx-details">
                                    <p>📍 Ledger: <strong>{tx.ledger}</strong></p>
                                    <p>⏱️ Time: {new Date(tx.created_at).toLocaleString()}</p>
                                    <p>💸 Fee: {tx.fee_charged} stroops</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WalletDetails;
