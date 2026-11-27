import { IconButton } from "../stage1/ui";
import { TooltipText } from "../stage4/asset-ui";

export function GraphHistoryControls({ history }) {
  return <div className="graph-history-controls" role="group" aria-label="撤销 / 重做">
    <TooltipText trigger="always" className="s4-action-tooltip" tip="撤销上一步"><IconButton icon="undo" label="撤销" disabled={!history?.count || history.pending} onClick={() => history?.undo()} /></TooltipText>
    <TooltipText trigger="always" className="s4-action-tooltip" tip="重做已撤销的操作"><IconButton icon="redo" label="重做" disabled={!history?.redoCount || history.pending} onClick={() => history?.redo()} /></TooltipText>
  </div>;
}
