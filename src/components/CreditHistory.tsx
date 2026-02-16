import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { activityApi } from '../utils/api';

export function CreditHistory() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await activityApi.getAll();
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity history...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 600) return 'text-amber-600';
    return 'text-red-600';
  };

  const getActionIcon = (change: string) => {
    if (change === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <DollarSign className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">Track all credit score checks and updates</p>
          </div>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No activity recorded yet</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActionIcon(activity.change)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.customerName}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getScoreColor(activity.score)}`}>
                    {activity.score}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600 mb-2">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600 mb-2">Recent Checks</p>
          <p className="text-3xl font-bold text-gray-900">
            {activities.filter(a => a.action === 'Credit Check Performed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600 mb-2">New Customers</p>
          <p className="text-3xl font-bold text-gray-900">
            {activities.filter(a => a.action === 'New Customer Added').length}
          </p>
        </div>
      </div>
    </div>
  );
}