import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { DarkModeProvider } from "../../context/DarkModeContext";

const AuthWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <DarkModeProvider>
      <Outlet />
    </DarkModeProvider>
  );
};

export default AuthWrapper;
