import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./lib/themeContext";
import { ConnectionProvider } from "./lib/connectionStatus";
import { LayoutProvider } from "./lib/layoutContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider>
      <LayoutProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LayoutProvider>
    </ConnectionProvider>
  </React.StrictMode>
);