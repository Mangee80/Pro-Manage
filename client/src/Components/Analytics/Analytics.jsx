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
        <p>No checklists found</p>
        <p className="gantt-empty-subtitle">Add checklists to your cards to see them on the timeline</p>
      </div>
    );
  }

  // Inactivity threshold in days (5 days as per user requirement)
  const INACTIVITY_THRESHOLD_DAYS = 5;

  // Prepare checklist data with activity segments
  const prepareChecklistGanttData = () => {
    const now = new Date();
    const checklistData = [];

    cards.forEach(card => {
      if (!card.checklists || card.checklists.length === 0) return;

      card.checklists.forEach((checklist, checklistIndex) => {
        // Parse creation date
        const createdAt = checklist.createdAt 
          ? new Date(checklist.createdAt) 
          : (checklist.activityHistory && checklist.activityHistory.length > 0 
              ? new Date(checklist.activityHistory[0].date) 
              : now);
        
        // Get all activity dates from activity history
        const activityDates = [];
        if (checklist.activityHistory && checklist.activityHistory.length > 0) {
          checklist.activityHistory.forEach(activity => {
            activityDates.push(new Date(activity.date));
          });
        } else {
          // If no activity history, use creation and lastModified dates
          activityDates.push(createdAt);
          if (checklist.lastModified) {
            activityDates.push(new Date(checklist.lastModified));
          }
        }

        // Sort activity dates
        activityDates.sort((a, b) => a - b);

        // Get last activity date
        const lastModified = checklist.lastModified 
          ? new Date(checklist.lastModified) 
          : (activityDates.length > 0 ? activityDates[activityDates.length - 1] : createdAt);

        // Detect activity segments and breaks
        const segments = [];
        const thresholdMillis = INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
        const recentActivityThreshold = new Date(now.getTime() - thresholdMillis);
        
        if (activityDates.length === 0) {
          // No activity history - show from creation to now if created recently
          const isRecentlyCreated = createdAt >= recentActivityThreshold;
          if (isRecentlyCreated) {
            segments.push({
              startDate: createdAt,
              endDate: now,
              isActive: true
            });
          }
        } else {
          // Build segments from activity dates
          let currentSegmentStart = null;
          let segmentEndDate = null;

          for (let i = 0; i < activityDates.length; i++) {
            const currentActivityDate = activityDates[i];
            
            if (currentSegmentStart === null) {
              // Start of first segment
              // If first activity is soon after creation, start from creation
              const daysFromCreation = Math.ceil(
                (currentActivityDate - createdAt) / (1000 * 60 * 60 * 24)
              );
              
              if (daysFromCreation <= INACTIVITY_THRESHOLD_DAYS) {
                currentSegmentStart = createdAt;
              } else {
                currentSegmentStart = currentActivityDate;
              }
              segmentEndDate = currentActivityDate;
            } else {
              // Check if this activity continues the current segment or starts a new one
              const daysSinceLastActivity = Math.ceil(
                (currentActivityDate - segmentEndDate) / (1000 * 60 * 60 * 24)
              );

              if (daysSinceLastActivity <= INACTIVITY_THRESHOLD_DAYS) {
                // Continue current segment
                segmentEndDate = currentActivityDate;
              } else {
                // Break detected - end current segment and start new one
                segments.push({
                  startDate: currentSegmentStart,
                  endDate: segmentEndDate,
                  isActive: true
                });
                currentSegmentStart = currentActivityDate;
                segmentEndDate = currentActivityDate;
              }
            }
          }

          // Add final segment
          if (currentSegmentStart !== null) {
            const isRecentlyActive = lastModified >= recentActivityThreshold;
            const finalEndDate = isRecentlyActive ? now : lastModified;
            
            segments.push({
              startDate: currentSegmentStart,
              endDate: finalEndDate,
              isActive: isRecentlyActive
            });
          }
        }

        checklistData.push({
          id: `${card._id}-${checklistIndex}`,
          cardId: card._id,
          cardTitle: card.title,
          checklistTitle: checklist.title,
          checklistIndex,
          createdAt,
          lastModified,
          segments,
          priorityColor: card.priorityColor,
          priorityText: card.priorityText,
          tag: card.tag,
          completed: checklist.completed
        });
      });
    });

    // Sort by creation date
    return checklistData.sort((a, b) => a.createdAt - b.createdAt);
  };

  const checklistData = prepareChecklistGanttData();
  const today = new Date();
  
  // Calculate date range for display (90 days view for better visibility)
  const startViewDate = new Date(today);
  startViewDate.setDate(startViewDate.getDate() - 30);
  const endViewDate = new Date(today);
  endViewDate.setDate(endViewDate.getDate() + 60);
  
  const daysInView = 90;

  const getDatePosition = (date) => {
    const diffDays = Math.ceil((date - startViewDate) / (1000 * 60 * 60 * 24));
    return (diffDays / daysInView) * 100;
  };

  const getBarWidth = (startDate, endDate) => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return (days / daysInView) * 100;
  };

  const formatDateLabel = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (checklistData.length === 0) {
    return (
      <div className="gantt-empty-state">
        <p>No checklists found</p>
        <p className="gantt-empty-subtitle">Add checklists to your cards to see them on the timeline</p>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <div className="gantt-task-column">
          <span>Checklist</span>
        </div>
        <div className="gantt-timeline-column">
          {/* Date labels - More detailed */}
          <div className="gantt-dates-row">
            {Array.from({ length: 19 }).map((_, i) => {
              const date = new Date(startViewDate);
              date.setDate(date.getDate() + (i * 5));
              return (
                <div key={i} className="gantt-date-label" style={{ left: `${(i * 5 / daysInView) * 100}%` }}>
                  {formatDateLabel(date)}
                </div>
              );
            })}
          </div>
          {/* Week markers */}
          <div className="gantt-week-markers">
            {Array.from({ length: Math.ceil(daysInView / 7) }).map((_, i) => {
              const weekStart = new Date(startViewDate);
              weekStart.setDate(weekStart.getDate() + (i * 7));
              return (
                <div 
                  key={i} 
                  className="gantt-week-marker" 
                  style={{ left: `${(i * 7 / daysInView) * 100}%` }}
                />
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
        {checklistData.map((item, index) => {
          return (
            <div key={item.id || index} className="gantt-row">
              <div className="gantt-task-name">
                <div className="gantt-task-priority" style={{ backgroundColor: item.priorityColor }} />
                <span className="gantt-task-title" title={`${item.cardTitle} - ${item.checklistTitle}`}>
                  {item.cardTitle.length > 20 
                    ? `${item.cardTitle.substring(0, 20)}...` 
                    : item.cardTitle}
                  {': '}
                  {item.checklistTitle.length > 15 
                    ? `${item.checklistTitle.substring(0, 15)}...` 
                    : item.checklistTitle}
                </span>
              </div>
              <div className="gantt-bar-container">
                {item.segments
                  .filter(segment => {
                    // Filter out zero-width segments (they represent breaks)
                    const width = getBarWidth(segment.startDate, segment.endDate);
                    return width > 0.1; // Minimum width threshold
                  })
                  .map((segment, segIndex) => {
                    const leftPos = getDatePosition(segment.startDate);
                    const width = getBarWidth(segment.startDate, segment.endDate);
                    const isPast = segment.endDate < today;
                    const isActive = segment.isActive && !isPast;
                    
                    return (
                      <div
                        key={segIndex}
                        className={`gantt-bar-segment ${isActive ? 'active' : 'inactive'} ${isPast ? 'past' : ''} ${item.completed ? 'completed' : ''}`}
                        style={{
                          left: `${Math.max(0, leftPos)}%`,
                          width: `${Math.max(2, width)}%`,
                          backgroundColor: item.completed 
                            ? '#10B981' 
                            : (isActive ? item.priorityColor || '#3b82f6' : '#cbd5e1')
                        }}
                        title={`${item.checklistTitle} - ${formatDateLabel(segment.startDate)} to ${formatDateLabel(segment.endDate)} ${segment.isActive ? '(Active)' : '(Inactive/Break)'}`}
                      />
                    );
                  })}
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
        // Filter cards with checklists (since we're showing checklist timelines)
        const cardsWithChecklists = allCards.filter(card => 
          card.checklists && card.checklists.length > 0
        );
        setCardsData(cardsWithChecklists);
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
        {/* Left - Main Content - Gantt Chart */}
        <div className="analytics-main-content">
          <div className="gantt-section">
            <ChartCard title="Checklist Activity Timeline (Gantt Chart)" className="gantt-chart-card-compact">
              <GanttChartView cards={cardsData} />
            </ChartCard>
          </div>
        </div>

        {/* Right Side - Charts & Summary Cards */}
        <div className="summary-cards-sidebar">
          {/* Task Breakdown Table - Commented out for future use */}
          {/* <div className="detailed-stats-compact">
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
          </div> */}

          {/* Task Status Distribution Chart */}
          <ChartCard title="Task Status Distribution" className="pie-chart-card-compact">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
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

          {/* Priority Distribution Chart */}
          <ChartCard title="Priority Distribution" className="bar-chart-card-compact">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
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
