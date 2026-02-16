import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { customerApi } from '../utils/api';

interface EditCustomerModalProps {
    customer: any;
    onClose: () => void;
    onUpdate: () => void;
}

export function EditCustomerModal({ customer, onClose, onUpdate }: EditCustomerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        idNumber: '',
        phoneNumber: '',
        email: '',
        paymentHistory: '',
        creditUtilization: '',
        creditHistoryMonths: '',
        numberOfLoans: '',
        totalLoansAmount: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                idNumber: customer.idNumber || '',
                phoneNumber: customer.phoneNumber || '',
                email: customer.email || '',
                paymentHistory: customer.paymentHistory?.toString() || '',
                creditUtilization: customer.creditUtilization?.toString() || '',
                creditHistoryMonths: customer.creditHistoryMonths?.toString() || '',
                numberOfLoans: customer.numberOfLoans?.toString() || '',
                totalLoansAmount: customer.totalLoansAmount?.toString() || '',
            });
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await customerApi.update(customer.id, {
                name: formData.name,
                idNumber: formData.idNumber,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                paymentHistory: parseInt(formData.paymentHistory),
                creditUtilization: parseInt(formData.creditUtilization),
                creditHistoryMonths: parseInt(formData.creditHistoryMonths),
                numberOfLoans: parseInt(formData.numberOfLoans),
                totalLoansAmount: parseInt(formData.totalLoansAmount),
            });

            onUpdate();
            onClose();
        } catch (err) {
            console.error('Failed to update customer:', err);
            setError('Failed to update customer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Customer</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Personal Information */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID Number *
                                </label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    required
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Credit Information */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-4">Credit Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment History (%) *
                                </label>
                                <input
                                    type="number"
                                    name="paymentHistory"
                                    required
                                    min="0"
                                    max="100"
                                    value={formData.paymentHistory}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credit Utilization (%) *
                                </label>
                                <input
                                    type="number"
                                    name="creditUtilization"
                                    required
                                    min="0"
                                    max="100"
                                    value={formData.creditUtilization}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credit History (months) *
                                </label>
                                <input
                                    type="number"
                                    name="creditHistoryMonths"
                                    required
                                    min="0"
                                    value={formData.creditHistoryMonths}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Active Loans *
                                </label>
                                <input
                                    type="number"
                                    name="numberOfLoans"
                                    required
                                    min="0"
                                    value={formData.numberOfLoans}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Loans Amount (KSh) *
                                </label>
                                <input
                                    type="number"
                                    name="totalLoansAmount"
                                    required
                                    min="0"
                                    value={formData.totalLoansAmount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:bg-blue-400"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
