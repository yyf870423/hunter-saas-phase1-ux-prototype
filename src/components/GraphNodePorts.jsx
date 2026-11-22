import "./graph-node-ports.css";

const sides = { top: "上方", right: "右侧", bottom: "下方", left: "左侧" };

export function GraphNodePorts({ label, className, activeSide, destination = false, onStart }) {
  return Object.entries(sides).map(([side, name]) => <span key={side}
    role="button" tabIndex="0" className={`graph-node-port ${className} ${activeSide === side ? "is-connecting" : ""}`}
    data-port={side} aria-label={destination ? `连接到${label}${name}` : `从${label}${name}开始连线`} data-tooltip={destination ? `连接到${name}` : `从${name}拖到另一个节点建立关系`}
    onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      onStart(side, false);
    }}
    onKeyDown={event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      onStart(side, true);
    }}
  />);
}
