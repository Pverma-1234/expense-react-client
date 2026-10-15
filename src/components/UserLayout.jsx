import UserFooter from "./UserFooter";
import UserHeader from "./UserHeader";

function UserLayout({ children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <UserHeader />
            <main style={{ flex: "1 0 auto" }}>
                {children}
            </main>
            <UserFooter />
        </div>
    );
}

export default UserLayout;
