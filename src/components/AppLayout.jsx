import Footer from "./Footer";
import Header from "./Header";

function AppLayout({ children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header/>
            <main style={{ flex: "1 0 auto" }}>
                {children}
            </main>
            <Footer/>
        </div>
    );
}

export default AppLayout;