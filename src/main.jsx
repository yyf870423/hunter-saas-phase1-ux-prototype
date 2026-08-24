import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./stage1/ui";
import "./stage1/stage1.css";
import "./stage2/stage2.css";
import "./stage3/stage3.css";
import "./stage4/stage4.css";
import "./stage5/stage5.css";
import "./components/components.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>,
);
