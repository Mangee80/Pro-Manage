import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { apiRequest } from '../../utils/authUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  GoArrowUp, 
  GoClock, 
  GoCheckCircle, 
  GoAlert,
  GoProject,
  GoGraph
} from "react-icons/go";

const SummaryCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="summary-card-compact" style={{ borderLeft: `3px solid ${color}` }}>
    <div className="summary-card-icon-compact" style={{ backgroundColor: `${color}20` }}>
      <Icon size={18} color={color} />
    </div>
    <div className="summary-card-content-compact">
      <div className="summary-card-value-compact">{value}</div>
      <div className="summary-card-title-compact">{title}</div>
      {subtitle && <div className="summary-card-subtitle-compact">{subtitle}</div>}
    </div>
    {trend && (
      <div className="trend-indicator-compact" style={{ color: trend > 0 ? '#10B981' : '#EF4444' }}>
        {trend > 0 ? '+' : ''}{trend}%
      </div>
    )}
      </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`chart-card-compact ${className}`}>
    <div className="chart-card-header-compact">
      <h3 className="chart-card-title-compact">{title}</h3>
      </div>
    <div className="chart-card-content-compact">
      {children}
      </div>
    </div>
  );

const ProgressRing = ({ percentage, color, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-percentage">{percentage}%</span>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Use JWT authentication instead of localStorage userID
      const response = await apiRequest('http://localhost:5000/api/card/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-error">
        <p>Failed to load analytics data. Please try again.</p>
      </div>
    );
  }

  // Calculate totals and percentages
  const totalTasks = 
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0) +
    (analyticsData.completedTasks || 0);

  const completedPercentage = totalTasks > 0 ? Math.round((analyticsData.completedTasks || 0) / totalTasks * 100) : 0;
  const pendingPercentage = totalTasks > 0 ? Math.round(((analyticsData.backlogTasks || 0) + (analyticsData.todoTasks || 0) + (analyticsData.inProgressTasks || 0)) / totalTasks * 100) : 0;

  // Data for charts
  const taskStatusData = [
    { name: 'Backlog', value: analyticsData.backlogTasks || 0, color: '#36A2EB' },
    { name: 'To-do', value: analyticsData.todoTasks || 0, color: '#FFCE56' },
    { name: 'In Progress', value: analyticsData.inProgressTasks || 0, color: '#FF6384' },
    { name: 'Completed', value: analyticsData.completedTasks || 0, color: '#4BC0C0' }
  ];

  const priorityData = [
    { name: 'Low', value: analyticsData.lowPriorityTasks || 0, color: '#4BC0C0' },
    { name: 'Moderate', value: analyticsData.moderatePriorityTasks || 0, color: '#FFCE56' },
    { name: 'High', value: analyticsData.highPriorityTasks || 0, color: '#FF6384' }
  ];

  const weeklyProgressData = [
    { day: 'Mon', completed: 5, total: 8 },
    { day: 'Tue', completed: 7, total: 10 },
    { day: 'Wed', completed: 6, total: 9 },
    { day: 'Thu', completed: 8, total: 12 },
    { day: 'Fri', completed: 9, total: 11 },
    { day: 'Sat', completed: 4, total: 6 },
    { day: 'Sun', completed: 3, total: 5 }
  ];

  return (
    <div className="analytics-page-compact">
      {/* Header - Center aligned */}
      <div className="analytics-header-compact">
        <div className="analytics-header-content-compact">
          <h1 className="analytics-title-compact">
            <GoGraph size={24} />
            Analytics Dashboard
          </h1>
          <p className="analytics-subtitle-compact">Track your project progress and performance</p>
        </div>
        <div className="analytics-actions-compact">
          <button className="refresh-btn-compact" onClick={fetchAnalyticsData}>
            <GoArrowUp size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-content-wrapper">
        {/* Right Side - Summary Cards (Compact Chips) */}
        <div className="summary-cards-sidebar">
          <SummaryCard
            title="Total Tasks"
            value={totalTasks}
            icon={GoProject}
            color="#246BFD"
            subtitle="All created tasks"
          />
          <SummaryCard
            title="Completed"
            value={analyticsData.completedTasks || 0}
            icon={GoCheckCircle}
            color="#10B981"
            subtitle={`${completedPercentage}% of total`}
            trend={12}
          />
          <SummaryCard
            title="Pending"
            value={(analyticsData.backlogTasks || 0) + (analyticsData.todoTasks || 0) + (analyticsData.inProgressTasks || 0)}
            icon={GoClock}
            color="#F59E0B"
            subtitle={`${pendingPercentage}% of total`}
          />
          <SummaryCard
            title="Due Soon"
            value={analyticsData.dueDateTasks || 0}
            icon={GoAlert}
            color="#EF4444"
            subtitle="Tasks with deadlines"
          />
          
          {/* Detailed Statistics Table - Below Chips */}
          <div className="detailed-stats-compact">
            <ChartCard title="Task Breakdown" className="stats-table-card-compact">
              <div className="stats-table-compact">
                <div className="stats-table-header-compact">
                  <span>Category</span>
                  <span>Count</span>
                  <span>%</span>
                  <span>Progress</span>
                </div>
                {taskStatusData.map((item, index) => (
                  <div key={index} className="stats-table-row-compact">
                    <div className="stats-category-compact">
                      <div className="category-dot-compact" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="stats-count-compact">{item.value}</span>
                    <span className="stats-percentage-compact">
                      {totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%
                    </span>
                    <div className="stats-progress-compact">
                      <div 
                        className="progress-bar-compact" 
                        style={{ 
                          width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Left Side - Charts */}
        <div className="charts-main-area">
          {/* Task Status Distribution */}
          <ChartCard title="Task Status Distribution" className="pie-chart-card-compact">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend-compact">
              {taskStatusData.map((item, index) => (
                <div key={index} className="legend-item-compact">
                  <div className="legend-color-compact" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-label-compact">{item.name}</span>
                  <span className="legend-value-compact">{item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Weekly Progress */}
          <ChartCard title="Weekly Progress" className="area-chart-card-compact">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stackId="1" 
                  stroke="#246BFD" 
                  fill="#246BFD" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Priority Distribution */}
          <ChartCard title="Priority Distribution" className="bar-chart-card-compact">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Completion Rate */}
          <ChartCard title="Overall Completion Rate" className="progress-card-compact">
            <div className="progress-content-compact">
              <ProgressRing 
                percentage={completedPercentage} 
                color="#10B981" 
                size={100} 
                strokeWidth={10}
              />
              <div className="progress-stats-compact">
                <div className="progress-stat-compact">
                  <span className="stat-label-compact">Completed</span>
                  <span className="stat-value-compact">{analyticsData.completedTasks || 0}</span>
                </div>
                <div className="progress-stat-compact">
                  <span className="stat-label-compact">Remaining</span>
                  <span className="stat-value-compact">{totalTasks - (analyticsData.completedTasks || 0)}</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
