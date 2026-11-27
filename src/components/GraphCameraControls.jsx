import { Icon } from "./Icon";
import { TooltipText } from "../stage4/asset-ui";

export function GraphCameraControls({ zoom, onZoom, onFit, isFullscreen, onFullscreen, labels = {} }) {
  const copy = { out: "缩小", in: "放大", fit: "自适应全部内容", enter: "进入图谱全屏", exit: "退出图谱全屏", ...labels };
  const fullscreenLabel = isFullscreen ? copy.exit : copy.enter;
  return <div className="tg-zoom-controls">
    <button type="button" aria-label={copy.out} onClick={() => onZoom(value => Math.max(0.1, Number((value - 0.1).toFixed(1))))}><Icon name="minus" /></button>
    <button type="button" onClick={() => onZoom(1)}>{Math.round(zoom * 100)}%</button>
    <button type="button" aria-label={copy.in} onClick={() => onZoom(value => Math.min(1.5, Number((value + 0.1).toFixed(1))))}><Icon name="plus" /></button>
    <TooltipText tip={copy.fit} trigger="always" className="s4-action-tooltip"><button type="button" aria-label={copy.fit} onClick={onFit}><Icon name="maximize" /></button></TooltipText>
    <TooltipText tip={fullscreenLabel} trigger="always" className="s4-action-tooltip"><button type="button" aria-label={fullscreenLabel} onClick={onFullscreen}><Icon name={isFullscreen ? "minimize2" : "maximize2"} /></button></TooltipText>
  </div>;
}
