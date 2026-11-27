import { useCallback, useEffect, useRef, useState } from "react";
import {graphText} from "./graph-copy.js";
import {FloatingPanel, SelectMenu} from "../stage4/asset-ui";
import {useGraphMenuDismiss as useDismiss} from "./useGraphMenuDismiss.js";
import {Icon as ProtoIcon} from "./Icon";
import "./graph-presentation.css";
function GraphLayoutActions({ onLayout, disabled }) {
    const t = graphText;
    const [open, setOpen] = useState(false);
    const trigger = useRef(null);
    const panel = useRef(null);
    const initialItem = useRef(0);
    const close = useCallback(() => {
        const restoreFocus = panel.current?.contains(document.activeElement);
        setOpen(false);
        if (restoreFocus)
            trigger.current?.focus({ preventScroll: true });
    }, []);
    useDismiss(open, close, trigger, panel);
    useEffect(() => { if (disabled)
        close(); }, [disabled, close]);
    useEffect(() => {
        if (!open)
            return;
        const frame = requestAnimationFrame(() => panel.current?.querySelectorAll("button")[initialItem.current]?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open]);
    const navigate = (event) => {
        // Canvas shortcuts must not treat menu Enter/Tab as adding a node.
        event.stopPropagation();
        if (event.key === "Tab") {
            close();
            return;
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || disabled)
            return;
        event.preventDefault();
        if (!open) {
            initialItem.current = event.key === "ArrowUp" || event.key === "End" ? 1 : 0;
            setOpen(true);
            return;
        }
        const items = [...(panel.current?.querySelectorAll("button") ?? [])];
        const index = items.indexOf(document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
        items[next]?.focus({ preventScroll: true });
    };
    return <div className="graph-layout-actions" onKeyDown={navigate}>
    <button ref={trigger} type="button" className="s1-button s1-button-secondary s1-button-sm graph-layout-trigger" aria-haspopup="menu" aria-expanded={open && !disabled} disabled={disabled} onBlur={event => {
            if (!panel.current?.contains(event.relatedTarget))
                setOpen(false);
        }} onClick={() => { initialItem.current = 0; setOpen(value => !value); }}>
      <ProtoIcon name="layoutHorizontal"/><span>{t("graphPresentation.layout")}</span><ProtoIcon className="graph-layout-chevron" name={open ? "chevronUp" : "chevronDown"}/>
    </button>
    <FloatingPanel open={open && !disabled} anchorRef={trigger} panelRef={panel} className="graph-layout-menu" role="menu" ariaLabel={t("graphPresentation.layout")} width={190}>
      {["LR", "TB"].map(direction => <button key={direction} type="button" role="menuitem" tabIndex={-1} onBlur={event => {
                if (!panel.current?.contains(event.relatedTarget) && !trigger.current?.contains(event.relatedTarget))
                    setOpen(false);
            }} onClick={() => { close(); onLayout(direction); }}>
        <ProtoIcon name={direction === "LR" ? "layoutHorizontal" : "layoutVertical"}/><span>{t(`graphPresentation.run${direction}`)}</span>
      </button>)}
    </FloatingPanel>
  </div>;
}
export function GraphPresentationControls({ lineStyle, onLineStyle, onLayout, disabled = false, placement = "canvas" }) {
    const t = graphText;
    return <div className={`graph-presentation-controls${placement === "toolbar" ? " is-toolbar" : ""}`} role="group" aria-label={t("graphPresentation.controls")}>
    <SelectMenu label={t("graphPresentation.lineStyle")} ariaLabel={t("graphPresentation.lineStyle")} value={lineStyle === "step" ? "直角线" : "自然曲线"} options={["自然曲线", "直角线"]} optionIcons={{ "自然曲线": "curve", "直角线": "orthogonal" }} onChange={value => onLineStyle(value === "直角线" ? "step" : "curve")}/>
    <GraphLayoutActions onLayout={onLayout} disabled={disabled}/>
  </div>;
}
