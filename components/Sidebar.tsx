"use client";

import { useState } from "react";
import { ChannelMeta } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Mail, Users, Target, TrendingUp, Table2,
  Megaphone, Globe, X, ChevronLeft, ChevronRight,
} from "lucide-react";

export type NavKey = "overview" | "table" | (string & {});

interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ElementType;
  color?: string;
}

function buildItems(channels: ChannelMeta[]): NavItem[] {
  const iconMap: Record<string, React.ElementType> = {
    facebook:    Megaphone,
    google:      Globe,
    email:       Mail,
    conference:  Users,
    bullseyeAds: Target,
    bullseyeAll: TrendingUp,
  };
  return [
    { key: "overview", label: "Overview",    icon: LayoutDashboard },
    ...channels.map((ch) => ({
      key:   ch.key as NavKey,
      label: ch.title,
      icon:  iconMap[ch.key] ?? LayoutDashboard,
      color: ch.color,
    })),
    { key: "table", label: "All Metrics", icon: Table2 },
  ];
}

interface Props {
  channels: ChannelMeta[];
  active: NavKey;
  onSelect: (key: NavKey) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ channels, active, onSelect, mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const items = buildItems(channels);

  const desktopSidebar = (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-surface border-r border-border h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-border shrink-0 transition-all duration-300",
        collapsed ? "justify-center py-4 px-2" : "gap-3 px-4 py-4"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
          <Target size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-text-main leading-tight truncate">Customer</p>
            <p className="text-xs text-subtle truncate">Acquisition</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div className={cn(
        "flex-1 overflow-y-auto py-3 space-y-0.5 transition-all duration-300",
        collapsed ? "px-2" : "px-3"
      )}>
        {!collapsed && (
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Platforms
          </p>
        )}

        {items.map((item, idx) => {
          const isActive = active === item.key;
          const Icon = item.icon;

          return (
            <div key={item.key}>
              {idx === items.length - 1 && (
                <div className={cn("my-2 border-t border-border", collapsed && "mx-1")} />
              )}

              {/* Tooltip wrapper when collapsed */}
              <div className="relative group">
                <button
                  onClick={() => { onSelect(item.key); }}
                  className={cn(
                    "w-full flex items-center rounded-xl text-sm font-medium transition-all duration-150",
                    collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-subtle hover:bg-surface-2 hover:text-text-main"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-lg shrink-0 transition-all duration-300",
                      collapsed ? "h-8 w-8" : "h-7 w-7",
                      isActive ? "bg-white/20" : "bg-surface-2"
                    )}
                    style={!isActive && item.color ? { background: `${item.color}18` } : undefined}
                  >
                    <Icon
                      size={15}
                      style={!isActive && item.color ? { color: item.color } : undefined}
                      className={isActive ? "text-white" : ""}
                    />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="truncate flex-1">{item.label}</span>
                      {!isActive && item.color && (
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: item.color }} />
                      )}
                    </>
                  )}
                </button>

                {/* Tooltip on hover when collapsed */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="bg-text-main text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-text-main" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapse toggle + footer */}
      <div className={cn(
        "border-t border-border shrink-0 transition-all duration-300",
        collapsed ? "px-2 py-3 flex justify-center" : "px-4 py-3"
      )}>
        {!collapsed && (
          <p className="text-[10px] text-muted mb-2">Powered by Google Sheets</p>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-2 border border-border text-subtle hover:text-primary hover:border-primary transition-all duration-150"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <ChevronLeft  size={15} />
          }
        </button>
      </div>
    </aside>
  );

  const mobileDrawer = mobileOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-text-main/20 backdrop-blur-sm"
        onClick={onMobileClose}
      />
      <aside className="absolute left-0 top-0 h-full w-64 bg-surface shadow-xl z-50 flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
            <Target size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-main leading-tight truncate">Customer</p>
            <p className="text-xs text-subtle truncate">Acquisition</p>
          </div>
          <button onClick={onMobileClose} className="text-muted hover:text-subtle">
            <X size={18} />
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Platforms
          </p>
          {items.map((item, idx) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <div key={item.key}>
                {idx === items.length - 1 && <div className="my-2 border-t border-border" />}
                <button
                  onClick={() => { onSelect(item.key); onMobileClose(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive ? "bg-primary text-white shadow-sm" : "text-subtle hover:bg-surface-2 hover:text-text-main"
                  )}
                >
                  <span
                    className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-white/20" : "bg-surface-2")}
                    style={!isActive && item.color ? { background: `${item.color}18` } : undefined}
                  >
                    <Icon size={15} style={!isActive && item.color ? { color: item.color } : undefined} className={isActive ? "text-white" : ""} />
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                  {!isActive && item.color && (
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: item.color }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-muted">Powered by Google Sheets</p>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
