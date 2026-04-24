import React from "react";
import type { LayoutDescriptor, ContentPanel } from "../../schema";
import { AppShell } from "./AppShell";
import { SidebarNav } from "./SidebarNav";
import { TopNav } from "./TopNav";
import { TabBar } from "./TabBar";
import { SearchBar } from "./SearchBar";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
import { PanelGrid } from "./PanelGrid";
import { Panel } from "./Panel";
import { StatCard } from "./StatCard";
import { DataTable } from "./DataTable";
import { ListItems } from "./ListItems";
import { MessageList } from "./MessageList";
import { Placeholder } from "./Placeholder";

export interface AppFromDescriptorProps {
  descriptor: LayoutDescriptor;
  id?: string;
  style?: React.CSSProperties;
}

const PanelContent: React.FC<{ panel: ContentPanel; index: number; prefix: string }> = ({ panel, index, prefix }) => {
  const panelId = `${prefix}panel-${index}`;

  switch (panel.type) {
    case "stat":
      return (
        <StatCard
          id={panelId}
          label={panel.label ?? panel.title ?? ""}
          value={panel.value ?? "—"}
          delta={panel.delta}
        />
      );

    case "table":
      return (
        <Panel id={panelId} title={panel.title}>
          <DataTable
            columns={panel.columns ?? []}
            rows={(panel.rows ?? []).map((r) => [...r])}
            statusColumn={panel.statusColumn}
          />
        </Panel>
      );

    case "list":
      return (
        <Panel id={panelId} title={panel.title}>
          <ListItems items={panel.items ?? []} />
        </Panel>
      );

    case "messages":
      return (
        <Panel id={panelId} title={panel.title}>
          <MessageList
            messages={panel.messages ?? []}
            variant={panel.messageVariant}
          />
        </Panel>
      );

    case "placeholder":
      return (
        <Panel id={panelId} title={panel.title}>
          <Placeholder label={panel.title || "Content"} height={panel.height ?? 200} />
        </Panel>
      );

    default: {
      const _exhaustive: never = panel.type;
      return <Placeholder label={`Unknown: ${_exhaustive}`} height={100} />;
    }
  }
};

const ContentArea: React.FC<{ descriptor: LayoutDescriptor; prefix: string }> = ({ descriptor, prefix }) => {
  const { content } = descriptor;
  if (!content.panels.length) {
    return <Placeholder label="Add content panels" height={300} />;
  }

  return (
    <PanelGrid columns={content.columnCount} gap={content.gap}>
      {content.panels.map((panel, i) => (
        <PanelContent key={i} panel={panel} index={i} prefix={prefix} />
      ))}
    </PanelGrid>
  );
};

export const AppFromDescriptor: React.FC<AppFromDescriptorProps> = ({
  descriptor,
  id,
  style,
}) => {
  const sidebar = descriptor.sidebar;
  const topBar = descriptor.topBar;
  const prefix = id ? `${id}-` : "";

  if (descriptor.layout === "minimal") {
    return (
      <div data-cursor-target={id} data-editor-id={id} data-editor-type="app-descriptor" style={{ height: "100%", overflow: "hidden", ...style }}>
        <div style={{ padding: 16 }}>
          <ContentArea descriptor={descriptor} prefix={prefix} />
        </div>
      </div>
    );
  }

  const sidebarNode = sidebar ? (
    <SidebarNav
      id="sidebar"
      items={sidebar.items.map((item) => ({
        label: item.label,
        icon: item.icon,
        active: item.active,
        badge: item.badge,
      }))}
      footer={sidebar.avatar ? <Avatar name={sidebar.avatar.name} size={28} /> : undefined}
    />
  ) : undefined;

  const topBarRight = (
    <>
      {topBar?.search && <SearchBar id="search" placeholder={topBar.searchPlaceholder} />}
      {topBar?.actions.map((action, i) => (
        <Button key={i} id={`action-${i}`} label={action.label} variant={action.variant} />
      ))}
    </>
  );

  const topBarNode = topBar ? (
    <TopNav
      left={
        <>
          {topBar.title && (
            <span style={{ fontWeight: 600, marginRight: topBar.tabs.length ? 16 : 0 }}>
              {topBar.title}
            </span>
          )}
          {topBar.tabs.length > 0 && <TabBar id="tabs" tabs={topBar.tabs} />}
        </>
      }
      right={topBarRight}
    />
  ) : undefined;

  if (descriptor.layout === "topbar") {
    return (
      <div data-cursor-target={id} data-editor-id={id} data-editor-type="app-descriptor" style={{ height: "100%", overflow: "hidden", ...style }}>
        <AppShell
          topBar={topBarNode}
          sidebarWidth={0}
        >
          <div style={{ padding: 16 }}>
            <ContentArea descriptor={descriptor} prefix={prefix} />
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div data-cursor-target={id} data-editor-id={id} data-editor-type="app-descriptor" style={{ height: "100%", overflow: "hidden", ...style }}>
      <AppShell
        sidebar={sidebarNode}
        sidebarWidth={sidebar?.width}
        topBar={topBarNode}
      >
        <div style={{ padding: 16 }}>
          <ContentArea descriptor={descriptor} prefix={prefix} />
        </div>
      </AppShell>
    </div>
  );
};
