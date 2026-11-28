import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { ToastScope, useToast } from "../stage1/ui";

const TaskFeedbackContext = createContext(null);

export function TaskFeedbackProvider({ children }) {
  const location = useLocation();
  const key = location.pathname + location.search;
  const currentKey = useRef(key);
  currentKey.current = key;
  const fallback = useToast();
  const [feedback, setFeedback] = useState(null);
  const hosts = useRef(0);
  const registerHost = useCallback(() => {
    hosts.current += 1;
    return () => {
      hosts.current -= 1;
    };
  }, []);
  const active =
    location.pathname === "/new" ||
    location.pathname === "/tasks" ||
    location.pathname.startsWith("/tasks/") ||
    new URLSearchParams(location.search).has("report");
  useEffect(() => setFeedback(null), [key]);
  const clear = useCallback(() => setFeedback(null), []);
  const notify = useCallback(
    (message, tone = "success") => {
      if (!active) {
        fallback(message, tone);
        return;
      }
      if (currentKey.current !== key) return;
      if (!hosts.current) {
        if (["error", "danger", "warning"].includes(tone))
          fallback(message, tone);
        return;
      }
      setFeedback({ message, tone });
    },
    [key, active, fallback],
  );
  return (
    <TaskFeedbackContext.Provider value={{ feedback, clear, registerHost }}>
      <ToastScope notify={notify}>{children}</ToastScope>
    </TaskFeedbackContext.Provider>
  );
}

export const useTaskFeedback = () => useContext(TaskFeedbackContext);

export function TaskFeedback() {
  const { feedback, registerHost } = useTaskFeedback() || {};
  useEffect(() => registerHost?.(), [registerHost]);
  if (!feedback) return null;
  const problem = ["error", "danger", "warning"].includes(feedback.tone);
  return (
    <p
      className={`s2-task-inline-feedback ${problem ? "is-problem" : ""}`}
      role={problem ? "alert" : "status"}
    >
      {feedback.message}
    </p>
  );
}
