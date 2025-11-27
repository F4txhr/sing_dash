import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./lib/themeContext";
import { ConnectionProvider } from "./lib/connectionStatus";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ConnectionProvider>
  </React.StrictMode>
);