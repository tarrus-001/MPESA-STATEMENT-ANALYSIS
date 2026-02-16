import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CustomerLookup } from './components/CustomerLookup';
import { CustomerList } from './components/CustomerList';
import { AddCustomer } from './components/AddCustomer';
import { CreditHistory } from './components/CreditHistory';
import { MpesaUpload } from './components/MpesaUpload';
import { InitializeData } from './components/InitializeData';
import { BarChart3, Users, UserPlus, History, FileText } from 'lucide-react';

type TabType = 'dashboard' | 'lookup' | 'customers' | 'add' | 'history' | 'mpesa';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <>
      <InitializeData />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MPESA STATEMENT ANALYSIS SYSTEM</h1>
                <p className="text-sm text-gray-600 mt-1">Assess customer repayment potential via M-Pesa</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">System Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('lookup')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'lookup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <Users className="w-4 h-4" />
                Check Score
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'customers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <Users className="w-4 h-4" />
                All Customers
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'add'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <UserPlus className="w-4 h-4" />
                Add Customer
              </button>
              <button
                onClick={() => setActiveTab('mpesa')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'mpesa'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <FileText className="w-4 h-4" />
                M-Pesa Analysis
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'lookup' && <CustomerLookup />}
          {activeTab === 'customers' && <CustomerList />}
          {activeTab === 'add' && <AddCustomer />}
          {activeTab === 'mpesa' && <MpesaUpload />}
          {activeTab === 'history' && <CreditHistory />}
        </main>
      </div>
    </>
  );
}