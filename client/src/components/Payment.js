import React, { useState } from 'react';
import axios from 'axios';
import './Payment.css';

function Payment({ sourceAccount, onSuccess }) {
    const [formData, setFormData] = useState({
        destinationAccount: '',
        amount: '',
        assetCode: '',
        assetIssuer: '',
        useNative: true,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.destinationAccount || !formData.amount) {
            setMessage('⚠️ Please fill in all required fields');
            return;
        }

        if (!formData.useNative && (!formData.assetCode || !formData.assetIssuer)) {
            setMessage('⚠️ Please provide asset code and issuer for custom assets');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setMessage('⚠️ Amount must be greater than 0');
            return;
        }

        setLoading(true);
        setMessage('');
        setPaymentResult(null);

        try {
            console.log('Sending payment...');
            const response = await axios.post('http://localhost:5000/api/payment/send', {
                destinationAccount: formData.destinationAccount,
                amount: formData.amount,
                assetCode: formData.useNative ? null : formData.assetCode,
                assetIssuer: formData.useNative ? null : formData.assetIssuer,
            });

            console.log('Payment successful:', response.data);
            setPaymentResult(response.data);
            setMessage('✅ Payment submitted successfully! Check details below.');
            setFormData({
                destinationAccount: '',
                amount: '',
                assetCode: '',
                assetIssuer: '',
                useNative: true,
                secretKey: '',
            });

            // Refresh wallet data
            setTimeout(() => onSuccess(), 2000);
        } catch (error) {
            console.error('Payment error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Payment failed';
            setMessage('❌ ' + errorMsg);
            setPaymentResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h2>Send Custom Payment</h2>

            <form onSubmit={handleSubmit} className="payment-form">
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
                    <label htmlFor="amount">Amount</label>
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

                <div className="asset-selector">
                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="useNative"
                            name="useNative"
                            checked={formData.useNative}
                            onChange={handleChange}
                        />
                        <label htmlFor="useNative">Use Native XLM</label>
                    </div>

                    {!formData.useNative && (
                        <>
                            <div className="form-group">
                                <label htmlFor="assetCode">Asset Code</label>
                                <input
                                    type="text"
                                    id="assetCode"
                                    name="assetCode"
                                    placeholder="e.g., USD, EUR, BTC"
                                    value={formData.assetCode}
                                    onChange={handleChange}
                                    className="form-input"
                                    maxLength="12"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="assetIssuer">Asset Issuer Account</label>
                                <input
                                    type="text"
                                    id="assetIssuer"
                                    name="assetIssuer"
                                    placeholder="Issuer's Stellar account ID"
                                    value={formData.assetIssuer}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </>
                    )}
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

            {paymentResult && (
                <div className="payment-result">
                    <h3>Payment Details</h3>
                    <div className="result-item">
                        <label>Transaction Hash:</label>
                        <code>{paymentResult.hash}</code>
                    </div>
                    <div className="result-item">
                        <label>Ledger:</label>
                        <code>{paymentResult.ledger}</code>
                    </div>
                    <div className="result-item">
                        <label>Envelope XDR:</label>
                        <code className="xdr-code">{paymentResult.envelope_xdr}</code>
                    </div>
                </div>
            )}

            <div className="info-box">
                <h4>ℹ️ Custom Assets on Stellar</h4>
                <p>The server will sign all payments with its own secret key; you don’t need to provide one.</p>
                <p>Send payments using any custom-issued asset on the Stellar network:</p>
                <ul>
                    <li>Specify the asset code (1-12 characters)</li>
                    <li>Provide the issuer's account address</li>
                    <li>Recipient must have a trust line to the asset</li>
                    <li>Payments will fail if trust line doesn't exist</li>
                </ul>
            </div>
        </div>
    );
}

export default Payment;
