import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { GoArrowUp, GoGraph } from "react-icons/go";
import { buildFlowMetrics, clamp, createTaskTimelineItems } from "../../utils/analyticsUtils";

const BOTTLENECK_DAYS = 7;

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
const formatDateHeaderLabel = (date) => date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
const formatMonthLabel = (date) => date.toLocaleDateString("en-US", { month: "short" });

const LEGEND_INFO = {
  Backlog: "Backlog means planned work that is not started yet.",
  Todo: "Todo means ready tasks that should be picked up next.",
  "In Progress": "In Progress means tasks currently being worked on.",
  Done: "Done means tasks that are completed and closed.",
  Bottleneck: "Bottleneck highlights tasks stuck in active status for more than 7 days.",
};

const METRIC_INFO = {
  stuck: "Tasks currently active for more than the bottleneck threshold. These need first attention.",
  aging: "Average days active tasks have spent in their current status. Higher means flow is slowing.",
  cycle: "Average days from task creation to completion. Lower cycle time means faster delivery.",
  throughput: "Number of tasks completed in the last 7 days. Higher throughput means better execution pace.",
  threshold: "Current rule for flagging a bottleneck. Active tasks above this age are highlighted.",
};

const FlowMetricStrip = ({ metrics, bottleneckDays }) => {
  const [tooltip, setTooltip] = useState(null);

  const showTooltip = useCallback((e, text) => {
    if (!e?.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Placement choose: enough space ho to bottom, warna top.
    const placement = spaceBelow < 130 && spaceAbove > spaceBelow ? "top" : "bottom";
    const top = placement === "bottom" ? rect.bottom + 10 : rect.top - 10;

    // Clamp left so tooltip off-screen na jaye (rough half-width assumption).
    const half = 140; // tooltip width ~ 280px
    const clampedLeft = Math.max(half + 12, Math.min(left, window.innerWidth - (half + 12)));

    setTooltip({
      text,
      left: clampedLeft,
      top,
      placement,
    });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  if (!metrics) return null;

  return (
    <div className="gantt-metric-strip">
      <div
        className="gantt-metric-item"
        onMouseEnter={(e) => showTooltip(e, METRIC_INFO.stuck)}
        onMouseLeave={hideTooltip}
      >
        <span className="gantt-metric-label">Stuck Tasks</span>
        <span className="gantt-metric-value">{metrics.stuckCount}</span>
      </div>
      <div
        className="gantt-metric-item"
        onMouseEnter={(e) => showTooltip(e, METRIC_INFO.aging)}
        onMouseLeave={hideTooltip}
      >
        <span className="gantt-metric-label">Avg Aging WIP</span>
        <span className="gantt-metric-value">{metrics.avgAgingWipDays}d</span>
      </div>
      <div
        className="gantt-metric-item"
        onMouseEnter={(e) => showTooltip(e, METRIC_INFO.cycle)}
        onMouseLeave={hideTooltip}
      >
        <span className="gantt-metric-label">Avg Cycle Time</span>
        <span className="gantt-metric-value">{metrics.avgCycleTimeDays}d</span>
      </div>
      <div
        className="gantt-metric-item"
        onMouseEnter={(e) => showTooltip(e, METRIC_INFO.throughput)}
        onMouseLeave={hideTooltip}
      >
        <span className="gantt-metric-label">Throughput (7d)</span>
        <span className="gantt-metric-value">{metrics.throughput7d}</span>
      </div>
      <div
        className="gantt-metric-item"
        onMouseEnter={(e) => showTooltip(e, METRIC_INFO.threshold)}
        onMouseLeave={hideTooltip}
      >
        <span className="gantt-metric-label">Bottleneck Rule</span>
        <span className="gantt-metric-value">&gt; {bottleneckDays}d</span>
      </div>

      {tooltip &&
        createPortal(
          <div
            className={`metric-tooltip-portal ${tooltip.placement}`}
            style={{
              left: tooltip.left,
              top: tooltip.top,
            }}
            role="tooltip"
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </div>
  );
};

const GanttLegend = ({ bottleneckDays, zoomDays, onZoomChange }) => (
  <div className="gantt-legend-sticky">
    <div className="gantt-legend-left">
      <div className="gantt-legend-item">
        <span className="legend-color-dot backlog" />Backlog
        <div className="legend-hover-card">{LEGEND_INFO.Backlog}</div>
      </div>
      <div className="gantt-legend-item">
        <span className="legend-color-dot todo" />Todo
        <div className="legend-hover-card">{LEGEND_INFO.Todo}</div>
      </div>
      <div className="gantt-legend-item">
        <span className="legend-color-dot progress" />In Progress
        <div className="legend-hover-card">{LEGEND_INFO["In Progress"]}</div>
      </div>
      <div className="gantt-legend-item">
        <span className="legend-color-dot done" />Done
        <div className="legend-hover-card">{LEGEND_INFO.Done}</div>
      </div>
      <div className="gantt-legend-item">
        <span className="legend-color-dot bottleneck" />Bottleneck (&gt;{bottleneckDays}d)
        <div className="legend-hover-card">{LEGEND_INFO.Bottleneck}</div>
      </div>
    </div>
    <div className="gantt-range-switch">
      {[30, 60, 90].map((value) => (
        <button
          type="button"
          key={value}
          className={`gantt-range-btn ${zoomDays === value ? "active" : ""}`}
          onClick={() => onZoomChange(value)}
        >
          {value}d
        </button>
      ))}
    </div>
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
  const dayStep = zoomDays <= 30 ? 3 : zoomDays <= 60 ? 5 : 7;
  const dateTicks = Array.from({ length: Math.ceil(daysInView / dayStep) + 1 }).map((_, i) => {
    const date = new Date(startViewDate);
    date.setDate(date.getDate() + i * dayStep);
    return {
      key: `tick-${i}`,
      date,
      left: `${(i * dayStep * 100) / daysInView}%`,
      isMajor: date.getDate() <= dayStep || i === 0,
    };
  });

  return (
    <div className="gantt-container">
      <FlowMetricStrip metrics={flowMetrics} bottleneckDays={bottleneckDays} />
      <GanttLegend bottleneckDays={bottleneckDays} zoomDays={zoomDays} onZoomChange={onZoomChange} />
      <div className="gantt-header">
        <div className="gantt-task-column">
          <span>Task</span>
        </div>
        <div className="gantt-timeline-column">
          <div className="gantt-month-row">
            {dateTicks
              .filter((tick) => tick.isMajor)
              .map((tick) => (
                <div key={`month-${tick.key}`} className="gantt-month-label" style={{ left: tick.left }}>
                  {formatMonthLabel(tick.date)}
                </div>
              ))}
          </div>
          <div className="gantt-dates-row">
            {dateTicks.map((tick) => (
              <div
                key={tick.key}
                className={`gantt-date-label ${tick.isMajor ? "major" : "minor"}`}
                style={{ left: tick.left }}
              >
                {formatDateHeaderLabel(tick.date)}
              </div>
            ))}
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
                  const availableWidth = Math.max(0, 99.8 - leftPos);
                  if (availableWidth <= 0.1) return null;
                  const safeWidth = Math.min(Math.max(0.5, width), availableWidth);
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
                        width: `${safeWidth}%`,
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

  const taskStatusData = [
    { name: "Backlog", value: analyticsData?.backlogTasks || 0, color: "#36A2EB" },
    { name: "To-do", value: analyticsData?.todoTasks || 0, color: "#FFCE56" },
    { name: "In Progress", value: analyticsData?.inProgressTasks || 0, color: "#FF6384" },
    { name: "Completed", value: analyticsData?.completedTasks || 0, color: "#4BC0C0" },
  ];

  const priorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    cardsData.forEach((card) => {
      const text = (card.priorityText || "").toLowerCase();
      if (text.includes("high")) counts.high += 1;
      else if (text.includes("medium") || text.includes("moderate")) counts.medium += 1;
      else if (text.includes("low")) counts.low += 1;
    });

    const fallbackLow = analyticsData?.lowPriorityTasks || 0;
    const fallbackMedium = analyticsData?.moderatePriorityTasks || 0;
    const fallbackHigh = analyticsData?.highPriorityTasks || 0;

    return [
      { name: "Low", value: cardsData.length > 0 ? counts.low : fallbackLow, color: "#4BC0C0" },
      { name: "Medium", value: cardsData.length > 0 ? counts.medium : fallbackMedium, color: "#FFCE56" },
      { name: "High", value: cardsData.length > 0 ? counts.high : fallbackHigh, color: "#FF6384" },
    ];
  }, [cardsData, analyticsData]);

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
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={36} outerRadius={72} paddingAngle={3} dataKey="value">
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
              <ResponsiveContainer width="100%" height={160}>
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
        </div>
      </div>
    </div>
  );
};

export default Analytics;
