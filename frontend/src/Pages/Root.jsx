import { Outlet } from "react-router";

const Root = () => {
  return (
    <div className="bg-white min-h-screen">
      <Outlet></Outlet>
    </div>
  );
};

export default Root;
