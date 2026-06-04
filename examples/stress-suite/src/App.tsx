import React, { useEffect, useMemo, useState } from 'react';
import { ScrewDevtools, useScrewBatch, useScrewMutation, useScrewQuery, useScrewToast, useScrewWorkflow } from 'reactscrew';
import type { AdminOrder, AdminOverview, KanbanBoard, OpsOverview, SuiteSummary, TaskStatus } from './suiteApi';
import { suiteOwners } from './suiteApi';

type ProjectId = 'kanban' | 'ops' | 'backoffice';

const navItems: { id: ProjectId; label: string }[] = [
  { id: 'kanban', label: 'Kanban Lab' },
  { id: 'ops', label: 'Ops Console' },
  { id: 'backoffice', label: 'Backoffice' },
];

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function App() {
  const [project, setProject] = useState<ProjectId>('kanban');
  const [ownerTarget, setOwnerTarget] = useState(suiteOwners[0]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDevtools, setShowDevtools] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  const { addToast } = useScrewToast();
  const summary = useScrewQuery<SuiteSummary>('projects', 'summary', { staleTime: 1_500 });
  const board = useScrewQuery<KanbanBoard>('kanban', 'board', { staleTime: 900 });
  const ops = useScrewQuery<OpsOverview>('ops', 'overview', { staleTime: 900 });
  const admin = useScrewQuery<AdminOverview>('admin', 'orders', { staleTime: 900 });

  const moveTask = useScrewMutation('kanban', 'moveTask');
  const assignOwner = useScrewMutation('kanban', 'assignOwner');
  const bulkReview = useScrewMutation('admin', 'bulkReview');

  const batch = useScrewBatch();

  const selectedIncident = useMemo(
    () => ops.data?.incidents.find((incident) => incident.id === selectedIncidentId) ?? ops.data?.incidents[0] ?? null,
    [ops.data, selectedIncidentId]
  );

  const remediation = useScrewWorkflow(
    selectedIncident
      ? {
          steps: [
            {
              id: 'ack',
              screwName: 'ops',
              methodName: 'acknowledgeIncident',
              label: 'Acknowledge incident',
              args: [selectedIncident.id],
            },
            {
              id: 'restart',
              screwName: 'ops',
              methodName: 'restartService',
              label: 'Restart degraded service',
              dependsOn: ['ack'],
              args: [selectedIncident.serviceId],
              retry: 1,
              retryDelay: 650,
            },
            {
              id: 'resolve',
              screwName: 'ops',
              methodName: 'resolveIncident',
              label: 'Resolve incident',
              dependsOn: ['restart'],
              args: [selectedIncident.id],
              retry: 1,
              retryDelay: 900,
            },
          ],
          onStepComplete: async (step) => {
            if (step.status === 'success') {
              addToast({ variant: 'info', message: `${step.label} succeeded.` });
            }
          },
          onStepError: async (error, step) => {
            addToast({ variant: 'error', message: `${step.label}: ${error.message}` });
            return false;
          },
        }
      : undefined
  );

  useEffect(() => {
    if (!selectedIncidentId && ops.data?.incidents[0]) {
      setSelectedIncidentId(ops.data.incidents[0].id);
    }
  }, [selectedIncidentId, ops.data]);

  useEffect(() => {
    if (project !== 'ops') {
      return;
    }
    const timer = window.setInterval(() => {
      void ops.refetch().catch(() => undefined);
    }, 8_000);
    return () => window.clearInterval(timer);
  }, [project, ops.refetch]);

  const tasksByColumn = useMemo(() => {
    const tasks = board.data?.tasks ?? [];
    return statusOrder.map((status) => ({
      status,
      items: tasks.filter((task) => task.status === status),
    }));
  }, [board.data]);

  const toggleTask = (id: string) => {
    setSelectedTasks((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleOrder = (id: string) => {
    setSelectedOrders((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleTaskAdvance = async (taskId: string, current: TaskStatus) => {
    const next = statusOrder[Math.min(statusOrder.indexOf(current) + 1, statusOrder.length - 1)];
    await moveTask.mutate({ status: next }, taskId);
  };

  const handleBatchAssign = async () => {
    await batch.execute(
      selectedTasks.map((taskId) => ({
        screwName: 'kanban',
        methodName: 'assignOwner',
        args: [taskId],
        variables: { owner: ownerTarget },
        label: `Assign ${taskId}`,
      }))
    );
    addToast({ variant: 'success', message: `${selectedTasks.length} tasks reassigned to ${ownerTarget}.` });
    setSelectedTasks([]);
  };

  const handleBulkReview = async (status: 'review' | 'approved' | 'flagged') => {
    await bulkReview.mutate({ orderIds: selectedOrders, status });
    addToast({ variant: 'success', message: `${selectedOrders.length} orders moved to ${status}.` });
    setSelectedOrders([]);
  };

  return (
    <div className="suite-shell">
      <header className="suite-header">
        <div>
          <p className="eyebrow">ReactScrew Stress Suite</p>
          <h1>Un seul projet, plusieurs terrains de stress.</h1>
        </div>
        <nav className="nav-tabs">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${project === item.id ? 'active' : ''}`}
              onClick={() => setProject(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button className="ghost-btn" onClick={() => setShowDevtools((value) => !value)}>
            {showDevtools ? 'Masquer devtools' : 'Voir devtools'}
          </button>
        </nav>
      </header>

      <section className="summary-grid">
        {(summary.data?.projects ?? []).map((item) => (
          <article key={item.id} className={`summary-card ${item.tone}`}>
            <strong>{item.label}</strong>
            <span>{item.metric}</span>
            <p>{item.headline}</p>
          </article>
        ))}
      </section>

      {project === 'kanban' && (
        <section className="project-grid">
          <div className="main-panel">
            <div className="panel-head">
              <h2>Kanban Lab</h2>
              <span>{board.data?.throughput ?? 0} pts shipped</span>
            </div>
            <div className="kanban-grid">
              {tasksByColumn.map((column) => (
                <div key={column.status} className="kanban-column">
                  <div className="column-head">
                    <strong>{column.status}</strong>
                    <span>{column.items.length}</span>
                  </div>
                  {column.items.map((task) => (
                    <article key={task.id} className="task-card">
                      <label className="task-select">
                        <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={() => toggleTask(task.id)} />
                        <span>{task.title}</span>
                      </label>
                      <p>{task.owner} · {task.priority} · {task.points} pts</p>
                      <button className="ghost-btn compact" onClick={() => void handleTaskAdvance(task.id, task.status)}>
                        Advance
                      </button>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <aside className="side-stack">
            <div className="panel">
              <div className="panel-head">
                <h2>Batch assign</h2>
                <span>{selectedTasks.length} selected</span>
              </div>
              <label className="field">
                <span>New owner</span>
                <select value={ownerTarget} onChange={(e) => setOwnerTarget(e.target.value)}>
                  {suiteOwners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </label>
              <button className="primary-btn" disabled={selectedTasks.length === 0 || batch.isExecuting} onClick={() => void handleBatchAssign()}>
                {batch.isExecuting ? 'Batch running...' : 'Run batch assign'}
              </button>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${batch.progress?.percentage ?? 0}%` }} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h2>Stress focus</h2>
              </div>
              <p className="muted">Concurrence de mutations, invalidation de board et actions batch homogènes sur plusieurs tasks.</p>
            </div>
          </aside>
        </section>
      )}

      {project === 'ops' && (
        <section className="project-grid">
          <div className="main-panel">
            <div className="panel-head">
              <h2>Ops Console</h2>
              <span>{ops.data?.openCritical ?? 0} critical open</span>
            </div>
            <div className="service-grid">
              {(ops.data?.services ?? []).map((service) => (
                <article key={service.id} className={`service-card ${service.health}`}>
                  <strong>{service.name}</strong>
                  <span>{service.health}</span>
                  <p>{service.latencyMs} ms · {service.errorRate}% error rate</p>
                </article>
              ))}
            </div>
            <div className="incident-list">
              {(ops.data?.incidents ?? []).map((incident) => (
                <article
                  key={incident.id}
                  className={`incident-card ${selectedIncident?.id === incident.id ? 'active' : ''}`}
                  onClick={() => setSelectedIncidentId(incident.id)}
                >
                  <strong>{incident.title}</strong>
                  <span>{incident.severity} · {incident.status}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="side-stack">
            <div className="panel">
              <div className="panel-head">
                <h2>Remediation workflow</h2>
                <span>{remediation.result?.status ?? 'idle'}</span>
              </div>
              <button
                className="primary-btn"
                disabled={!selectedIncident || remediation.isExecuting}
                onClick={() => void remediation.execute()}
              >
                {remediation.isExecuting ? 'Workflow running...' : 'Run remediation'}
              </button>
              <div className="step-list">
                {(remediation.result?.steps ?? []).map((step) => (
                  <div key={step.id} className={`step-row ${step.status}`}>
                    <span>{step.label}</span>
                    <strong>{step.status}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h2>Stress focus</h2>
              </div>
              <p className="muted">Workflow séquentiel avec retry, erreurs de recovery possibles et refetch périodique de la vue ops.</p>
            </div>
          </aside>
        </section>
      )}

      {project === 'backoffice' && (
        <section className="project-grid">
          <div className="main-panel">
            <div className="panel-head">
              <h2>Backoffice Review</h2>
              <span>{admin.data?.pendingReview ?? 0} pending review</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {(admin.data?.orders ?? []).map((order) => (
                    <tr key={order.id}>
                      <td>
                        <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrder(order.id)} />
                      </td>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{currency(order.total)}</td>
                      <td><span className={`pill ${order.status}`}>{order.status}</span></td>
                      <td>{order.riskScore}</td>
                      <td>{order.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="side-stack">
            <div className="panel">
              <div className="panel-head">
                <h2>Bulk actions</h2>
                <span>{selectedOrders.length} selected</span>
              </div>
              <div className="button-stack">
                <button className="primary-btn" disabled={selectedOrders.length === 0} onClick={() => void handleBulkReview('review')}>
                  Move to review
                </button>
                <button className="ghost-btn" disabled={selectedOrders.length === 0} onClick={() => void handleBulkReview('approved')}>
                  Approve
                </button>
                <button className="ghost-btn" disabled={selectedOrders.length === 0} onClick={() => void handleBulkReview('flagged')}>
                  Flag
                </button>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h2>Stress focus</h2>
              </div>
              <p className="muted">Table dense, sélection multiple et invalidation d’un dataset plus volumineux après bulk review.</p>
              <p className="muted">Flagged: {admin.data?.flagged ?? 0}</p>
            </div>
          </aside>
        </section>
      )}

      {showDevtools && (
        <section className="devtools-wrap">
          <ScrewDevtools />
        </section>
      )}
    </div>
  );
}
