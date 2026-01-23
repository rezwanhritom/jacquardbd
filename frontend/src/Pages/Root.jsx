import { DarkModeProvider } from "../context/DarkModeContext";
import Layout from "../components/Layout";

const Root = () => {
  return (
    <DarkModeProvider>
      <Layout />
    </DarkModeProvider>
  );
};

export default Root;
