import { useEffect, useState } from "react";
import {
  Button,
  FieldGroup,
  FileDrop,
  Modal,
  StateBanner,
  useToast,
} from "./asset-ui";
import { saveContact } from "./company-contact-store";

import { fileDatabase } from "./contact-file-storage";

export function ContactFiles({ contact }) {
  const notify = useToast();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  const upload = async () => {
    if (!files.length) {
      setError("请选择文件");
      return;
    }
    if (
      files.some((file) => !/\.(pdf|docx|xlsx|txt|png|jpe?g)$/i.test(file.name))
    ) {
      setError("文件格式不支持，请上传 PDF、DOCX、XLSX、TXT 或图片。");
      return;
    }
    if (files.some((file) => file.size > 50 * 1024 * 1024)) {
      setError("单个文件不能超过 50 MB。");
      return;
    }
    if (
      new Set([
        ...(contact.files || []).map((file) => file.name),
        ...files.map((file) => file.name),
      ]).size !==
      (contact.files || []).length + files.length
    ) {
      setError("已存在同名文件，请重命名后上传。");
      return;
    }
    setBusy(true);
    const added = [];
    try {
      for (const file of files) {
        const id = `${contact.companyId}/${contact.id}/${crypto.randomUUID()}`;
        await fileDatabase("put", id, file);
        added.push({ id, name: file.name, size: file.size, type: file.type });
      }
      saveContact(
        contact.companyId,
        { files: [...(contact.files || []), ...added] },
        contact.id,
      );
      setOpen(false);
      setFiles([]);
      notify("文件已保存");
    } catch {
      for (const file of added)
        await fileDatabase("delete", file.id).catch(() => {});
      setError("文件保存失败，请检查浏览器存储空间后重试。");
    } finally {
      setBusy(false);
    }
  };
  const openFile = async (file, download = false) => {
    try {
      const blob = await fileDatabase("get", file.id);
      if (!blob) throw new Error("missing file");
      const url = URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else
        setPreview({
          ...file,
          url,
          text: /\.txt$/i.test(file.name) ? await blob.text() : null,
        });
    } catch {
      notify("文件读取失败，可能已被浏览器清理，请重新上传。", "error");
    }
  };
  return (
    <FieldGroup
      title="联系人文件"
      action={
        <Button
          size="sm"
          icon="upload"
          onClick={() => {
            setOpen(true);
            setError("");
          }}
        >
          上传文件
        </Button>
      }
    >
      {(contact.files || []).length ? (
        <div className="s4-contact-company-relations">
          {contact.files.map((file) => (
            <article className="s4-contact-file-row" key={file.id}>
              <span>
                <b>{file.name}</b>
                <small>{Math.max(1, Math.ceil(file.size / 1024))} KB</small>
              </span>
              <Button size="sm" onClick={() => openFile(file)}>
                预览
              </Button>
              <Button
                size="sm"
                icon="download"
                onClick={() => openFile(file, true)}
              >
                下载
              </Button>
              <Button
                size="sm"
                tone="danger-outline"
                onClick={() => setDeleting(file)}
              >
                删除
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <StateBanner title="暂无文件" />
      )}
      <Modal
        open={open}
        close={() => setOpen(false)}
        closeDisabled={busy}
        title="上传联系人文件"
        footer={
          <>
            <Button disabled={busy} onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button tone="primary" disabled={busy} onClick={upload}>
              {busy ? "保存中" : "保存文件"}
            </Button>
          </>
        }
      >
        <FileDrop
          files={files}
          onFiles={setFiles}
          accept="PDF、DOCX、XLSX、TXT、PNG、JPG"
          error={error}
        />
      </Modal>
      <Modal
        open={Boolean(preview)}
        close={() => setPreview(null)}
        size="xl"
        title={preview?.name || "文件预览"}
      >
        {preview?.text !== null && preview?.text !== undefined ? (
          <pre className="s4-contact-file-text">{preview.text}</pre>
        ) : /\.(pdf|png|jpe?g)$/i.test(preview?.name || "") ? (
          <iframe
            sandbox=""
            className="s4-contact-file-preview"
            src={preview.url}
            title={preview.name}
          />
        ) : (
          <StateBanner
            title="此格式暂不支持在线预览"
            action={
              <Button onClick={() => openFile(preview, true)}>下载文件</Button>
            }
          />
        )}
      </Modal>
      <Modal
        open={Boolean(deleting)}
        close={() => setDeleting(null)}
        title="删除联系人文件"
        description={`确认删除“${deleting?.name || ""}”？此操作无法撤销。`}
        footer={
          <>
            <Button onClick={() => setDeleting(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={async () => {
                try {
                  saveContact(
                    contact.companyId,
                    {
                      files: (contact.files || []).filter(
                        (file) => file.id !== deleting.id,
                      ),
                    },
                    contact.id,
                  );
                  await fileDatabase("delete", deleting.id);
                  setDeleting(null);
                  notify("文件已删除");
                } catch {
                  notify("文件删除失败，请重试。", "error");
                }
              }}
            >
              确认删除
            </Button>
          </>
        }
      />
    </FieldGroup>
  );
}
