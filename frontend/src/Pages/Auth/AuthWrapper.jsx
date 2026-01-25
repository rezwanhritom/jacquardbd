import { Outlet } from "react-router";
import { DarkModeProvider } from "../../context/DarkModeContext";

const AuthWrapper = () => {
  return (
    <DarkModeProvider>
      <Outlet />
    </DarkModeProvider>
  );
};

export default AuthWrapper;
