import { Outlet } from "react-router";
import { DarkModeProvider } from "../context/DarkModeContext";

const Root = () => {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-theme-primary transition-colors duration-300">
        <Outlet />
      </div>
    </DarkModeProvider>
  );
};

export default Root;
