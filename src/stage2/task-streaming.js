import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
const characters = (value) => Array.from(value || "");

function textLength(node) {
  return node.type === "text" ? characters(node.value).length
    : (node.children || []).reduce((sum, child) => sum + textLength(child), 0);
}

export function replyTextLength(markdown) {
  return textLength(parser.runSync(parser.parse(markdown || "")));
}

export function replyStreamDuration(length) {
  return Math.max(1200, Math.min(6000, length * 18));
}

// Reveal the parsed tree, not an unfinished Markdown prefix. Unstarted rows stay hidden.
export function rehypeReplyStream({ budget = Infinity } = {}) {
  return (tree) => {
    if (!Number.isFinite(budget)) return;
    let remaining = Math.max(0, budget);
    function reveal(node) {
      if (node.type === "text") {
        const points = characters(node.value);
        const value = points.slice(0, remaining).join("");
        remaining = Math.max(0, remaining - points.length);
        return { node: { ...node, value }, visible: Boolean(value.trim()) };
      }
      if (!node.children) return { node, visible: false };
      const children = node.children.map(reveal);
      const visible = children.some((child) => child.visible);
      const keepEmptyCells = node.tagName === "tr";
      return {
        node: { ...node, children: children.filter((child) => child.visible || keepEmptyCells || child.node.type === "text" && child.node.value.length > 0 || visible && node.tagName === "li" && child.node.tagName === "input").map((child) => child.node) },
        visible,
      };
    }
    tree.children = tree.children.map(reveal).filter((child) => child.visible).map((child) => child.node);
  };
}
