import { ReactNode } from "react";
import Navbar from "./Navbar";
import { SiteFooter } from "./site/SiteShell";
import GlobalBackBar from "./GlobalBackBar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <GlobalBackBar />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
);

export default Layout;
