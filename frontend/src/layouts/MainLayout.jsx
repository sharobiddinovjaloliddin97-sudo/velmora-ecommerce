import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import MobileBottomNav from "../components/MobileBottomNav";
import ScrollToTop from "../components/ScrollToTop";

function MainLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#faf7f2] text-[#2d241e] transition-colors duration-200 dark:bg-[#141210] dark:text-[#ede4d8] pb-16 lg:pb-0">
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default MainLayout;