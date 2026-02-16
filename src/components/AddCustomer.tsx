import { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { customerApi } from '../utils/api';

export function AddCustomer() {
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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      const response = await customerApi.create({
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

      if (response.success) {
        setCalculatedScore(response.customer.creditScore);
        setRiskLevel(response.customer.riskLevel);
        setSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({
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
          setSubmitted(false);
          setCalculatedScore(null);
          setRiskLevel('');
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 p-8 rounded-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-green-900 mb-2">Customer Added Successfully!</h3>
          <p className="text-green-700 mb-4">
            {formData.name} has been added to the system.
          </p>
          <div className="bg-white p-6 rounded-lg border border-green-200 max-w-sm mx-auto">
            <p className="text-sm text-gray-600 mb-2">Calculated Credit Score</p>
            <p className="text-5xl font-bold text-green-600">{calculatedScore}</p>
            <p className="text-sm text-gray-600 mt-2">
              {riskLevel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Add New Customer</h2>
            <p className="text-sm text-gray-600">Enter customer details to calculate credit score</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="John Doe"
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
                  placeholder="12345678"
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
                  placeholder="+254 712 345 678"
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
                  placeholder="john@example.com"
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
                  placeholder="85"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of on-time payments</p>
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
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">Debt to available credit ratio</p>
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
                  placeholder="24"
                />
                <p className="text-xs text-gray-500 mt-1">Length of credit history</p>
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
                  placeholder="2"
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
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {submitting ? 'Adding Customer...' : 'Calculate Score & Add Customer'}
          </button>
        </form>
      </div>
    </div>
  );
}