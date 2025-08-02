import {React, useState, useEffect} from 'react';
import './Analytics.css';
import { GoDotFill } from "react-icons/go";

const SummaryCards = ({ analyticsData }) => {
  const totalTasks =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0) +
    (analyticsData.completedTasks || 0);
  const pendingTasks =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0);
  const overdueTasks = analyticsData.dueDateTasks || 0;
  return (
    <div className="summary-cards-row">
      <div className="summary-card total" title="Total number of tasks created.">
        <div className="summary-title">Total Tasks</div>
        <div className="summary-value">{totalTasks}</div>
      </div>
      <div className="summary-card completed" title="Number of tasks marked as completed.">
        <div className="summary-title">Completed</div>
        <div className="summary-value">{analyticsData.completedTasks || 0}</div>
      </div>
      <div className="summary-card pending" title="Tasks that are not yet completed.">
        <div className="summary-title">Pending</div>
        <div className="summary-value">{pendingTasks}</div>
      </div>
      <div className="summary-card overdue" title="Tasks with a due date.">
        <div className="summary-title">Overdue</div>
        <div className="summary-value">{overdueTasks}</div>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max, color }) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="progress-bar-bg" title={`Progress: ${value} of ${max}`}>
      <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }}></div>
    </div>
  );
};

const AnalyticsTable = ({ analyticsData }) => {
  const total =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0) +
    (analyticsData.completedTasks || 0);
  return (
    <div className="analytics-container">
      <div className="analytics-table-list">
        <div className="analytics-table-row" title="Backlog tasks are yet to be started.">
          <GoDotFill color='#36A2EB' size={20} />
          <span>Backlog Tasks</span>
          <span className="analytics-table-value">{analyticsData.backlogTasks}</span>
          <ProgressBar value={analyticsData.backlogTasks} max={total} color="#36A2EB" />
        </div>
        <div className="analytics-table-row" title="To-do tasks are planned but not started.">
          <GoDotFill color='#FFCE56' size={20} />
          <span>To-do Tasks</span>
          <span className="analytics-table-value">{analyticsData.todoTasks}</span>
          <ProgressBar value={analyticsData.todoTasks} max={total} color="#FFCE56" />
        </div>
        <div className="analytics-table-row" title="Tasks currently in progress.">
          <GoDotFill color='#FF6384' size={20} />
          <span>In-Progress Tasks</span>
          <span className="analytics-table-value">{analyticsData.inProgressTasks}</span>
          <ProgressBar value={analyticsData.inProgressTasks} max={total} color="#FF6384" />
        </div>
        <div className="analytics-table-row" title="Tasks that are completed.">
          <GoDotFill color='#4BC0C0' size={20} />
          <span>Completed Tasks</span>
          <span className="analytics-table-value">{analyticsData.completedTasks}</span>
          <ProgressBar value={analyticsData.completedTasks} max={total} color="#4BC0C0" />
        </div>
      </div>
      <div className="analytics-table-list">
        <div className="analytics-table-row" title="Low priority tasks.">
          <GoDotFill color='#4BC0C0' size={20} />
          <span>Low Priority</span>
          <span className="analytics-table-value">{analyticsData.lowPriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="Moderate priority tasks.">
          <GoDotFill color='#FFCE56' size={20} />
          <span>Moderate Priority</span>
          <span className="analytics-table-value">{analyticsData.moderatePriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="High priority tasks.">
          <GoDotFill color='#FF6384' size={20} />
          <span>High Priority</span>
          <span className="analytics-table-value">{analyticsData.highPriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="Tasks with a due date.">
          <GoDotFill color='#246bfd' size={20} />
          <span>Due Date Tasks</span>
          <span className="analytics-table-value">{analyticsData.dueDateTasks}</span>
        </div>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const userID = localStorage.getItem('userID');
      const response = await fetch(`https://pro-manage-one.vercel.app/api/card/analytics?userID=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '17px', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', margin: '5vh'}}>Analytics</p>
      {analyticsData && <>
        <SummaryCards analyticsData={analyticsData} />
        <AnalyticsTable analyticsData={analyticsData} />
      </>}
    </div>
  );
};

export default Analytics;
