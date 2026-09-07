import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, useToast } from "../stage1/ui";
import {
  assetNavigationItems,
  defaultVisibleAssetIds,
  saveAssetNavigationPreferences,
  useAssetNavigationPreferences,
} from "../stage1/asset-navigation-store";
import {
  InlineNotice,
  SettingRow,
  SettingsError,
  SettingsLoading,
  SettingsPageHeader,
  SettingsSection,
  Toggle,
} from "./settings-ui";

export function NavigationSettingsPage() {
  const selected = useAssetNavigationPreferences();
  const [draft, setDraft] = useState(selected);
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const state = params.get("state") || "normal";
  const limited = ["limited", "permission-limited"].includes(state);
  const notify = useToast();
  useEffect(() => {
    setDraft(selected);
    setError("");
  }, [selected]);
  const changed = JSON.stringify(draft) !== JSON.stringify(selected);
  const isDefault =
    JSON.stringify(draft) === JSON.stringify(defaultVisibleAssetIds);
  if (state === "loading") return <SettingsLoading rows={7} />;
  if (state === "error")
    return (
      <SettingsError
        onRetry={() => {
          const next = new URLSearchParams(params);
          next.delete("state");
          setParams(next);
        }}
      />
    );
  return (
    <>
      <SettingsPageHeader
        title="导航"
        actions={
          <>
            <Button
              disabled={limited || isDefault}
              icon="refresh"
              onClick={() => {
                setDraft([...defaultVisibleAssetIds]);
                setError("");
              }}
            >
              恢复默认
            </Button>
            <Button
              tone="primary"
              icon="check"
              disabled={limited || !changed}
              onClick={() => {
                const result = saveAssetNavigationPreferences(draft);
                setError(result.error);
                if (!result.error) notify("导航设置已保存");
              }}
            >
              保存设置
            </Button>
          </>
        }
      />
      {limited ? (
        <InlineNotice tone="warning" icon="lock">
          暂无权限修改导航设置。
        </InlineNotice>
      ) : null}
      {error ? (
        <InlineNotice tone="danger" icon="warning">
          {error}
        </InlineNotice>
      ) : null}
      <SettingsSection title="平铺显示的资产">
        <div className="s5-setting-list">
          {assetNavigationItems.map((item) => (
            <SettingRow
              key={item.id}
              icon={item.icon}
              title={item.label}
              disabled={limited}
              action={
                <Toggle
                  label={`平铺显示${item.label}`}
                  checked={draft.includes(item.id)}
                  disabled={limited}
                  onChange={(checked) => {
                    setDraft(
                      assetNavigationItems
                        .filter((asset) =>
                          asset.id === item.id
                            ? checked
                            : draft.includes(asset.id),
                        )
                        .map((asset) => asset.id),
                    );
                    setError("");
                  }}
                />
              }
            />
          ))}
        </div>
      </SettingsSection>
    </>
  );
}
