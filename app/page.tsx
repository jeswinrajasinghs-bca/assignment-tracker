"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────
type Status = "Submitted" | "Pending" | "Late";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: Status;
  createdAt: number;
}

// ─── Subjects ─────────────────────────────────────────
const SUBJECTS = [
  "Data Structures",
  "Operating Systems",
  "Database Systems",
  "Computer Networks",
  "Software Engineering",
  "Machine Learning",
  "Web Development",
  "Discrete Mathematics",
] as const;

// ─── Sample Data ──────────────────────────────────────
const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Binary Search Tree Implementation",
    subject: "Data Structures",
    dueDate: "2026-06-25",
    status: "Submitted",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "2",
    title: "Process Scheduling Simulation",
    subject: "Operating Systems",
    dueDate: "2026-06-28",
    status: "Pending",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "3",
    title: "ER Diagram for Library System",
    subject: "Database Systems",
    dueDate: "2026-06-20",
    status: "Late",
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "4",
    title: "TCP/IP Socket Programming",
    subject: "Computer Networks",
    dueDate: "2026-06-30",
    status: "Pending",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "5",
    title: "UML Use Case Diagrams",
    subject: "Software Engineering",
    dueDate: "2026-06-22",
    status: "Submitted",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: "6",
    title: "Linear Regression Model",
    subject: "Machine Learning",
    dueDate: "2026-07-02",
    status: "Pending",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "7",
    title: "Responsive Portfolio Website",
    subject: "Web Development",
    dueDate: "2026-06-18",
    status: "Late",
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: "8",
    title: "Graph Theory Problem Set",
    subject: "Discrete Mathematics",
    dueDate: "2026-06-27",
    status: "Submitted",
    createdAt: Date.now() - 86400000 * 4,
  },
];

// ─── Helpers ──────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return due < today;
}

// ─── Icon Components ──────────────────────────────────
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,4 13,4" />
      <path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
      <path d="M4 4l0.7 9a1 1 0 0 0 1 0.9h4.6a1 1 0 0 0 1-0.9L12 4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2.5,7 5.5,10 11.5,4" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: number;
  icon: string;
  variant: "total" | "submitted" | "pending" | "late";
}) {
  return (
    <div className={`stat-card stat-card--${variant}`} id={`stat-${variant}`}>
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────
function StatusBadge({
  status,
  onChangeStatus,
}: {
  status: Status;
  onChangeStatus: (newStatus: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const statuses: Status[] = ["Submitted", "Pending", "Late"];

  return (
    <div className="status-dropdown-wrapper" ref={wrapperRef}>
      <button
        className={`status-badge status-badge--${status.toLowerCase()}`}
        onClick={() => setOpen(!open)}
        aria-label={`Status: ${status}. Click to change.`}
        type="button"
      >
        <span className="status-badge__dot" />
        {status}
      </button>
      {open && (
        <div className="status-dropdown" role="listbox" aria-label="Change status">
          {statuses.map((s) => (
            <button
              key={s}
              className={`status-dropdown__item ${s === status ? "status-dropdown__item--active" : ""}`}
              onClick={() => {
                onChangeStatus(s);
                setOpen(false);
              }}
              role="option"
              aria-selected={s === status}
              type="button"
            >
              <span
                className="status-badge__dot"
                style={{
                  background:
                    s === "Submitted"
                      ? "var(--status-submitted)"
                      : s === "Pending"
                        ? "var(--status-pending)"
                        : "var(--status-late)",
                }}
              />
              {s}
              {s === status && <IconCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toast Notification ───────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`} role="alert">
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

// ─── Add Assignment Modal ─────────────────────────────
function AddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (assignment: Assignment) => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Status>("Pending");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAdd({
      id: generateId(),
      title: title.trim(),
      subject,
      dueDate,
      status,
      createdAt: Date.now(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Add new assignment">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">New Assignment</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close" type="button">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-group__label" htmlFor="assignment-title">
                Title
              </label>
              <input
                id="assignment-title"
                ref={titleRef}
                className="form-group__input"
                type="text"
                placeholder="e.g. Binary Tree Traversal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="assignment-subject">
                Subject
              </label>
              <select
                id="assignment-subject"
                className="form-group__select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="assignment-due-date">
                Due Date
              </label>
              <input
                id="assignment-due-date"
                className="form-group__input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="assignment-status">
                Initial Status
              </label>
              <select
                id="assignment-status"
                className="form-group__select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
          <div className="modal__actions">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" type="submit" id="btn-submit-assignment">
              <IconPlus />
              Add Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────
export default function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("assigntrack-data");
      if (stored) {
        setAssignments(JSON.parse(stored));
      } else {
        setAssignments(SAMPLE_ASSIGNMENTS);
        localStorage.setItem("assigntrack-data", JSON.stringify(SAMPLE_ASSIGNMENTS));
      }
    } catch {
      setAssignments(SAMPLE_ASSIGNMENTS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("assigntrack-data", JSON.stringify(assignments));
    }
  }, [assignments, isLoaded]);

  // Computed stats
  const stats = {
    total: assignments.length,
    submitted: assignments.filter((a) => a.status === "Submitted").length,
    pending: assignments.filter((a) => a.status === "Pending").length,
    late: assignments.filter((a) => a.status === "Late").length,
  };

  // Unique subjects from assignments
  const allSubjects = Array.from(new Set(assignments.map((a) => a.subject))).sort();

  // Filter + Search
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "All" || a.subject === filterSubject;
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Sort: pending first, then late, then submitted; within each group sort by dueDate
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const statusOrder: Record<Status, number> = { Pending: 0, Late: 1, Submitted: 2 };
    const diff = statusOrder[a.status] - statusOrder[b.status];
    if (diff !== 0) return diff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleAddAssignment = useCallback(
    (assignment: Assignment) => {
      setAssignments((prev) => [assignment, ...prev]);
      setShowModal(false);
      setToast({ message: "Assignment added successfully!", type: "success" });
    },
    [],
  );

  const handleChangeStatus = useCallback((id: string, newStatus: Status) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
    setToast({ message: `Status updated to ${newStatus}`, type: "success" });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setToast({ message: "Assignment deleted", type: "success" });
  }, []);

  // Don't render until data is loaded (prevents hydration mismatch)
  if (!isLoaded) {
    return (
      <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="empty-state__icon" style={{ animation: "pulseGlow 2s ease-in-out infinite" }}>📚</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────── */}
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__icon" aria-hidden="true">📋</div>
          <div>
            <h1 className="app-header__title">AssignTrack</h1>
            <p className="app-header__subtitle">College Assignment Submission Tracker</p>
          </div>
        </div>
      </header>

      {/* ── Dashboard Stats ──────────────────── */}
      <div className="dashboard-grid stagger-children">
        <StatCard label="Total" value={stats.total} icon="📊" variant="total" />
        <StatCard label="Submitted" value={stats.submitted} icon="✅" variant="submitted" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" variant="pending" />
        <StatCard label="Late" value={stats.late} icon="🚨" variant="late" />
      </div>

      {/* ── Toolbar ──────────────────────────── */}
      <div className="toolbar animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="toolbar__search">
          <span className="toolbar__search-icon" aria-hidden="true">
            <IconSearch />
          </span>
          <input
            id="search-assignments"
            className="toolbar__search-input"
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          id="filter-subject"
          className="toolbar__select"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          aria-label="Filter by subject"
        >
          <option value="All">All Subjects</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          id="filter-status"
          className="toolbar__select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Pending">Pending</option>
          <option value="Late">Late</option>
        </select>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          id="btn-add-assignment"
          type="button"
        >
          <IconPlus />
          Add Assignment
        </button>
      </div>

      {/* ── Assignment List ──────────────────── */}
      <div className="table-container">
        <div className="table-container__header">
          <span className="table-container__title">Assignments</span>
          <span className="table-container__count">
            {sortedAssignments.length} of {assignments.length} shown
          </span>
        </div>

        {sortedAssignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__title">No assignments found</div>
            <div className="empty-state__description">
              {assignments.length === 0
                ? 'Click "Add Assignment" to create your first one.'
                : "Try adjusting your search or filter criteria."}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="assignments-table-wrap">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ width: 90, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className="assignment-title">{a.title}</span>
                      </td>
                      <td>
                        <span className="assignment-subject">{a.subject}</span>
                      </td>
                      <td>
                        <span
                          className="assignment-date"
                          style={
                            isOverdue(a.dueDate) && a.status !== "Submitted"
                              ? { color: "var(--status-late)" }
                              : undefined
                          }
                        >
                          {formatDate(a.dueDate)}
                          {isOverdue(a.dueDate) && a.status !== "Submitted" && " • Overdue"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge
                          status={a.status}
                          onChangeStatus={(s) => handleChangeStatus(a.id, s)}
                        />
                      </td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="row-action-btn row-action-btn--delete"
                            onClick={() => handleDelete(a.id)}
                            aria-label={`Delete ${a.title}`}
                            title="Delete"
                            type="button"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="assignment-cards">
              {sortedAssignments.map((a) => (
                <div className="assignment-card" key={a.id}>
                  <div className="assignment-card__top">
                    <span className="assignment-card__title">{a.title}</span>
                    <button
                      className="row-action-btn row-action-btn--delete"
                      onClick={() => handleDelete(a.id)}
                      aria-label={`Delete ${a.title}`}
                      type="button"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  <div className="assignment-card__meta">
                    <span className="assignment-subject">{a.subject}</span>
                    <span
                      className="assignment-date"
                      style={
                        isOverdue(a.dueDate) && a.status !== "Submitted"
                          ? { color: "var(--status-late)" }
                          : undefined
                      }
                    >
                      {formatDate(a.dueDate)}
                    </span>
                  </div>
                  <div className="assignment-card__bottom">
                    <StatusBadge
                      status={a.status}
                      onChangeStatus={(s) => handleChangeStatus(a.id, s)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modal ────────────────────────────── */}
      {showModal && (
        <AddModal onClose={() => setShowModal(false)} onAdd={handleAddAssignment} />
      )}

      {/* ── Toast ────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
