import { useEffect, useState } from "react";
import {
  Button,
  EntitySelect,
  FormField,
  Modal,
  StateBanner,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import { graphTypes } from "./graph-types";
import {
  saveGraphMetadata,
  useTopicGraphs,
  validateGraphMetadata,
} from "./topic-graph-store";

export function GraphTypeSelect({
  value,
  onChange,
  all = false,
  disabled = false,
}) {
  return (
    <EntitySelect
      label={all ? "全部类型" : "选择图谱类型"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={[
        ...(all ? [{ value: "", label: "全部类型" }] : []),
        ...graphTypes.map((type) => ({ value: type.id, label: type.label })),
      ]}
    />
  );
}

export const graphMetadataDraft = (graph = {}) => ({
  name: graph?.name || "",
  typeId: graph?.typeId || "",
  description: graph?.description || "",
});

export function GraphMetadataFields({
  draft,
  onChange,
  errors = {},
  disabled = false,
}) {
  const change = (key) => (value) => onChange({ ...draft, [key]: value });
  return (
    <div className="s4-form-grid">
      <FormField label="图谱名称" required span={2} error={errors.name}>
        <TextInput
          value={draft.name}
          onChange={change("name")}
          disabled={disabled}
          placeholder="例如：具身智能 VLA 知识图谱"
        />
      </FormField>
      <FormField label="图谱类型" required span={2} error={errors.typeId}>
        <GraphTypeSelect
          value={draft.typeId}
          onChange={change("typeId")}
          disabled={disabled}
        />
      </FormField>
      <FormField label="图谱说明" span={2} error={errors.description}>
        <TextArea
          value={draft.description}
          onChange={change("description")}
          disabled={disabled}
          rows={4}
          placeholder="说明这份图谱主要整理什么内容。"
        />
      </FormField>
    </div>
  );
}

export function GraphMetadataEditor({
  graph,
  close,
  onSaved,
  disabled = false,
}) {
  const records = useTopicGraphs();
  const [draft, setDraft] = useState(() => graphMetadataDraft(graph));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const notify = useToast();
  useEffect(() => {
    setDraft(graphMetadataDraft(graph));
    setSubmitted(false);
    setError("");
  }, [graph?.id]);
  const errors = submitted
    ? validateGraphMetadata(draft, records, graph?.id)
    : {};
  const changed =
    JSON.stringify(draft) !== JSON.stringify(graphMetadataDraft(graph));
  return (
    <Modal
      open={Boolean(graph)}
      close={close}
      title="编辑图谱资料"
      size="md"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            icon="check"
            disabled={disabled || !changed}
            onClick={() => {
              setSubmitted(true);
              if (
                Object.keys(validateGraphMetadata(draft, records, graph.id))
                  .length
              )
                return;
              try {
                const saved = saveGraphMetadata(draft, graph.id);
                notify("图谱资料已保存");
                onSaved?.(saved);
                close();
              } catch (failure) {
                setError(failure.message);
              }
            }}
          >
            保存修改
          </Button>
        </>
      }
    >
      {disabled ? (
        <StateBanner tone="warning" icon="lock" title="暂无权限修改图谱资料" />
      ) : null}
      {error ? <StateBanner tone="danger" title={error} /> : null}
      <GraphMetadataFields
        draft={draft}
        errors={errors}
        disabled={disabled}
        onChange={(next) => {
          setDraft(next);
          setError("");
        }}
      />
    </Modal>
  );
}
