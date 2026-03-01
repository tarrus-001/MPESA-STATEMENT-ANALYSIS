import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { customerApi } from '../utils/api';
import { EditCustomerModal } from './EditCustomerModal';

export function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'risk'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.idNumber.includes(searchTerm) ||
        customer.phoneNumber.includes(searchTerm);
      const matchesRisk = filterRisk === 'All' || customer.riskLevel === filterRisk;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'score') {
        comparison = a.creditScore - b.creditScore;
      } else if (sortBy === 'risk') {
        const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        comparison = riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'High': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 600) return 'text-amber-600';
    return 'text-red-600';
  };

  const toggleSort = (column: 'name' | 'score' | 'risk') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await customerApi.delete(id);
        await loadCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer');
        setLoading(false); // Only stop loading if error, loadCustomers stops it otherwise
      }
    }
  };

  return (
    <div className="space-y-6">
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onUpdate={loadCustomers}
        />
      )}

      {/* Filters */}
      {/* ... (keep existing filters code) ... */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete ALL customers? This action cannot be undone.')) {
              try {
                setLoading(true);
                await customerApi.deleteAll();
                await loadCustomers();
              } catch (error) {
                console.error('Failed to delete customers:', error);
                alert('Failed to delete customers');
                setLoading(false);
              }
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete All Customers
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID Number</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Credit Score
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('risk')}
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Risk Level
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Loans</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Users className="w-12 h-12 opacity-30" />
                      <p className="text-base font-medium text-gray-500">
                        {customers.length === 0
                          ? 'No customers found'
                          : 'No customers match your filters'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {customers.length === 0
                          ? 'Add your first customer using the "Add Customer" tab.'
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                      {customers.length === 0 && (
                        <button
                          onClick={loadCustomers}
                          className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{customer.name}</td>
                    <td className="py-3 px-4 font-mono text-sm">{customer.idNumber}</td>
                    <td className="py-3 px-4 text-sm">{customer.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${getScoreColor(customer.creditScore)}`}>
                        {customer.creditScore}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.riskLevel)}`}>
                        {customer.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{customer.numberOfLoans}</td>
                    <td className="py-3 px-4 text-sm">KSh {customer.totalLoansAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredCustomers.length}</span> of <span className="font-medium">{customers.length}</span> customers
          </p>
        </div>
      </div>
    </div>
  );
}