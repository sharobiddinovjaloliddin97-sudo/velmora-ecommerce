import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import ScrollToTop from "../components/ScrollToTop";

function MainLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#faf7f2] text-[#2d241e]">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;