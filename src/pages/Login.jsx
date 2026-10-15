import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { serverEndpoint } from "../config/appConfig";
import { useDispatch } from "react-redux";
import { SET_USER } from "../redux/user/action";
import { Link } from "react-router-dom";

function Login() {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const validate = () => {
        let newErrors = {};
        let isValid = true;

        if (formData.email.length === 0) {
            newErrors.email = "Email is required";
            isValid = false;
        }

        if (formData.password.length === 0) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = async (event) => {
        // Prevent default behaviour of form which is to do complete page reload.
        event.preventDefault();

        const formValues = new FormData(event.currentTarget);
        const email = String(formValues.get("email") || "").trim();
        const password = String(formValues.get("password") || "");

        const nextErrors = {};

        if (!email) {
            nextErrors.email = "Email is required";
        }

        if (!password) {
            nextErrors.password = "Password is required";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        try {
            const body = {
                email,
                password,
            };
            const config = { withCredentials: true };
            const response = await axios.post(
                `${serverEndpoint}/auth/login`,
                body,
                config
            );
            dispatch({
                type: SET_USER,
                payload: response.data.user,
            });
        } catch (error) {
            console.log(error);
            setErrors({
                message: "Something went wrong, please try again",
            });
        }
    };

    const handleGoogleSuccess = async (authResponse) => {
        try {
            const body = {
                idToken: authResponse?.credential,
            };
            const response = await axios.post(
                `${serverEndpoint}/auth/google-auth`,
                body,
                { withCredentials: true }
            );
            dispatch({
                type: SET_USER,
                payload: response.data.user,
            });
        } catch (error) {
            console.log(error);
            setErrors({
                message: "Unable to process google sso, please try again",
            });
        }
    };

    const handleGoogleFailure = (error) => {
        console.log(error);
        setErrors({
            message:
                "Something went wrong while performing google single sign-on",
        });
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    {/* Main Login Card */}
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-5">
                            {/* Brand Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark">
                                    Welcome{" "}
                                    <span className="text-primary">Back</span>
                                </h2>
                                <p className="text-muted">
                                    Login to manage your MergeMoney account
                                </p>
                            </div>

                            {/* Global Alerts */}
                            {(message || errors.message) && (
                                <div className="alert alert-danger py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {message || errors.message}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} noValidate>
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
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
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
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-primary w-100 btn-md rounded-pill fw-bold shadow-sm mb-4">
                                        Sign In
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="d-flex align-items-center my-2">
                                <hr className="flex-grow-1 text-muted" />
                                <span className="mx-3 text-muted small fw-bold">
                                    OR
                                </span>
                                <hr className="flex-grow-1 text-muted" />
                            </div>

                            {/* Google Social Login */}
                            <div className="d-flex justify-content-center w-100">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleFailure}
                                    theme="outline"
                                    shape="pill"
                                    text="signin_with"
                                    width="500"
                                />
                            </div>
                            <p className="text-center small text-muted mt-4 mb-0">
    Don't have an account?{" "}
    <Link to="/register" className="fw-bold text-primary">
        Sign up
    </Link>
</p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
