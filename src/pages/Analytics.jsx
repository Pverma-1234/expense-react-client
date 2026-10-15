import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";

// ─────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────

/** Format a number as Indian Rupee. */
const rupee = (n) =>
    Number(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

/** "YYYY-MM" → "Oct 2026" */
const fmtMonth = (key) => {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};

/** ISO date string → "15 Oct 2026" */
const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          });
};

// ─────────────────────────────────────────────────────────────
// Inline CSS bar-chart (no extra library needed)
// ─────────────────────────────────────────────────────────────
function BarChart({ data, height = 140, barColor = "#0d6efd" }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.total), 1);

    return (
        <div
            className="d-flex align-items-flex-end gap-1"
            style={{ height: `${height}px`, paddingBottom: "20px" }}
            aria-label="Monthly expense bar chart"
        >
            {data.map((item, idx) => {
                const pct = (item.total / max) * 100;
                const label = item.month ? item.month.slice(5) : String(idx + 1);
                return (
                    <div
                        key={item.month || idx}
                        className="d-flex flex-column align-items-center"
                        style={{ flex: 1, height: "100%" }}
                        title={`${fmtMonth(item.month)}: ₹${rupee(item.total)}`}
                    >
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "flex-end",
                                width: "100%",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: `${pct}%`,
                                    minHeight: item.total > 0 ? "4px" : "0",
                                    backgroundColor: barColor,
                                    borderRadius: "3px 3px 0 0",
                                    transition: "height 0.5s ease",
                                    cursor: "default",
                                }}
                            />
                        </div>
                        <span
                            className="text-muted"
                            style={{ fontSize: "8px", marginTop: "3px", whiteSpace: "nowrap" }}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Summary Card
// ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, colorClass, bgClass }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
                <div
                    className={`${bgClass} rounded-3 d-inline-flex p-3 mb-3`}
                    style={{ lineHeight: 1 }}
                >
                    <i className={`bi ${icon} ${colorClass} fs-3`} />
                </div>
                <p className="text-muted small mb-1 fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                    {label}
                </p>
                <h4 className="fw-bold mb-0">{value}</h4>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Analytics Page
// ─────────────────────────────────────────────────────────────
function Analytics() {
    const user = useSelector((state) => state.userDetails);
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [period, setPeriod]   = useState("12"); // months to show in trend

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(
                    `${serverEndpoint}/analytics/summary`,
                    { withCredentials: true }
                );
                setData(res.data);
            } catch (err) {
                console.error("Analytics fetch failed:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load analytics. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div
                className="container d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-info mb-3"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading…</span>
                </div>
                <p className="text-muted fw-medium">Crunching your numbers…</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger rounded-4 d-flex align-items-start gap-3">
                    <i className="bi bi-exclamation-triangle-fill fs-4 mt-1 flex-shrink-0" />
                    <div>
                        <strong>Could not load analytics</strong>
                        <p className="mb-0 mt-1 small">{error}</p>
                    </div>
                </div>
                <Link to="/dashboard" className="btn btn-outline-secondary rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────
    if (!data || data.groupCount === 0) {
        return (
            <div className="container py-5">
                <PageHeader user={user} />
                <hr className="mb-5 opacity-10" />
                <div className="text-center py-5 bg-light rounded-5 border border-primary border-opacity-25">
                    <div className="bg-white rounded-circle d-inline-flex p-4 mb-4 shadow-sm">
                        <i className="bi bi-graph-up text-info" style={{ fontSize: "3rem" }} />
                    </div>
                    <h4 className="fw-bold">No Data Yet</h4>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: "420px" }}>
                        You are not part of any expense groups. Create a group and start
                        adding expenses to see your analytics here.
                    </p>
                    <Link to="/groups" className="btn btn-primary rounded-pill px-5 fw-bold">
                        <i className="bi bi-people me-2" />
                        Go to Groups
                    </Link>
                </div>
            </div>
        );
    }

    const {
        groupCount,
        expenseCount,
        totalExpenses,
        totalSettled,
        userOwes,
        userIsOwed,
        groupBreakdown,
        monthlyTrend,
        recentExpenses,
    } = data;

    const outstanding = Math.max(0, Math.round((totalExpenses - totalSettled) * 100) / 100);

    // Period selector for trend
    const periodN   = Number(period);
    const trendSlice = monthlyTrend.slice(Math.max(0, monthlyTrend.length - periodN));

    const maxGroupExp = Math.max(...groupBreakdown.map((g) => g.totalExpenses), 1);

    return (
        <div className="container py-5 px-4 px-md-5">

            {/* ── Page header ──────────────────────────────────────── */}
            <PageHeader user={user} />

            <hr className="mb-5 opacity-10" />

            {/* ── Summary cards ────────────────────────────────────── */}
            <section aria-label="Summary statistics">
                <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.08em" }}>
                    Overview
                </h6>
                <div className="row g-3 mb-5">
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-receipt"
                            label="Total Expenses"
                            value={`₹${rupee(totalExpenses)}`}
                            colorClass="text-primary"
                            bgClass="bg-primary bg-opacity-10"
                        />
                    </div>
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-hash"
                            label="Expense Records"
                            value={expenseCount}
                            colorClass="text-secondary"
                            bgClass="bg-secondary bg-opacity-10"
                        />
                    </div>
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-people"
                            label="Active Groups"
                            value={groupCount}
                            colorClass="text-info"
                            bgClass="bg-info bg-opacity-10"
                        />
                    </div>
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-check2-circle"
                            label="Total Settled"
                            value={`₹${rupee(totalSettled)}`}
                            colorClass="text-success"
                            bgClass="bg-success bg-opacity-10"
                        />
                    </div>
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-arrow-up-circle"
                            label="You Are Owed"
                            value={`₹${rupee(userIsOwed)}`}
                            colorClass="text-success"
                            bgClass="bg-success bg-opacity-10"
                        />
                    </div>
                    <div className="col-6 col-lg-4">
                        <StatCard
                            icon="bi-arrow-down-circle"
                            label="You Owe"
                            value={`₹${rupee(userOwes)}`}
                            colorClass={userOwes > 0 ? "text-danger" : "text-muted"}
                            bgClass={userOwes > 0 ? "bg-danger bg-opacity-10" : "bg-secondary bg-opacity-10"}
                        />
                    </div>
                </div>
            </section>

            {/* ── Balance snapshot ─────────────────────────────────── */}
            {(userOwes > 0 || userIsOwed > 0) && (
                <section aria-label="Balance snapshot" className="mb-5">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.08em" }}>
                        Your Balance
                    </h6>
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <div className="row g-3">
                                {userIsOwed > 0 && (
                                    <div className="col-md-6">
                                        <div className="p-3 bg-success bg-opacity-10 rounded-3 d-flex align-items-center gap-3">
                                            <i className="bi bi-wallet2 text-success fs-3" />
                                            <div>
                                                <p className="mb-0 text-muted small fw-semibold">Others owe you</p>
                                                <h5 className="mb-0 fw-bold text-success">₹{rupee(userIsOwed)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {userOwes > 0 && (
                                    <div className="col-md-6">
                                        <div className="p-3 bg-danger bg-opacity-10 rounded-3 d-flex align-items-center gap-3">
                                            <i className="bi bi-credit-card text-danger fs-3" />
                                            <div>
                                                <p className="mb-0 text-muted small fw-semibold">You owe others</p>
                                                <h5 className="mb-0 fw-bold text-danger">₹{rupee(userOwes)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {outstanding > 0 && (
                                <p className="mb-0 mt-3 small text-muted">
                                    <i className="bi bi-info-circle me-1" />
                                    ₹{rupee(outstanding)} remains unsettled across all your groups.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Spending trend ────────────────────────────────────── */}
            <section aria-label="Spending trend" className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <h6 className="fw-bold text-uppercase text-muted small mb-0" style={{ letterSpacing: "0.08em" }}>
                        Spending Trend
                    </h6>
                    <div className="d-flex gap-2">
                        {["3", "6", "12"].map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 ${period === p ? "btn-primary" : "btn-outline-secondary"}`}
                                onClick={() => setPeriod(p)}
                                aria-pressed={period === p}
                            >
                                {p}M
                            </button>
                        ))}
                    </div>
                </div>
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        {trendSlice.every((d) => d.total === 0) ? (
                            <div className="text-center py-4 text-muted">
                                <i className="bi bi-bar-chart fs-1 d-block mb-2 opacity-25" />
                                No expenses in the selected period.
                            </div>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between mb-1">
                                    <small className="text-muted">
                                        Total:{" "}
                                        <strong>
                                            ₹{rupee(trendSlice.reduce((s, d) => s + d.total, 0))}
                                        </strong>
                                    </small>
                                    <small className="text-muted">
                                        {trendSlice.length > 0 && fmtMonth(trendSlice[0].month)} –{" "}
                                        {trendSlice.length > 0 && fmtMonth(trendSlice[trendSlice.length - 1].month)}
                                    </small>
                                </div>
                                <BarChart data={trendSlice} />
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Group breakdown ───────────────────────────────────── */}
            <section aria-label="Group breakdown" className="mb-5">
                <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.08em" }}>
                    Group-wise Breakdown
                </h6>
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        {groupBreakdown.length === 0 ? (
                            <p className="text-muted text-center mb-0">No group data available.</p>
                        ) : (
                            <div className="d-flex flex-column gap-4">
                                {groupBreakdown.map((g) => {
                                    const pct = maxGroupExp > 0 ? (g.totalExpenses / maxGroupExp) * 100 : 0;
                                    const balSign = g.userBalance > 0.009 ? "text-success" : g.userBalance < -0.009 ? "text-danger" : "text-muted";
                                    const balLabel = g.userBalance > 0.009
                                        ? `You are owed ₹${rupee(g.userBalance)}`
                                        : g.userBalance < -0.009
                                        ? `You owe ₹${rupee(Math.abs(g.userBalance))}`
                                        : "Settled";

                                    return (
                                        <div key={g.groupId}>
                                            <div className="d-flex justify-content-between align-items-start mb-1 flex-wrap gap-1">
                                                <div>
                                                    <Link
                                                        to={`/groups/${g.groupId}`}
                                                        className="fw-semibold text-dark text-decoration-none small"
                                                    >
                                                        {g.name}
                                                    </Link>
                                                    <span className="text-muted small ms-2">
                                                        ({g.expenseCount} expense{g.expenseCount !== 1 ? "s" : ""})
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <span className="fw-bold small">₹{rupee(g.totalExpenses)}</span>
                                                    <br />
                                                    <span className={`${balSign} small`}>{balLabel}</span>
                                                </div>
                                            </div>
                                            <div
                                                className="progress rounded-pill"
                                                style={{ height: "7px" }}
                                                role="progressbar"
                                                aria-valuenow={pct}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    className="progress-bar bg-primary"
                                                    style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Recent expenses ───────────────────────────────────── */}
            {recentExpenses && recentExpenses.length > 0 && (
                <section aria-label="Recent expenses" className="mb-5">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.08em" }}>
                        Recent Expenses
                    </h6>
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 fw-semibold text-muted">Description</th>
                                        <th className="fw-semibold text-muted">Group</th>
                                        <th className="fw-semibold text-muted">Paid By</th>
                                        <th className="fw-semibold text-muted">Date</th>
                                        <th className="pe-4 fw-semibold text-muted text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentExpenses.map((exp, i) => {
                                        const isMe = String(exp.paidBy).toLowerCase() === String(user?.email).toLowerCase();
                                        return (
                                            <tr key={i}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{ width: "32px", height: "32px" }}
                                                        >
                                                            <i className="bi bi-bag text-primary" style={{ fontSize: "13px" }} />
                                                        </div>
                                                        <span className="fw-medium text-dark">{exp.title}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{exp.groupName}</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${isMe ? "bg-primary bg-opacity-10 text-primary" : "bg-secondary bg-opacity-10 text-secondary"}`}>
                                                        {isMe ? "You" : exp.paidBy}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{fmtDate(exp.createdAt)}</td>
                                                <td className="pe-4 fw-bold text-end">₹{rupee(exp.amount)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Navigation back ───────────────────────────────────── */}
            <div className="d-flex gap-2 flex-wrap">
                <Link to="/dashboard" className="btn btn-outline-secondary rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2" />
                    Dashboard
                </Link>
                <Link to="/groups" className="btn btn-outline-primary rounded-pill px-4">
                    <i className="bi bi-people me-2" />
                    Groups
                </Link>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Shared page header
// ─────────────────────────────────────────────────────────────
function PageHeader({ user }) {
    return (
        <div className="mb-5">
            <h2 className="fw-bold text-dark display-6">
                <i className="bi bi-graph-up text-info me-2" />
                <span className="text-info">Analytics</span>
            </h2>
            <p className="text-muted mb-0">
                Expense insights across all groups
                {user?.name ? ` for ${user.name}` : ""}.
            </p>
        </div>
    );
}

export default Analytics;
