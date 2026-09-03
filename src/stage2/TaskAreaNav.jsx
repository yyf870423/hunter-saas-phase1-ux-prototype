import { useNavigate } from "react-router-dom";

export function TaskAreaNav({ value = "tasks" }) {
  const navigate = useNavigate();
  return (
    <nav className="s2-task-area-nav app-tabs" aria-label="任务区域">
      {[
        ["tasks", "任务", "/tasks"],
        ["periodic", "周期性任务", "/tasks/periodic"],
      ].map(([id, label, route]) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === id}
          className={value === id ? "is-active" : ""}
          key={id}
          onClick={() => navigate(route)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
