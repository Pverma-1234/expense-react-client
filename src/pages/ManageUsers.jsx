import { useEffect, useState } from "react";
import { serverEndpoint } from "../config/appConfig";
import axios from "axios";
import Can from "../components/Can";
import { useSelector } from "react-redux";

function ManageUsers() {
    const currentUser = useSelector((state) => state.userDetails);

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [users, setUsers] = useState([]);

    // Add-member form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Select",
    });

    // Edit mode state
    const [editingUser, setEditingUser] = useState(null); // holds the user being edited
    const [editFormData, setEditFormData] = useState({ name: "", role: "Select" });
    const [editErrors, setEditErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${serverEndpoint}/users/`, {
                withCredentials: true,
            });
            setUsers(response.data.users);
        } catch (error) {
            console.log(error);
            setErrors({ message: "Unable to fetch users, please try again" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let isValid = true;
        let newErrors = {};

        if (formData.name.trim().length === 0) {
            isValid = false;
            newErrors.name = "Name is required";
        }

        if (formData.email.trim().length === 0) {
            isValid = false;
            newErrors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                isValid = false;
                newErrors.email = "Please enter a valid email address";
            }
        }

        if (formData.role === "Select") {
            isValid = false;
            newErrors.role = "Role is required";
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            setActionLoading(true);
            setMessage(null);
            setErrors({});

            try {
                const response = await axios.post(
                    `${serverEndpoint}/users/`,
                    {
                        name: formData.name.trim(),
                        email: formData.email.trim().toLowerCase(),
                        role: formData.role,
                    },
                    { withCredentials: true }
                );

                setUsers([...users, response.data.user]);
                setMessage("User added successfully! They will receive a temporary password by email.");
                setFormData({ name: "", email: "", role: "Select" });

            } catch (error) {
                console.log(error);
                const backendMessage =
                    error.response?.data?.message ||
                    (error.response?.status === 401 ? "Your session has expired. Please log in again." : null) ||
                    "Unable to add user, please try again";
                setErrors({ message: backendMessage });
            } finally {
                setActionLoading(false);
            }
        }
    };

    // ── EDIT ──────────────────────────────────────────────────────────────────
    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({ name: user.name, role: user.role });
        setEditErrors({});
        setMessage(null);
        setErrors({});
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const validateEdit = () => {
        let isValid = true;
        let newErrors = {};

        if (!editFormData.name || editFormData.name.trim().length === 0) {
            isValid = false;
            newErrors.name = "Name is required";
        }

        if (!editFormData.role || editFormData.role === "Select") {
            isValid = false;
            newErrors.role = "Role is required";
        }

        setEditErrors(newErrors);
        return isValid;
    };

    const handleEditSave = async () => {
        if (!validateEdit()) return;

        // Frontend guard: prevent admin from stripping their own role
        if (editingUser._id === currentUser?._id && editFormData.role !== "admin") {
            setEditErrors({ message: "You cannot remove your own administrator role." });
            return;
        }

        setEditLoading(true);
        setMessage(null);

        try {
            const response = await axios.patch(
                `${serverEndpoint}/users/`,
                {
                    userId: editingUser._id,
                    name: editFormData.name.trim(),
                    role: editFormData.role,
                },
                { withCredentials: true }
            );

            // Update the local list
            setUsers(users.map((u) => (u._id === editingUser._id ? response.data.user : u)));
            setMessage("User updated successfully!");
            setEditingUser(null);
        } catch (error) {
            console.log(error);
            setEditErrors({ message: error.response?.data?.message || "Unable to update user, please try again" });
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditingUser(null);
        setEditErrors({});
    };

    // ── DELETE ────────────────────────────────────────────────────────────────
    const handleDeleteClick = async (user) => {
        // Guard: prevent admin from deleting themselves
        if (user._id === currentUser?._id) {
            setErrors({ message: "You cannot delete your own account." });
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${user.name}" (${user.email})?\n\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        setMessage(null);
        setErrors({});

        try {
            await axios.post(
                `${serverEndpoint}/users/delete`,
                { userId: user._id },
                { withCredentials: true }
            );

            setUsers(users.filter((u) => u._id !== user._id));
            setMessage(`User "${user.name}" was deleted successfully.`);
        } catch (error) {
            console.log(error);
            setErrors({ message: error.response?.data?.message || "Unable to delete user, please try again" });
        }
    };

    if (loading) {
        return (
            <div className="container p-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 px-4 px-md-5">

            {errors.message && (
                <div className="alert alert-danger">{errors.message}</div>
            )}

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            <div className="row align-items-center mb-5">
                <div className="col-md-8 text-center text-md-start">
                    <h2 className="fw-bold display-6">
                        Manage <span className="text-primary">Users</span>
                    </h2>
                    <p className="text-muted">
                        View and manage all the users along with their permissions
                    </p>
                </div>
            </div>

            <div className="row">

                {/* Add user form */}
                <Can requiredPermission="canCreateUsers">
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5>Add Member</h5>
                        </div>

                        <div className="card-body p-2">
                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={errors.name ? "form-control is-invalid" : "form-control"}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback ps-1">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        className={errors.email ? "form-control is-invalid" : "form-control"}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback ps-1">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select
                                        name="role"
                                        className={errors.role ? "form-select is-invalid" : "form-select"}
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="Select">Select</option>
                                        <option value="manager">Manager</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    {errors.role && (
                                        <div className="invalid-feedback ps-1">
                                            {errors.role}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                <button
                                    className="btn btn-primary w-100"
                                    
                                >
                                    {actionLoading ? (
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    ) : (
                                        <>Add</>
                                    )}
                                </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
                </Can>

                {/* Users table */}
                <div className="col-md-9">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5>Team Members</h5>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-center">Name</th>
                                            <th className="text-center">Email</th>
                                            <th className="text-center">Role</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-muted">
                                                    No users found. Start by adding one!
                                                </td>
                                            </tr>
                                        )}

                                        {users.length > 0 &&
                                            users.map((user) => (
                                                <tr key={user._id}>
                                                    {editingUser && editingUser._id === user._id ? (
                                                        // ── Inline edit row ──────────────────────────
                                                        <>
                                                            <td className="align-middle">
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    className={editErrors.name ? "form-control form-control-sm is-invalid" : "form-control form-control-sm"}
                                                                    value={editFormData.name}
                                                                    onChange={handleEditChange}
                                                                />
                                                                {editErrors.name && (
                                                                    <div className="invalid-feedback">{editErrors.name}</div>
                                                                )}
                                                            </td>
                                                            <td className="align-middle text-muted">{user.email}</td>
                                                            <td className="align-middle">
                                                                <select
                                                                    name="role"
                                                                    className={editErrors.role ? "form-select form-select-sm is-invalid" : "form-select form-select-sm"}
                                                                    value={editFormData.role}
                                                                    onChange={handleEditChange}
                                                                    disabled={user._id === currentUser?._id}
                                                                >
                                                                    <option value="manager">Manager</option>
                                                                    <option value="viewer">Viewer</option>
                                                                    {user._id === currentUser?._id && (
                                                                        <option value="admin">Admin</option>
                                                                    )}
                                                                </select>
                                                                {editErrors.role && (
                                                                    <div className="invalid-feedback">{editErrors.role}</div>
                                                                )}
                                                            </td>
                                                            <td className="align-middle">
                                                                {editErrors.message && (
                                                                    <div className="text-danger small mb-1">{editErrors.message}</div>
                                                                )}
                                                                <button
                                                                    className="btn btn-sm btn-success me-1"
                                                                    onClick={handleEditSave}
                                                                    disabled={editLoading}
                                                                >
                                                                    {editLoading ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status" />
                                                                    ) : "Save"}
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={handleEditCancel}
                                                                    disabled={editLoading}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        // ── Normal display row ────────────────────────
                                                        <>
                                                            <td className="align-middle">{user.name}</td>
                                                            <td className="align-middle">{user.email}</td>
                                                            <td className="align-middle">{user.role}</td>
                                                            <td className="align-middle">
                                                                <Can requiredPermission="canUpdateUsers">
                                                                    <button
                                                                        className="btn btn-link text-primary"
                                                                        onClick={() => handleEditClick(user)}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </Can>
                                                                <Can requiredPermission="canDeleteUsers">
                                                                    <button
                                                                        className="btn btn-link text-danger"
                                                                        onClick={() => handleDeleteClick(user)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </Can>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ManageUsers;
