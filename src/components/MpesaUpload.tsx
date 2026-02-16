import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { mpesaApi } from '../utils/api';

interface TransactionAnalysis {
  totalTransactions: number;
  totalInflow: number;
  totalOutflow: number;
  averageBalance: number;
  consistentIncome: boolean;
  savingsBehavior: string;
  riskIndicators: string[];
  monthlyData: Array<{
    month: string;
    inflow: number;
    outflow: number;
  }>;
  scoreImpact: number;
}

export function MpesaUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    
    try {
      // In a real implementation, you would select a customer first
      // For demo purposes, we'll use a placeholder customer ID
      const customerId = 'demo-customer';
      
      const response = await mpesaApi.analyze(customerId, file.name, file.size);
      
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze M-Pesa statement:', error);
      alert('Failed to analyze statement. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setAnalysis(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">M-Pesa Statement Analysis</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload a customer's M-Pesa statement (PDF or CSV) to analyze transaction patterns, income stability, 
              and spending behavior. This will help improve credit score accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Upload M-Pesa Statement</h2>
        
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your M-Pesa statement here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">Supports PDF and CSV files</p>
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Statement'}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analysis.totalTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Inflow</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                KSh {analysis.totalInflow.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Money received</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Outflow</p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                KSh {analysis.totalOutflow.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Money spent</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Net Balance</p>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className={`text-2xl font-bold ${analysis.averageBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KSh {analysis.averageBalance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Average balance</p>
            </div>
          </div>

          {/* Monthly Cash Flow Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Cash Flow Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} name="Inflow" />
                <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Outflow" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Patterns */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Transaction Patterns</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analysis.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
                  <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Behavior */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Financial Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Income Consistency</span>
                  {analysis.consistentIncome ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Consistent
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      Irregular
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Savings Behavior</span>
                  <span className={`font-medium ${
                    analysis.savingsBehavior === 'Good' ? 'text-green-600' : 
                    analysis.savingsBehavior === 'Moderate' ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {analysis.savingsBehavior}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Cash Flow Ratio</span>
                  <span className={`font-medium ${
                    analysis.totalInflow > analysis.totalOutflow ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((analysis.totalInflow / analysis.totalOutflow) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Transaction Frequency</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(analysis.totalTransactions / 6)} /month
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          {analysis.riskIndicators.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Risk Indicators Detected</h3>
                  <ul className="space-y-1">
                    {analysis.riskIndicators.map((indicator, index) => (
                      <li key={index} className="text-sm text-amber-700">• {indicator}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Score Impact */}
          <div className={`p-6 rounded-lg border ${
            analysis.scoreImpact > 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {analysis.scoreImpact > 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    analysis.scoreImpact > 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Credit Score Impact
                  </h3>
                  <p className={`text-sm ${
                    analysis.scoreImpact > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {analysis.scoreImpact > 0 
                      ? 'Positive transaction patterns detected' 
                      : 'Concerning spending patterns detected'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${
                  analysis.scoreImpact > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.scoreImpact > 0 ? '+' : ''}{analysis.scoreImpact}
                </p>
                <p className="text-sm text-gray-600">Points</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Lending Recommendations</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {analysis.consistentIncome && analysis.totalInflow > analysis.totalOutflow && (
                <>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Customer shows consistent income flow, indicating stable employment or business</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Positive savings behavior with net positive cash flow</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Low risk for loan default - consider favorable lending terms</span>
                  </p>
                </>
              )}
              {!analysis.consistentIncome || analysis.totalInflow <= analysis.totalOutflow && (
                <>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Irregular income patterns may indicate unstable income source</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Outflow exceeds inflow - customer may have difficulty with repayment</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Consider requiring collateral or co-signer for loan approval</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}