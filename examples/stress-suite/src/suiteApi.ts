import type { ApiInstance, ScrewsMap } from 'reactscrew';

type ProjectId = 'kanban' | 'ops' | 'backoffice';
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
type Severity = 'low' | 'medium' | 'high' | 'critical';
type ServiceHealth = 'healthy' | 'degraded' | 'down';
type OrderStatus = 'pending' | 'review' | 'approved' | 'flagged';

export interface SuiteSummary {
  projects: {
    id: ProjectId;
    label: string;
    headline: string;
    metric: string;
    tone: 'neutral' | 'positive' | 'warning' | 'danger';
  }[];
}

export interface KanbanTask {
  id: string;
  title: string;
  status: TaskStatus;
  owner: string;
  priority: 'P1' | 'P2' | 'P3';
  points: number;
}

export interface KanbanBoard {
  tasks: KanbanTask[];
  throughput: number;
  blocked: number;
}

export interface OpsIncident {
  id: string;
  title: string;
  serviceId: string;
  severity: Severity;
  status: 'open' | 'acknowledged' | 'resolved';
  startedAt: string;
}

export interface OpsService {
  id: string;
  name: string;
  health: ServiceHealth;
  latencyMs: number;
  errorRate: number;
}

export interface OpsOverview {
  services: OpsService[];
  incidents: OpsIncident[];
  openCritical: number;
}

export interface AdminOrder {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  riskScore: number;
  country: string;
}

export interface AdminOverview {
  orders: AdminOrder[];
  pendingReview: number;
  flagged: number;
}

const owners = ['Lina', 'Noah', 'Mina', 'Sven', 'Yara'];
const countries = ['FR', 'US', 'DE', 'ES', 'GB', 'NL'];

const state: {
  tasks: KanbanTask[];
  services: OpsService[];
  incidents: OpsIncident[];
  orders: AdminOrder[];
} = {
  tasks: [
    { id: 't1', title: 'Realtime permissions audit', status: 'todo', owner: 'Lina', priority: 'P1', points: 8 },
    { id: 't2', title: 'Workflow retry matrix', status: 'in-progress', owner: 'Noah', priority: 'P1', points: 5 },
    { id: 't3', title: 'Batch rollback story', status: 'review', owner: 'Mina', priority: 'P2', points: 3 },
    { id: 't4', title: 'Cache key collision tests', status: 'done', owner: 'Sven', priority: 'P1', points: 5 },
    { id: 't5', title: 'OpenAPI tenant fixtures', status: 'todo', owner: 'Yara', priority: 'P2', points: 2 },
    { id: 't6', title: 'Offline queue replay', status: 'in-progress', owner: 'Lina', priority: 'P1', points: 13 },
  ],
  services: [
    { id: 'svc-auth', name: 'Auth Gateway', health: 'healthy', latencyMs: 88, errorRate: 0.3 },
    { id: 'svc-orders', name: 'Order Engine', health: 'degraded', latencyMs: 420, errorRate: 3.9 },
    { id: 'svc-sync', name: 'Sync Worker', health: 'down', latencyMs: 1220, errorRate: 8.7 },
  ],
  incidents: [
    { id: 'inc-1', title: 'Queue lag on sync worker', serviceId: 'svc-sync', severity: 'critical', status: 'open', startedAt: new Date(Date.now() - 35 * 60_000).toISOString() },
    { id: 'inc-2', title: 'Slow order commits', serviceId: 'svc-orders', severity: 'high', status: 'acknowledged', startedAt: new Date(Date.now() - 58 * 60_000).toISOString() },
  ],
  orders: Array.from({ length: 18 }, (_, index) => ({
    id: `ord-${index + 1}`,
    customer: `Customer ${index + 1}`,
    total: 120 + index * 37,
    status: index % 7 === 0 ? 'flagged' : index % 3 === 0 ? 'review' : 'pending',
    riskScore: 12 + ((index * 11) % 93),
    country: countries[index % countries.length],
  })),
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildSummary = (): SuiteSummary => {
  const doneTasks = state.tasks.filter((task) => task.status === 'done').length;
  const openIncidents = state.incidents.filter((incident) => incident.status !== 'resolved');
  const reviewOrders = state.orders.filter((order) => order.status === 'review' || order.status === 'flagged').length;

  return {
    projects: [
      {
        id: 'kanban',
        label: 'Kanban Lab',
        headline: 'Optimistic moves, contention, batch owner changes',
        metric: `${doneTasks}/${state.tasks.length} shipped`,
        tone: doneTasks >= 2 ? 'positive' : 'warning',
      },
      {
        id: 'ops',
        label: 'Ops Console',
        headline: 'Workflow remediation across incidents and services',
        metric: `${openIncidents.length} incidents`,
        tone: openIncidents.some((incident) => incident.severity === 'critical') ? 'danger' : 'warning',
      },
      {
        id: 'backoffice',
        label: 'Backoffice',
        headline: 'Dense tables, filters and bulk review actions',
        metric: `${reviewOrders} to inspect`,
        tone: reviewOrders > 4 ? 'warning' : 'neutral',
      },
    ],
  };
};

const buildBoard = (): KanbanBoard => ({
  tasks: clone(state.tasks),
  throughput: state.tasks.filter((task) => task.status === 'done').reduce((sum, task) => sum + task.points, 0),
  blocked: state.tasks.filter((task) => task.status === 'review').length,
});

const buildOps = (): OpsOverview => ({
  services: clone(state.services),
  incidents: clone(state.incidents),
  openCritical: state.incidents.filter((incident) => incident.status !== 'resolved' && incident.severity === 'critical').length,
});

const buildAdmin = (): AdminOverview => ({
  orders: clone(state.orders),
  pendingReview: state.orders.filter((order) => order.status === 'review').length,
  flagged: state.orders.filter((order) => order.status === 'flagged').length,
});

const updateTaskStatus = (taskId: string, status: TaskStatus): KanbanBoard => {
  state.tasks = state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
  return buildBoard();
};

const assignTaskOwner = (taskId: string, owner: string): KanbanBoard => {
  state.tasks = state.tasks.map((task) => (task.id === taskId ? { ...task, owner } : task));
  return buildBoard();
};

const acknowledgeIncident = (incidentId: string): OpsOverview => {
  state.incidents = state.incidents.map((incident) =>
    incident.id === incidentId && incident.status === 'open'
      ? { ...incident, status: 'acknowledged' }
      : incident
  );
  return buildOps();
};

const restartService = (serviceId: string): OpsOverview => {
  state.services = state.services.map((service) =>
    service.id === serviceId
      ? {
          ...service,
          health: 'healthy',
          latencyMs: Math.max(72, Math.round(service.latencyMs * 0.35)),
          errorRate: Number(Math.max(0.1, service.errorRate * 0.25).toFixed(1)),
        }
      : service
  );
  return buildOps();
};

const resolveIncident = (incidentId: string): OpsOverview => {
  const incident = state.incidents.find((entry) => entry.id === incidentId);
  if (incident?.severity === 'critical' && Math.random() < 0.15) {
    throw new Error('Recovery check failed. Incident still critical.');
  }

  state.incidents = state.incidents.map((entry) =>
    entry.id === incidentId ? { ...entry, status: 'resolved' } : entry
  );
  return buildOps();
};

const bulkReviewOrders = (orderIds: string[], status: Exclude<OrderStatus, 'pending'>): AdminOverview => {
  state.orders = state.orders.map((order) =>
    orderIds.includes(order.id) ? { ...order, status } : order
  );
  return buildAdmin();
};

const routeMatch = (url: string, pattern: RegExp): RegExpExecArray | null => pattern.exec(url);

export const stressSuiteApi: ApiInstance = async ({ method, url, data }) => {
  await wait(110 + Math.random() * 180);

  if (method === 'GET' && url === '/projects/summary') {
    return { data: buildSummary(), status: 200, headers: {} };
  }
  if (method === 'GET' && url === '/kanban/board') {
    return { data: buildBoard(), status: 200, headers: {} };
  }
  if (method === 'GET' && url === '/ops/overview') {
    return { data: buildOps(), status: 200, headers: {} };
  }
  if (method === 'GET' && url === '/admin/orders') {
    return { data: buildAdmin(), status: 200, headers: {} };
  }

  const taskMove = routeMatch(url, /^\/kanban\/tasks\/([^/]+)\/move$/);
  if (method === 'POST' && taskMove) {
    return { data: updateTaskStatus(taskMove[1], (data as { status: TaskStatus }).status), status: 200, headers: {} };
  }

  const taskAssign = routeMatch(url, /^\/kanban\/tasks\/([^/]+)\/assign$/);
  if (method === 'POST' && taskAssign) {
    return { data: assignTaskOwner(taskAssign[1], (data as { owner: string }).owner), status: 200, headers: {} };
  }

  const incidentAck = routeMatch(url, /^\/ops\/incidents\/([^/]+)\/ack$/);
  if (method === 'POST' && incidentAck) {
    return { data: acknowledgeIncident(incidentAck[1]), status: 200, headers: {} };
  }

  const serviceRestart = routeMatch(url, /^\/ops\/services\/([^/]+)\/restart$/);
  if (method === 'POST' && serviceRestart) {
    return { data: restartService(serviceRestart[1]), status: 200, headers: {} };
  }

  const incidentResolve = routeMatch(url, /^\/ops\/incidents\/([^/]+)\/resolve$/);
  if (method === 'POST' && incidentResolve) {
    return { data: resolveIncident(incidentResolve[1]), status: 200, headers: {} };
  }

  if (method === 'POST' && url === '/admin/orders/bulk-review') {
    const payload = data as { orderIds: string[]; status: Exclude<OrderStatus, 'pending'> };
    return { data: bulkReviewOrders(payload.orderIds, payload.status), status: 200, headers: {} };
  }

  return { data: null, status: 404, headers: {} };
};

export const stressSuiteScrews: ScrewsMap = {
  projects: {
    name: 'projects',
    methods: {
      summary: { type: 'query', route: '/projects/summary', httpMethod: 'GET', staleTime: 1_500 },
    },
  },
  kanban: {
    name: 'kanban',
    methods: {
      board: { type: 'query', route: '/kanban/board', httpMethod: 'GET', staleTime: 900 },
      moveTask: {
        type: 'mutation',
        route: (taskId: string) => `/kanban/tasks/${taskId}/move`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'kanban', methodName: 'board' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
      assignOwner: {
        type: 'mutation',
        route: (taskId: string) => `/kanban/tasks/${taskId}/assign`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'kanban', methodName: 'board' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
    },
  },
  ops: {
    name: 'ops',
    methods: {
      overview: { type: 'query', route: '/ops/overview', httpMethod: 'GET', staleTime: 900 },
      acknowledgeIncident: {
        type: 'mutation',
        route: (incidentId: string) => `/ops/incidents/${incidentId}/ack`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'ops', methodName: 'overview' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
      restartService: {
        type: 'mutation',
        route: (serviceId: string) => `/ops/services/${serviceId}/restart`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'ops', methodName: 'overview' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
      resolveIncident: {
        type: 'mutation',
        route: (incidentId: string) => `/ops/incidents/${incidentId}/resolve`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'ops', methodName: 'overview' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
    },
  },
  admin: {
    name: 'admin',
    methods: {
      orders: { type: 'query', route: '/admin/orders', httpMethod: 'GET', staleTime: 900 },
      bulkReview: {
        type: 'mutation',
        route: '/admin/orders/bulk-review',
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'admin', methodName: 'orders' },
          { screwName: 'projects', methodName: 'summary' },
        ],
      },
    },
  },
};

export const suiteOwners = owners;
