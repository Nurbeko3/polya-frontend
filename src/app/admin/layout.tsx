"use client";

import { useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { useTheme } from "@/components/theme/theme-provider";
import { Layout, Menu, Avatar, Badge, Dropdown, Typography, Space, Button, Spin } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const navigation = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/applications", icon: <FileTextOutlined />, label: "Arizalar" },
  { key: "/admin/fields", icon: <EnvironmentOutlined />, label: "Maydonlar" },
  { key: "/admin/bookings", icon: <CalendarOutlined />, label: "Bronlar" },
  { key: "/admin/users", icon: <UserOutlined />, label: "Foydalanuvchilar" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/applications": "Arizalar",
  "/admin/fields": "Maydonlar",
  "/admin/bookings": "Bronlar",
  "/admin/users": "Foydalanuvchilar",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const [pendingApps, setPendingApps] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist?.hasHydrated()) setHydrated(true);
    };
    checkHydration();
    const unsub = useAuthStore.persist?.onHydrate(() => checkHydration());
    return () => unsub?.();
  }, []);

  useEffect(() => {
    const fetchPendingApps = async () => {
      try {
        const data = await api.getApplications("pending");
        setPendingApps(Array.isArray(data) ? data.length : 0);
      } catch {}
    };
    if (isAuthenticated && user?.is_admin) fetchPendingApps();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (hydrated && !isAuthenticated && !isAuthPage) {
      router.push("/admin/login");
    } else if (hydrated && isAuthenticated && !isAuthPage && !user?.is_admin) {
      router.push("/");
    }
  }, [hydrated, isAuthenticated, isAuthPage, user, router]);

  if (!hydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated && !isAuthPage) return null;
  if (isAuthenticated && !isAuthPage && !user?.is_admin) return null;
  if (isAuthPage) return <>{children}</>;

  const selectedKey =
    pathname === "/admin"
      ? "/admin"
      : navigation.find((item) => item.key !== "/admin" && pathname.startsWith(item.key))?.key || "/admin";

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{user?.phone}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "settings", icon: <SettingOutlined />, label: "Sozlamalar" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Chiqish",
      danger: true,
      onClick: () => { logout(); router.push("/admin/login"); },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 49, display: "block",
          }}
          className="md:hidden"
        />
      )}

      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={72}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          overflow: "hidden",
          boxShadow: "2px 0 20px rgba(0,0,0,0.3)",
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "transform 0.25s ease",
        }}
        className={!mobileOpen ? "max-md:!-translate-x-full" : ""}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            }}>
              P
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>POLYA</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#818cf8", letterSpacing: "0.1em" }}>ADMIN PANEL</div>
              </div>
            )}
          </Link>
        </div>

        {/* Menu */}
        <div style={{ padding: "12px 8px", flex: 1 }}>
          {navigation.map((item) => {
            const isSelected = selectedKey === item.key;
            const showBadge = item.key === "/admin/applications" && pendingApps > 0;
            return (
              <Link key={item.key} href={item.key} style={{ textDecoration: "none" }}>
                <div style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px" : "10px 14px",
                  borderRadius: 10,
                  marginBottom: 4,
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(129,140,248,0.2))"
                    : "transparent",
                  border: isSelected ? "1px solid rgba(99,102,241,0.5)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: isSelected ? "#a5b4fc" : "rgba(255,255,255,0.65)",
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, color: isSelected ? "#818cf8" : "rgba(255,255,255,0.5)" }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && showBadge && (
                    <span style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                      minWidth: 18,
                      textAlign: "center",
                    }}>
                      {pendingApps}
                    </span>
                  )}
                  {collapsed && showBadge && (
                    <span style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "block",
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          <Link href="/">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 8,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px" : "10px 14px",
              borderRadius: 10,
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}>
              <ArrowLeftOutlined style={{ fontSize: 14 }} />
              {!collapsed && <span style={{ fontSize: 13 }}>Saytga qaytish</span>}
            </div>
          </Link>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 72 : 240, transition: "margin-left 0.2s" }} className="max-md:!ml-0">
        {/* Header */}
        <Header style={{
          background: isDark ? "#0f172a" : "#fff",
          padding: "0 24px",
          borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          lineHeight: "normal",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: isDark ? "0 1px 8px rgba(0,0,0,0.3)" : "0 1px 8px rgba(0,0,0,0.06)",
          overflow: "visible",
        }}>
          <Space size="middle">
            {/* Desktop toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: isDark ? "#94a3b8" : "#64748b" }}
              className="max-md:!hidden"
            />
            {/* Mobile toggle */}
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(true)}
              style={{ fontSize: 16, color: isDark ? "#94a3b8" : "#64748b" }}
              className="md:!hidden"
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", lineHeight: 1.3 }}>
                {pageTitles[selectedKey] || "Admin Panel"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Polya Admin
              </div>
            </div>
          </Space>

          <Space size="middle">
            <Badge count={pendingApps} size="small" color="#ef4444">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 18 }}
                onClick={() => router.push("/admin/applications")}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "6px 12px 6px 6px",
                borderRadius: 12,
                border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                background: isDark ? "#1e293b" : "#f8fafc",
                transition: "all 0.15s",
              }}>
                <Avatar
                  size={34}
                  style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", fontWeight: 700, fontSize: 14, flexShrink: 0 }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ lineHeight: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", whiteSpace: "nowrap" }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, marginTop: 2, letterSpacing: "0.05em" }}>
                    {user?.is_super_admin ? "SUPER ADMIN" : "ADMIN"}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ padding: isMobile ? 12 : 24, background: isDark ? "#0c1220" : "#f1f5f9", minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
