import React, { useMemo, useState, useEffect, useCallback } from "react";
import "./Analytics.css";
import { apiRequest } from "../../utils/authUtils";
import { getApiUrl } from "../../config/apiConfig";
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
} from "recharts";
import { GoArrowUp, GoClock, GoCheckCircle, GoAlert, GoProject, GoGraph } from "react-icons/go";
import { buildFlowMetrics, clamp, createTaskTimelineItems } from "../../utils/analyticsUtils";

const BOTTLENECK_DAYS = 7;

const SummaryCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="summary-card-compact" style={{ borderLeft: `3px solid ${color}` }}>
    <div className="summary-card-icon-compact" style={{ backgroundColor: `${color}20` }}>
      <Icon size={18} color={color} />
    </div>
    <div className="summary-card-content-compact">
      <div className="summary-card-value-compact">{value}</div>
      <div className="summary-card-title-compact">{title}</div>
      {subtitle && <div className="summary-card-subtitle-compact">{subtitle}</div>}
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`chart-card-compact ${className}`}>
    <div className="chart-card-header-compact">
      <h3 className="chart-card-title-compact">{title}</h3>
    </div>
    <div className="chart-card-content-compact">{children}</div>
  </div>
);

const getDatePosition = (date, startViewDate, daysInView) => {
  const diffMs = date - startViewDate;
  const diffDays = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const percentage = (diffDays / daysInView) * 100;
  return clamp(percentage, 0, 100);
};

const getBarWidth = (startDate, endDate, daysInView) => {
  const diffMs = endDate - startDate;
  const days = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const percentage = (days / daysInView) * 100;
  return clamp(percentage, 0, 100);
};

const formatDateLabel = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const ZoomControls = ({ zoomDays, onChange }) => (
  <div className="gantt-zoom-controls">
    {[30, 60, 90].map((value) => (
      <button
        type="button"
        key={value}
        className={`gantt-zoom-btn ${zoomDays === value ? "active" : ""}`}
        onClick={() => onChange(value)}
      >
        {value}d
      </button>
    ))}
  </div>
);

const FlowMetricStrip = ({ metrics, bottleneckDays }) => {
  if (!metrics) return null;
  return (
    <div className="gantt-metric-strip">
      <div className="gantt-metric-item">
        <span className="gantt-metric-label">Stuck Tasks</span>
        <span className="gantt-metric-value">{metrics.stuckCount}</span>
      </div>
      <div className="gantt-metric-item">
        <span className="gantt-metric-label">Avg Aging WIP</span>
        <span className="gantt-metric-value">{metrics.avgAgingWipDays}d</span>
      </div>
      <div className="gantt-metric-item">
        <span className="gantt-metric-label">Avg Cycle Time</span>
        <span className="gantt-metric-value">{metrics.avgCycleTimeDays}d</span>
      </div>
      <div className="gantt-metric-item">
        <span className="gantt-metric-label">Throughput (7d)</span>
        <span className="gantt-metric-value">{metrics.throughput7d}</span>
      </div>
      <div className="gantt-metric-item">
        <span className="gantt-metric-label">Bottleneck Rule</span>
        <span className="gantt-metric-value">&gt; {bottleneckDays}d</span>
      </div>
    </div>
  );
};

const GanttDefinitions = ({ bottleneckDays }) => (
  <div className="gantt-definitions">
    <div className="gantt-definition"><strong>Cycle Time:</strong> Created to Done.</div>
    <div className="gantt-definition"><strong>Lead Time:</strong> Backlog to Done (or Created to Done).</div>
    <div className="gantt-definition"><strong>Aging WIP:</strong> Days in current active status.</div>
    <div className="gantt-definition"><strong>Bottleneck:</strong> Active status older than {bottleneckDays} days.</div>
  </div>
);

const GanttLegend = ({ bottleneckDays }) => (
  <div className="gantt-legend-sticky">
    <div className="gantt-legend-item"><span className="legend-color-dot backlog" />Backlog</div>
    <div className="gantt-legend-item"><span className="legend-color-dot todo" />Todo</div>
    <div className="gantt-legend-item"><span className="legend-color-dot progress" />In Progress</div>
    <div className="gantt-legend-item"><span className="legend-color-dot done" />Done</div>
    <div className="gantt-legend-item"><span className="legend-color-dot bottleneck" />Bottleneck (&gt;{bottleneckDays}d)</div>
  </div>
);

const GanttChartView = ({ timelineItems, flowMetrics, zoomDays, onZoomChange, bottleneckDays }) => {
  if (!timelineItems || timelineItems.length === 0) {
    return (
      <div className="gantt-empty-state">
        <p>No timeline data available yet.</p>
        <p className="gantt-empty-subtitle">
          Create tasks and move them across board columns to visualize flow and bottlenecks.
        </p>
      </div>
    );
  }

  const today = new Date();
  const pastDays = Math.round(zoomDays / 3);
  const futureDays = zoomDays - pastDays;
  const startViewDate = new Date(today);
  startViewDate.setDate(startViewDate.getDate() - pastDays);
  const endViewDate = new Date(today);
  endViewDate.setDate(endViewDate.getDate() + futureDays);
  const daysInView = zoomDays;

  return (
    <div className="gantt-container">
      <FlowMetricStrip metrics={flowMetrics} bottleneckDays={bottleneckDays} />
      <div className="gantt-toolbar">
        <GanttDefinitions bottleneckDays={bottleneckDays} />
        <ZoomControls zoomDays={zoomDays} onChange={onZoomChange} />
      </div>
      <GanttLegend bottleneckDays={bottleneckDays} />
      <div className="gantt-header">
        <div className="gantt-task-column">
          <span>Task</span>
        </div>
        <div className="gantt-timeline-column">
          <div className="gantt-dates-row">
            {Array.from({ length: Math.ceil(daysInView / 5) + 1 }).map((_, i) => {
              const date = new Date(startViewDate);
              date.setDate(date.getDate() + i * 5);
              return (
                <div key={i} className="gantt-date-label" style={{ left: `${(i * 5 * 100) / daysInView}%` }}>
                  {formatDateLabel(date)}
                </div>
              );
            })}
          </div>
          <div className="gantt-week-markers">
            {Array.from({ length: Math.ceil(daysInView / 7) }).map((_, i) => (
              <div
                key={i}
                className="gantt-week-marker"
                style={{ left: `${((i * 7) / daysInView) * 100}%` }}
              />
            ))}
          </div>
          <div className="gantt-today-line" style={{ left: `${getDatePosition(today, startViewDate, daysInView)}%` }} />
        </div>
      </div>
      <div className="gantt-body">
        {timelineItems.map((item, index) => (
          <div key={item.id || index} className="gantt-row">
            <div className="gantt-task-name">
              <div className="gantt-task-priority" style={{ backgroundColor: item.priorityColor }} />
              <span className="gantt-task-title" title={item.cardTitle}>
                {item.cardTitle.length > 30 ? `${item.cardTitle.slice(0, 30)}...` : item.cardTitle}
              </span>
              {!item.isDone && item.currentStatusDuration > 0 && (
                <span className={`gantt-duration-badge ${item.isStuck ? "stuck" : ""}`}>
                  {item.currentStatusDuration}d
                  {item.isStuck && <span className="stuck-indicator">!</span>}
                </span>
              )}
            </div>
            <div className="gantt-bar-container">
              {item.segments
                .filter((segment) => getBarWidth(segment.startDate, segment.endDate, daysInView) > 0.1)
                .map((segment, segIndex) => {
                  const leftPos = getDatePosition(segment.startDate, startViewDate, daysInView);
                  const width = getBarWidth(segment.startDate, segment.endDate, daysInView);
                  const tooltip = [
                    `Task: ${item.cardTitle}`,
                    `Status: ${segment.status}`,
                    `Duration: ${segment.durationDays} day${segment.durationDays === 1 ? "" : "s"}`,
                    `From: ${formatDateLabel(segment.startDate)}`,
                    `To: ${formatDateLabel(segment.endDate)}`,
                    segment.isBottleneck
                      ? `Why flagged? This status has remained active for ${segment.durationDays} days (>${bottleneckDays} day threshold).`
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n");

                  return (
                    <div
                      key={segIndex}
                      className={`gantt-bar-segment ${segment.status === "Done" ? "completed" : "active"} ${
                        segment.isBottleneck ? "bottleneck" : ""
                      }`}
                      style={{
                        left: `${leftPos}%`,
                        width: `${Math.max(0.5, width)}%`,
                        backgroundColor: segment.color,
                      }}
                      title={tooltip}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <div className="gantt-view-window">
        View Window: {formatDateLabel(startViewDate)} - {formatDateLabel(endViewDate)}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [flowMetrics, setFlowMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoomDays, setZoomDays] = useState(90);

  const fetchAnalyticsData = async () => {
    const response = await apiRequest(getApiUrl("api/card/analytics"));
    if (!response.ok) {
      throw new Error("Failed to fetch analytics data");
    }
    return response.json();
  };

  const fetchCards = async () => {
    const response = await apiRequest(getApiUrl("api/card/getcards"), { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }
    const { boards } = await response.json();
    return (boards || []).flatMap((board) => board.cards || []);
  };

  const fetchServerFlowMetrics = async () => {
    const response = await apiRequest(getApiUrl("api/card/flow-metrics"), { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch flow metrics");
    }
    return response.json();
  };

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsResponse, cards] = await Promise.all([fetchAnalyticsData(), fetchCards()]);
      setAnalyticsData(analyticsResponse);
      setCardsData(cards);

      const timeline = createTaskTimelineItems(cards, { bottleneckDays: BOTTLENECK_DAYS });
      setTimelineItems(timeline);
      const localFlowMetrics = buildFlowMetrics(timeline, { bottleneckDays: BOTTLENECK_DAYS });
      setFlowMetrics(localFlowMetrics);

      try {
        const serverMetrics = await fetchServerFlowMetrics();
        setFlowMetrics({
          ...localFlowMetrics,
          ...serverMetrics,
          bottleneckDays: serverMetrics.bottleneckDays || BOTTLENECK_DAYS,
        });
      } catch (serverMetricError) {
        console.warn("Using client-side flow metrics fallback:", serverMetricError);
      }
    } catch (loadError) {
      console.error("Error loading analytics:", loadError);
      setError(loadError.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const totalTasks = useMemo(() => {
    if (!analyticsData) return 0;
    return (
      (analyticsData.backlogTasks || 0) +
      (analyticsData.todoTasks || 0) +
      (analyticsData.inProgressTasks || 0) +
      (analyticsData.completedTasks || 0)
    );
  }, [analyticsData]);

  const completedPercentage = totalTasks > 0 ? Math.round(((analyticsData?.completedTasks || 0) / totalTasks) * 100) : 0;
  const pendingCount =
    (analyticsData?.backlogTasks || 0) +
    (analyticsData?.todoTasks || 0) +
    (analyticsData?.inProgressTasks || 0);
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingCount / totalTasks) * 100) : 0;

  const dueSoonCount = useMemo(() => {
    if (!cardsData || cardsData.length === 0) return analyticsData?.dueDateTasks || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    return cardsData.filter((card) => {
      if (!card.dueDate || card.tag === "Done") return false;
      const parts = card.dueDate.trim().split(" ");
      if (parts.length < 2) return false;
      const day = parseInt(parts[0], 10);
      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const month = monthMap[parts[1]];
      const year = parts[2] ? parseInt(parts[2], 10) : today.getFullYear();
      if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return false;
      const dueDate = new Date(year, month, day);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= sevenDaysLater;
    }).length;
  }, [cardsData, analyticsData]);

  const taskStatusData = [
    { name: "Backlog", value: analyticsData?.backlogTasks || 0, color: "#36A2EB" },
    { name: "To-do", value: analyticsData?.todoTasks || 0, color: "#FFCE56" },
    { name: "In Progress", value: analyticsData?.inProgressTasks || 0, color: "#FF6384" },
    { name: "Completed", value: analyticsData?.completedTasks || 0, color: "#4BC0C0" },
  ];

  const priorityData = [
    { name: "Low", value: analyticsData?.lowPriorityTasks || 0, color: "#4BC0C0" },
    { name: "Moderate", value: analyticsData?.moderatePriorityTasks || 0, color: "#FFCE56" },
    { name: "High", value: analyticsData?.highPriorityTasks || 0, color: "#FF6384" },
  ];

  const rootCauseHint = useMemo(() => {
    if (!flowMetrics) return "No flow signals yet.";
    const entries = Object.entries(flowMetrics.stuckByStatus || {}).sort((a, b) => b[1] - a[1]);
    const [topStatus, count] = entries[0] || [];
    if (!topStatus || count === 0) {
      return "No active bottlenecks right now. Keep monitoring weekly throughput.";
    }
    return `${topStatus} is the biggest blocker with ${count} stuck task${count > 1 ? "s" : ""}. Focus WIP cleanup there first.`;
  }, [flowMetrics]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading analytics and flow timeline...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="analytics-error">
        <p>{error || "Failed to load analytics data."}</p>
        <button className="refresh-btn-compact" onClick={loadAllData} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-page-compact">
      <div className="analytics-header-compact">
        <div className="analytics-header-content-compact">
          <h1 className="analytics-title-compact">
            <GoGraph size={24} />
            Analytics Dashboard
          </h1>
          <p className="analytics-subtitle-compact">Track project flow, detect delays early, and improve delivery predictability.</p>
        </div>
        <div className="analytics-actions-compact">
          <button className="refresh-btn-compact" onClick={loadAllData} type="button">
            <GoArrowUp size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-content-wrapper">
        <div className="analytics-main-content">
          <ChartCard title="Flow Health Summary" className="flow-health-card">
            <div className="flow-health-hint">{rootCauseHint}</div>
          </ChartCard>
          <div className="gantt-section">
            <ChartCard title="Task Flow Timeline (Gantt)" className="gantt-chart-card-compact">
              <GanttChartView
                timelineItems={timelineItems}
                flowMetrics={flowMetrics}
                zoomDays={zoomDays}
                onZoomChange={setZoomDays}
                bottleneckDays={flowMetrics?.bottleneckDays || BOTTLENECK_DAYS}
              />
            </ChartCard>
          </div>
        </div>

        <div className="summary-cards-sidebar">
          <ChartCard title="Task Status Distribution" className="pie-chart-card-compact">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="value">
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend-compact">
              {taskStatusData.map((item, index) => (
                <div key={index} className="legend-item-compact">
                  <div className="legend-color-compact" style={{ backgroundColor: item.color }} />
                  <span className="legend-label-compact">{item.name}</span>
                  <span className="legend-value-compact">{item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Priority Distribution" className="bar-chart-card-compact">
            {priorityData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
                <p>No priority data available</p>
              </div>
            )}
          </ChartCard>

          <div className="summary-cards-grid">
            <SummaryCard title="Total Tasks" value={totalTasks} icon={GoProject} color="#246BFD" subtitle="All created tasks" />
            <SummaryCard
              title="Completed"
              value={analyticsData.completedTasks || 0}
              icon={GoCheckCircle}
              color="#10B981"
              subtitle={`${completedPercentage}% of total`}
            />
            <SummaryCard title="Pending" value={pendingCount} icon={GoClock} color="#F59E0B" subtitle={`${pendingPercentage}% of total`} />
            <SummaryCard title="Due Soon" value={dueSoonCount} icon={GoAlert} color="#EF4444" subtitle="Next 7 days" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
