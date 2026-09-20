import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";

function MainLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f5ef]">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;