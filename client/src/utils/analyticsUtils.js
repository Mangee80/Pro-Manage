const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_BOTTLENECK_DAYS = 7;

export const STATUS_COLORS = {
  Backlog: "#94A3B8",
  Todo: "#FFCE56",
  "In Progress": "#FF6384",
  Done: "#10B981",
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const toDate = (value, fallback = null) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date;
};

export const diffInDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const ms = endDate.getTime() - startDate.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / DAY_MS);
};

const normalizeHistory = (card, createdAt) => {
  const history = Array.isArray(card.statusHistory) ? [...card.statusHistory] : [];

  if (history.length === 0) {
    return [
      {
        status: card.tag || "Todo",
        date: createdAt,
      },
    ];
  }

  const normalized = history
    .map((item) => ({
      status: item.status || card.tag || "Todo",
      date: toDate(item.date, createdAt),
    }))
    .sort((a, b) => a.date - b.date);

  if (normalized[0].date > createdAt) {
    normalized.unshift({
      status: normalized[0].status || card.tag || "Todo",
      date: createdAt,
    });
  } else {
    normalized[0].date = createdAt;
  }

  return normalized;
};

export const createTaskTimelineItems = (
  cards,
  { now = new Date(), bottleneckDays = DEFAULT_BOTTLENECK_DAYS } = {}
) => {
  if (!Array.isArray(cards)) return [];

  return cards
    .map((card) => {
      const fallbackDate = now;
      const createdAt = toDate(card.createdAt, fallbackDate);
      const statusHistory = normalizeHistory(card, createdAt);
      const isDone = card.tag === "Done";
      const segments = [];

      for (let index = 0; index < statusHistory.length; index += 1) {
        const current = statusHistory[index];
        const next = statusHistory[index + 1];
        const startDate = toDate(current.date, createdAt);
        const endDate = next ? toDate(next.date, now) : isDone && current.status === "Done" ? startDate : now;

        const durationDays = diffInDays(startDate, endDate);
        const isLastSegment = index === statusHistory.length - 1;
        const isBottleneck =
          durationDays > bottleneckDays &&
          current.status !== "Done" &&
          !isDone &&
          (isLastSegment || endDate < now);

        segments.push({
          status: current.status,
          startDate,
          endDate,
          durationDays,
          isBottleneck,
          color: STATUS_COLORS[current.status] || STATUS_COLORS.Todo,
        });
      }

      const doneSegment = segments.find((segment) => segment.status === "Done");
      const currentSegment = segments[segments.length - 1];
      const currentStatusDuration = !isDone && currentSegment ? currentSegment.durationDays : 0;
      const backlogSegment = segments.find((segment) => segment.status === "Backlog");

      return {
        id: card._id,
        cardTitle: card.title || "Untitled Task",
        createdAt,
        segments,
        currentTag: card.tag || "Todo",
        priorityColor: card.priorityColor || "#64748B",
        priorityText: card.priorityText || "Unknown Priority",
        isDone,
        currentStatusDuration,
        isStuck: !isDone && currentSegment ? currentSegment.isBottleneck : false,
        cycleTimeDays: doneSegment ? diffInDays(createdAt, doneSegment.endDate) : null,
        leadTimeDays: doneSegment
          ? diffInDays(backlogSegment ? backlogSegment.startDate : createdAt, doneSegment.endDate)
          : null,
      };
    })
    .sort((a, b) => a.createdAt - b.createdAt);
};

export const buildFlowMetrics = (
  timelineItems,
  { now = new Date(), bottleneckDays = DEFAULT_BOTTLENECK_DAYS } = {}
) => {
  const items = Array.isArray(timelineItems) ? timelineItems : [];
  const activeItems = items.filter((item) => !item.isDone);
  const completedItems = items.filter((item) => item.isDone && typeof item.cycleTimeDays === "number");
  const doneInLast7Days = items.filter((item) => {
    const doneSegment = item.segments.find((segment) => segment.status === "Done");
    if (!doneSegment) return false;
    return diffInDays(doneSegment.endDate, now) <= 7;
  });

  const stuckByStatus = activeItems.reduce(
    (acc, item) => {
      if (item.isStuck) {
        acc[item.currentTag] = (acc[item.currentTag] || 0) + 1;
      }
      return acc;
    },
    { Backlog: 0, Todo: 0, "In Progress": 0 }
  );

  const avgAgingWipDays =
    activeItems.length > 0
      ? Math.round(activeItems.reduce((sum, item) => sum + item.currentStatusDuration, 0) / activeItems.length)
      : 0;
  const avgCycleTimeDays =
    completedItems.length > 0
      ? Math.round(completedItems.reduce((sum, item) => sum + item.cycleTimeDays, 0) / completedItems.length)
      : 0;

  return {
    bottleneckDays,
    stuckCount: activeItems.filter((item) => item.isStuck).length,
    avgAgingWipDays,
    avgCycleTimeDays,
    throughput7d: doneInLast7Days.length,
    stuckByStatus,
  };
};

