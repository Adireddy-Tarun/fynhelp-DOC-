import { Outlet } from "react-router-dom";
import CASidebar from "./CASidebar";
import CAAuthGuard from "./CAAuthGuard";
import { CA } from "./portalUi";

export default function CAPortalLayout() {
  return (
    <CAAuthGuard>
      <div className="min-h-screen" style={{ background: CA.bg }}>
        <CASidebar />
        <main style={{ marginLeft: 236, padding: "28px 32px", minHeight: "100vh" }}>
          <Outlet />
        </main>
      </div>
    </CAAuthGuard>
  );
}
