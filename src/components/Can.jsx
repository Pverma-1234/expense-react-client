import { useSelector } from "react-redux";
import { ROLE_PERMISSIONS } from "../rbac/userPermissions";

function Can({ requiredPermission, children }) {
    const user = useSelector((state) => state.userDetails);

    // Get permissions based on user role
    const userPermissions = ROLE_PERMISSIONS[user?.role] || {};

    // If permission exists, render children, otherwise render nothing
    return userPermissions[requiredPermission] ? children : null;
}

export default Can;
