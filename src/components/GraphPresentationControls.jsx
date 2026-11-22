import { IconButton } from "../stage1/ui";
import { SelectMenu, TooltipText } from "../stage4/asset-ui";
import "./graph-presentation.css";

export function GraphPresentationControls({ lineStyle, direction, onLineStyle, onLayout, onUndo, canUndo = false, showUndo = false, disabled = false }) {
  return <div className="graph-presentation-controls" role="group" aria-label="画布显示与布局">
    <SelectMenu label="连线样式" ariaLabel="连线样式" value={lineStyle === "step" ? "直角线" : "自然曲线"} options={["自然曲线", "直角线"]} optionIcons={{ "自然曲线": "curve", "直角线": "orthogonal" }} onChange={value => onLineStyle(value === "直角线" ? "step" : "curve")} />
    <SelectMenu key={`${direction}:${canUndo}`} label="自动布局" ariaLabel="自动布局" value="" options={["左右布局", "上下布局"]} optionIcons={{ "左右布局": "layoutHorizontal", "上下布局": "layoutVertical" }} onChange={value => onLayout(value === "上下布局" ? "TB" : "LR")} disabled={disabled} />
    {showUndo ? <TooltipText trigger="always" className="s4-action-tooltip" tip="撤销自动布局"><IconButton icon="undo" label="撤销自动布局" disabled={!canUndo} onClick={onUndo} /></TooltipText> : null}
  </div>;
}
