import { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./task-workspace-controls.css";

const TaskHeaderControlsContext = createContext(null);
export const TaskReadingActionsContext = createContext(null);

export function TaskHeaderControlsProvider({ children }) {
  const [target, setTarget] = useState(null);
  const value = useMemo(() => ({ target, setTarget }), [target]);
  return <TaskHeaderControlsContext.Provider value={value}>{children}</TaskHeaderControlsContext.Provider>;
}

export function TaskHeaderActions({ children, register = false, className = "" }) {
  const controls = useContext(TaskHeaderControlsContext);
  return <div className={`s2-workspace-header-actions ${className}`} ref={register ? controls?.setTarget : undefined}>{children}</div>;
}

// Keep the original component/state owner, but place its control in the actual toolbar.
export function TaskHeaderControlPortal({ children }) {
  const controls = useContext(TaskHeaderControlsContext);
  return controls ? controls.target ? createPortal(children, controls.target) : null : children;
}

export function TaskPaneActions({ children, className = "" }) {
  const restore = useContext(TaskReadingActionsContext);
  return <TaskHeaderActions className={className}>{restore}{children}</TaskHeaderActions>;
}
