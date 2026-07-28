import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};

        if (formData.name.trim().length === 0) {
            newErrors.name = "Name is required";
        }
        if (formData.email.trim().length === 0) {
            newErrors.email = "Email is required";
        }
        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await axios.post(
                `${serverEndpoint}/auth/register`,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                },
                { withCredentials: true }
            );

            // Registration succeeded — send them to login
            navigate("/login");
        } catch (error) {
            console.log(error);
            setErrors({
                message:
                    error.response?.data?.message ||
                    "Something went wrong, please try again",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark">
                                    Create your <span className="text-primary">Account</span>
                                </h2>
                                <p className="text-muted">
                                    Sign up to start using MergeMoney
                                </p>
                            </div>

                            {errors.message && (
                                <div className="alert alert-danger py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {errors.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Name
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.name ? "is-invalid" : ""
                                        }`}
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        placeholder="Your name"
                                        onChange={handleChange}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">{errors.name}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Email Address
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.email ? "is-invalid" : ""
                                        }`}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="name@example.com"
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary">
                                        Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.password ? "is-invalid" : ""
                                        }`}
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        placeholder="At least 6 characters"
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">{errors.password}</div>
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary w-100 btn-md rounded-pill fw-bold shadow-sm mb-3"
                                    disabled={loading}
                                >
                                    {loading ? "Creating account..." : "Sign Up"}
                                </button>
                            </form>

                            <p className="text-center small text-muted mb-0">
                                Already have an account?{" "}
                                <Link to="/login" className="fw-bold text-primary">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;