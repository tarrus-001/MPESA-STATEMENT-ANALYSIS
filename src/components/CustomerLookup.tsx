import { useState } from 'react';
import { Search, Phone, Mail, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { customerApi } from '../utils/api';
import { CreditScoreGauge } from './CreditScoreGauge';

export function CustomerLookup() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const response = await customerApi.search(searchTerm);
      setSearchResult(response.results?.[0] || null);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResult(null);
      setSearchPerformed(true);
    } finally {
      setSearching(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Check Customer Credit Score</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter ID Number, Phone Number, or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            <Search className="w-4 h-4" />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searchPerformed && !searchResult && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">No customer found</p>
              <p className="text-sm text-amber-700 mt-1">
                Please check the information and try again, or add this customer to the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {searchResult && (
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{searchResult.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Customer Details</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(searchResult.riskLevel)}`}>
                {searchResult.riskLevel} Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-mono font-medium">{searchResult.idNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{searchResult.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{searchResult.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Loans</p>
                  <p className="font-medium">KSh {searchResult.totalLoansAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Score */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-6">Credit Score Analysis</h3>
            <CreditScoreGauge score={searchResult.creditScore} />
          </div>

          {/* Score Factors */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Score Factors</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Payment History</span>
                  <span className="text-sm font-medium">{searchResult.paymentHistory}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${searchResult.paymentHistory >= 80 ? 'bg-green-500' : searchResult.paymentHistory >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${searchResult.paymentHistory}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Credit Utilization</span>
                  <span className="text-sm font-medium">{searchResult.creditUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${searchResult.creditUtilization <= 30 ? 'bg-green-500' : searchResult.creditUtilization <= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${searchResult.creditUtilization}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Credit History Length</span>
                  <span className="text-sm font-medium">{searchResult.creditHistoryMonths} months</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.min((searchResult.creditHistoryMonths / 60) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Number of Loans</span>
                  <span className="text-sm font-medium">{searchResult.numberOfLoans} active loans</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${searchResult.numberOfLoans <= 2 ? 'bg-green-500' : searchResult.numberOfLoans <= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((searchResult.numberOfLoans / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-6 rounded-lg border ${
            searchResult.riskLevel === 'Low' 
              ? 'bg-green-50 border-green-200' 
              : searchResult.riskLevel === 'Medium' 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <TrendingUp className={`w-6 h-6 mt-1 ${
                searchResult.riskLevel === 'Low' 
                  ? 'text-green-600' 
                  : searchResult.riskLevel === 'Medium' 
                  ? 'text-amber-600' 
                  : 'text-red-600'
              }`} />
              <div>
                <h4 className={`font-semibold ${
                  searchResult.riskLevel === 'Low' 
                    ? 'text-green-900' 
                    : searchResult.riskLevel === 'Medium' 
                    ? 'text-amber-900' 
                    : 'text-red-900'
                }`}>
                  Lending Recommendation
                </h4>
                <p className={`text-sm mt-1 ${
                  searchResult.riskLevel === 'Low' 
                    ? 'text-green-700' 
                    : searchResult.riskLevel === 'Medium' 
                    ? 'text-amber-700' 
                    : 'text-red-700'
                }`}>
                  {searchResult.riskLevel === 'Low' && 
                    'This customer has excellent credit history. Low risk for lending with favorable terms.'}
                  {searchResult.riskLevel === 'Medium' && 
                    'This customer has moderate credit history. Proceed with caution and consider higher interest rates or collateral.'}
                  {searchResult.riskLevel === 'High' && 
                    'This customer has poor credit history. High risk for lending. Consider requiring substantial collateral or declining the loan.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}