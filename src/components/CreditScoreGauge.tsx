interface CreditScoreGaugeProps {
  score: number;
}

export function CreditScoreGauge({ score }: CreditScoreGaugeProps) {
  // Calculate percentage for the arc (300-850 range)
  const percentage = ((score - 300) / 550) * 100;
  
  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Very Good';
    if (score >= 650) return 'Good';
    if (score >= 600) return 'Fair';
    if (score >= 550) return 'Poor';
    return 'Very Poor';
  };

  const getColor = (score: number) => {
    if (score >= 700) return '#10b981'; // green
    if (score >= 600) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-32">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 90 A 90 90 0 0 1 190 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 10 90 A 90 90 0 0 1 190 90"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 283} 283`}
          />
          {/* Score text */}
          <text
            x="100"
            y="75"
            textAnchor="middle"
            className="text-4xl font-bold"
            fill={getColor(score)}
          >
            {score}
          </text>
        </svg>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xl font-semibold" style={{ color: getColor(score) }}>
          {getScoreLabel(score)}
        </p>
        <p className="text-sm text-gray-600 mt-1">Credit Score Range: 300-850</p>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">300-599</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-600">600-699</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">700-850</span>
        </div>
      </div>
    </div>
  );
}
