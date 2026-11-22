import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, FilePreview, StateBanner } from "./asset-ui";
import { fileDatabase } from "./contact-file-storage";
import { extractOpportunityText } from "./opportunity-file-parser";

// 新标签页文件预览（产品决策 2026-11-22）：能看的直接显示，不能看的说明原因并给下载。
const IMAGE = /\.(png|jpe?g|webp|gif)$/i;
const PDF = /\.pdf$/i;
const PLAIN = /\.(txt|md|markdown|csv)$/i;
const OFFICE = /\.(docx|xlsx)$/i;

function download(url, name) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}

export function FilePreviewPage() {
  const [params] = useSearchParams();
  // 不同文件的参数不同时整页重新加载，避免沿用上一个文件的读取状态。
  return <FilePreviewView key={params.toString()} params={params} />;
}

function FilePreviewView({ params }) {
  const id = params.get("id");
  const name = params.get("name") || "未命名文件";
  const type = params.get("type") || "PDF";
  const source = params.get("source") || "";
  const [state, setState] = useState(id ? { status: "loading" } : { status: "sample" });

  useEffect(() => {
    if (!id) return undefined;
    let url = "";
    let cancelled = false;
    (async () => {
      try {
        const blob = await fileDatabase("get", id);
        if (!blob) throw new Error("missing");
        url = URL.createObjectURL(blob);
        let text = null;
        if (PLAIN.test(name)) text = await blob.text();
        else if (OFFICE.test(name))
          text = (await extractOpportunityText(new File([blob], name, { type: blob.type }))).text || null;
        if (!cancelled) setState({ status: "ready", url, text });
      } catch {
        if (!cancelled) setState({ status: "missing" });
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, name]);

  useEffect(() => {
    document.title = `${name} · 文件预览`;
  }, [name]);

  if (state.status === "sample")
    return (
      <main className="s4-file-preview-page is-sample">
        <FilePreview name={name} type={type} close={() => window.close()} />
      </main>
    );

  const ready = state.status === "ready";
  return (
    <main className="s4-file-preview-page">
      <header>
        <span>
          <Icon name="file" />
          <b>{name}</b>
          {source ? <small>{source}</small> : null}
        </span>
        {ready ? (
          <Button icon="download" onClick={() => download(state.url, name)}>
            下载文件
          </Button>
        ) : null}
      </header>
      <section>
        {state.status === "loading" ? <StateBanner icon="refresh" title="正在读取文件" /> : null}
        {state.status === "missing" ? (
          <StateBanner
            tone="danger"
            title="文件内容不存在"
            description="原文件可能已被浏览器清理，请回到原页面重新上传。"
          />
        ) : null}
        {ready && IMAGE.test(name) ? <img src={state.url} alt={name} /> : null}
        {ready && PDF.test(name) ? <iframe src={state.url} title={name} /> : null}
        {ready && !IMAGE.test(name) && !PDF.test(name) && state.text ? (
          <pre className="s4-long-copy">{state.text}</pre>
        ) : null}
        {ready && !IMAGE.test(name) && !PDF.test(name) && !state.text ? (
          <StateBanner
            title="此格式暂不支持在线预览"
            description="可以下载原文件后用本地软件打开。"
            action={
              <Button icon="download" onClick={() => download(state.url, name)}>
                下载文件
              </Button>
            }
          />
        ) : null}
      </section>
    </main>
  );
}
