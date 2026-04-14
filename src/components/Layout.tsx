import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GlobalBackBar from "./GlobalBackBar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <GlobalBackBar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
