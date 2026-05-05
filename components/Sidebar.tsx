"use client";

import { ChannelMeta } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Mail, Users, Target, TrendingUp, Table2,
  Megaphone, Globe, X,
} from "lucide-react";

export type NavKey = "overview" | "table" | (string & {});

interface NavItem {
  key: NavKey;
  label: string;
  shortLabel: string;
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
    { key: "overview", label: "Overview", shortLabel: "All", icon: LayoutDashboard },
    ...channels.map((ch) => ({
      key:        ch.key as NavKey,
      label:      ch.title,
      shortLabel: ch.title.split(" ")[0],
      icon:       iconMap[ch.key] ?? LayoutDashboard,
      color:      ch.color,
    })),
    { key: "table", label: "All Metrics", shortLabel: "Table", icon: Table2 },
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
  const items = buildItems(channels);

  const inner = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
          <Target size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-main leading-tight truncate">Customer</p>
          <p className="text-xs text-subtle truncate">Acquisition</p>
        </div>
        {/* Close on mobile */}
        <button
          onClick={onMobileClose}
          className="ml-auto lg:hidden text-muted hover:text-subtle"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
          Platforms
        </p>
        {items.map((item, idx) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          const isDivider = idx === 0 || idx === items.length - 1;

          return (
            <div key={item.key}>
              {idx === items.length - 1 && (
                <div className="my-2 border-t border-border" />
              )}
              <button
                onClick={() => { onSelect(item.key); onMobileClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-subtle hover:bg-surface-2 hover:text-text-main"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
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
                <span className="truncate">{item.label}</span>
                {!isActive && item.color && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted">Powered by Google Sheets</p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
        {inner}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-text-main/20 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface shadow-xl z-50">
            {inner}
          </aside>
        </div>
      )}
    </>
  );
}
