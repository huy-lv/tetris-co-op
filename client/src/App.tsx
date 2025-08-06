import React from "react";
import AppRoutes from "./components/AppRoutes";
import ConnectionStatus from "./components/ConnectionStatus";

const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <ConnectionStatus />
    </>
  );
};

export default App;
