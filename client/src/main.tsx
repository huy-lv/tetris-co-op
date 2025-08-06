import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import App from "./App.tsx";
import { theme } from "./theme";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

// Production config - disable console.log in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  // Keep console.error for debugging critical issues
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/tetris">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            color: "#fff",
            border: "1px solid rgba(156, 39, 176, 0.3)",
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
