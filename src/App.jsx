import { Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import Logout from "./pages/Logout";
import UserLayout from "./components/UserLayout";
import axios from "axios";
import { serverEndpoint } from "./config/appConfig";
import { useSelector, useDispatch } from "react-redux";
import { SET_USER } from "./redux/user/action";
import Groups from "./pages/Groups";
import GroupExpenses from "./pages/GroupExpenses";
import ManageUsers from "./pages/ManageUsers";
import ProtectedRoute from "./rbac/ProtectedRoute";
import UnauthorizedAccess from "./components/errors/UnauthorizedAccess";
import ManagePayments from "./pages/ManagePayments"; 

function App() {
    const dispatch = useDispatch();
    const userDetails = useSelector((state) => state.userDetails);
    const [loading, setLoading] = useState(true);

    const isUserLoggedIn = async () => {
        try {
            const response = await axios.post(
                `${serverEndpoint}/auth/is-user-logged-in`,
                {},
                { withCredentials: true }
            );

            dispatch({
                type: SET_USER,
                payload: response.data.user,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isUserLoggedIn();
    }, []);

    if (loading) {
        return (
            <div className="container text-center">
                <h3>Loading...</h3>
            </div>
        );
    }

    return (
        <Routes>

            {/* Public Routes */}
            <Route
                path="/"
                element={
                    userDetails ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <AppLayout>
                            <Home />
                        </AppLayout>
                    )
                }
            />

            <Route
                path="/login"
                element={
                    userDetails ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <AppLayout>
                            <Login />
                        </AppLayout>
                    )
                }
            />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={
                    userDetails ? (
                        <UserLayout>
                            <Dashboard />
                        </UserLayout>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            {/* Manage Users (RBAC Protected) */}
            <Route
                path="/manage-users"
                element={
                    <ProtectedRoute roles={["admin"]}>
                        <UserLayout>
                            <ManageUsers />
                        </UserLayout>
                    </ProtectedRoute>
                }
            />

            {/* Manage Payments (RBAC Protected) - added */}
            <Route
                path="/manage-payments"
                element={
                    userDetails ? (
                        <ProtectedRoute roles={["admin"]}>
                            <UserLayout>
                                <ManagePayments />
                            </UserLayout>
                        </ProtectedRoute>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            <Route
                path="/groups"
                element={
                    userDetails ? (
                        <UserLayout>
                            <Groups />
                        </UserLayout>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            <Route
                path="/groups/:groupId"
                element={
                    userDetails ? (
                        <UserLayout>
                            <GroupExpenses />
                        </UserLayout>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            {/* Unauthorized Page */}
            <Route
                path="/unauthorized-access"
                element={<UnauthorizedAccess />}
            />

            {/* Logout */}
            <Route
                path="/logout"
                element={
                    userDetails ? <Logout /> : <Navigate to="/login" />
                }
            />

        </Routes>
    );
}

export default App;
