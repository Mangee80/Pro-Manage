import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { apiRequest } from '../../utils/authUtils';
import { getApiUrl } from '../../config/apiConfig';
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
  Cell
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

// Gantt Chart Component
const GanttChartView = ({ cards }) => {
  // Safety check for cards prop
  if (!cards || !Array.isArray(cards)) {
    return (
      <div className="gantt-empty-state">
        <p>No tasks with due dates found</p>
        <p className="gantt-empty-subtitle">Add due dates to your tasks to see them on the timeline</p>
      </div>
    );
  }

  const parseDueDate = (dueDateStr) => {
    if (!dueDateStr) return null;
    // Format: "02 Jan" or "02 Jan 2024"
    const parts = dueDateStr.trim().split(' ');
    if (parts.length < 2) return null;
    
    const day = parseInt(parts[0]);
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const month = monthMap[parts[1]];
    if (month === undefined) return null;
    
    const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
    return new Date(year, month, day);
  };

  const getStartDate = (dueDate) => {
    // Start date is 7 days before due date
    const start = new Date(dueDate);
    start.setDate(start.getDate() - 7);
    return start;
  };

  const prepareGanttData = () => {
    const now = new Date();
    const ganttData = cards.map(card => {
      const dueDate = parseDueDate(card.dueDate);
      if (!dueDate) return null;
      
      const startDate = getStartDate(dueDate);
      const daysDiff = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Calculate position and width
      const daysFromNow = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      const todayPosition = 0;
      
      return {
        id: card._id,
        title: card.title,
        startDate,
        dueDate,
        daysDiff,
        daysFromNow,
        tag: card.tag,
        priorityColor: card.priorityColor,
        priorityText: card.priorityText
      };
    }).filter(item => item !== null);

    // Sort by start date
    return ganttData.sort((a, b) => a.startDate - b.startDate);
  };

  const ganttData = prepareGanttData();
  const today = new Date();
  
  // Calculate date range for display (30 days view)
  const startViewDate = new Date(today);
  startViewDate.setDate(startViewDate.getDate() - 7);
  const endViewDate = new Date(today);
  endViewDate.setDate(endViewDate.getDate() + 23);
  
  const daysInView = 30;

  const getDatePosition = (date) => {
    const diffDays = Math.ceil((date - startViewDate) / (1000 * 60 * 60 * 24));
    return (diffDays / daysInView) * 100;
  };

  const getBarWidth = (startDate, dueDate) => {
    const days = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));
    return (days / daysInView) * 100;
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (ganttData.length === 0) {
    return (
      <div className="gantt-empty-state">
        <p>No tasks with due dates found</p>
        <p className="gantt-empty-subtitle">Add due dates to your tasks to see them on the timeline</p>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-task-column">
          <span>Task</span>
        </div>
        <div className="gantt-timeline-column">
          {/* Date labels */}
          <div className="gantt-dates-row">
            {Array.from({ length: 6 }).map((_, i) => {
              const date = new Date(startViewDate);
              date.setDate(date.getDate() + (i * 5));
              return (
                <div key={i} className="gantt-date-label" style={{ left: `${(i * 5 / daysInView) * 100}%` }}>
                  {formatDateLabel(date)}
                </div>
              );
            })}
          </div>
          {/* Today marker */}
          <div 
            className="gantt-today-line"
            style={{ left: `${getDatePosition(today)}%` }}
          />
        </div>
      </div>
      <div className="gantt-body">
        {ganttData.map((item, index) => {
          const leftPos = getDatePosition(item.startDate);
          const width = getBarWidth(item.startDate, item.dueDate);
          const isPast = item.dueDate < today;
          const isOverdue = item.dueDate < today && item.tag !== 'Done';
          
          return (
            <div key={item.id || index} className="gantt-row">
              <div className="gantt-task-name">
                <div className="gantt-task-priority" style={{ backgroundColor: item.priorityColor }} />
                <span className="gantt-task-title" title={item.title}>
                  {item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}
                </span>
                <span className="gantt-task-tag">{item.tag}</span>
              </div>
              <div className="gantt-bar-container">
                <div
                  className={`gantt-bar ${isOverdue ? 'overdue' : isPast ? 'completed' : ''}`}
                  style={{
                    left: `${Math.max(0, leftPos)}%`,
                    width: `${Math.max(3, width)}%`,
                    backgroundColor: isOverdue ? '#EF4444' : item.priorityColor || '#3b82f6'
                  }}
                  title={`${item.title} - ${formatDateLabel(item.startDate)} to ${formatDateLabel(item.dueDate)}`}
                >
                  <div className="gantt-bar-label">
                    {formatDateLabel(item.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    fetchCardsForGantt();
  }, []);

  const fetchCardsForGantt = async () => {
    try {
      const userID = localStorage.getItem('userID');
      if (!userID) return;

      const response = await apiRequest(`${getApiUrl('api/card/getcards')}?userID=${userID}`, {
        method: 'GET'
      });

      if (response.ok) {
        const { boards } = await response.json();
        // Flatten all cards from all boards
        const allCards = boards.flatMap(board => board.cards || []);
        // Filter cards with due dates
        const cardsWithDueDates = allCards.filter(card => card.dueDate);
        setCardsData(cardsWithDueDates);
      }
    } catch (error) {
      console.error('Error fetching cards for Gantt:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Use JWT authentication instead of localStorage userID
      const response = await apiRequest(getApiUrl('api/card/analytics'));
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

  // Calculate Due Soon - tasks due in next 7 days and not completed
  const calculateDueSoon = () => {
    if (!cardsData || cardsData.length === 0) {
      // If cardsData not loaded yet, try to calculate from all cards
      return analyticsData.dueDateTasks || 0;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);
    
    return cardsData.filter(card => {
      if (!card.dueDate || card.tag === 'Done') return false;
      
      try {
        // Parse due date
        const parts = card.dueDate.trim().split(' ');
        if (parts.length < 2) return false;
        
        const day = parseInt(parts[0]);
        if (isNaN(day)) return false;
        
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const month = monthMap[parts[1]];
        if (month === undefined) return false;
        
        const year = parts[2] ? parseInt(parts[2]) : today.getFullYear();
        const dueDate = new Date(year, month, day);
        dueDate.setHours(0, 0, 0, 0);
        
        // Check if due date is between today and 7 days later
        return dueDate >= today && dueDate <= sevenDaysLater;
      } catch (error) {
        return false;
      }
    }).length;
  };

  const dueSoonCount = calculateDueSoon();

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
          <button className="refresh-btn-compact" onClick={() => {
            fetchAnalyticsData();
            fetchCardsForGantt();
          }}>
            <GoArrowUp size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-content-wrapper">
        {/* Left - Main Content */}
        <div className="analytics-main-content">
          {/* Top - Gantt Chart */}
          <div className="gantt-section">
            <ChartCard title="Task Timeline (Gantt Chart)" className="gantt-chart-card-compact">
              <GanttChartView cards={cardsData} />
            </ChartCard>
          </div>

          {/* Middle - Charts Side by Side */}
          <div className="charts-row">
            {/* Task Status Distribution */}
            <ChartCard title="Task Status Distribution" className="pie-chart-card-compact">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
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

            {/* Priority Distribution */}
            <ChartCard title="Priority Distribution" className="bar-chart-card-compact">
              <ResponsiveContainer width="100%" height={160}>
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
          </div>
        </div>

        {/* Right Side - Summary Cards & Task Breakdown */}
        <div className="summary-cards-sidebar">
          {/* Task Breakdown Table */}
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

          {/* Summary Cards */}
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
            value={dueSoonCount}
            icon={GoAlert}
            color="#EF4444"
            subtitle="Next 7 days"
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
