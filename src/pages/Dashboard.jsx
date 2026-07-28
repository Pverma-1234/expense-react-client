import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Dashboard() {
    const user = useSelector((state) => state.userDetails);

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h2 className="fw-bold display-6">Welcome, <span className="text-primary">{user.name}</span>!</h2>
                <p className="text-muted">Manage your shared expenses efficiently</p>
            </div>

            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 hover-shadow">
                        <div className="card-body text-center p-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                <i className="bi bi-people text-primary" style={{ fontSize: "2rem" }}></i>
                            </div>
                            <h5 className="card-title fw-bold">Manage Groups</h5>
                            <p className="card-text text-muted small">Create and manage group expenses with friends</p>
                            <Link to="/groups" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
                                Go to Groups
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 hover-shadow">
                        <div className="card-body text-center p-4">
                            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                <i className="bi bi-credit-card text-success" style={{ fontSize: "2rem" }}></i>
                            </div>
                            <h5 className="card-title fw-bold">Payments</h5>
                            <p className="card-text text-muted small">Track and manage payment settlements</p>
                            <Link to="/manage-payments" className="btn btn-success rounded-pill px-4 py-2 fw-bold">
                                Manage Payments
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 hover-shadow">
                        <div className="card-body text-center p-4">
                            <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                <i className="bi bi-graph-up text-info" style={{ fontSize: "2rem" }}></i>
                            </div>
                            <h5 className="card-title fw-bold">Analytics</h5>
                            <p className="card-text text-muted small">View expense reports and analytics</p>
                            <button className="btn btn-info rounded-pill px-4 py-2 fw-bold" disabled>
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;