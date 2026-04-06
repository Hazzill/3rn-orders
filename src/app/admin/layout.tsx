"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import { useBuyerAuth } from "@/context/BuyerContext";

const navigation = [
  { name: "ภาพรวมระบบ", icon: LayoutDashboard, href: "/admin", label: "ภาพรวม" },
  { name: "จัดการออร์เดอร์", icon: ShoppingCart, href: "/admin/orders", label: "ออร์เดอร์" },
  { name: "พนักงาน", icon: Users, href: "/admin/staff", label: "บุคลากร" },
  { name: "ร้านค้า", icon: Store, href: "/admin/stores", label: "คู่ค้า" },
  { name: "สินค้า", icon: Package, href: "/admin/products", label: "คลังสินค้า" },
  { name: "ประวัติ", icon: FileText, href: "/admin/history", label: "ย้อนหลัง" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { buyer, logout } = useBuyerAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-ui flex min-h-screen bg-[#eef2f6] text-slate-900">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Admin Console</div>
              <div className="truncate text-base font-semibold text-slate-950">MAN-ORDER</div>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-500">ผู้ดูแลระบบ</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">{buyer?.name || "Administrator"}</div>
            <div className="mt-1 text-xs text-slate-500">สิทธิ์ {buyer?.role === "admin" ? "ดูแลเต็มระบบ" : "ไม่รองรับ"}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors",
                  isActive
                    ? "border-slate-300 bg-slate-900 text-white"
                    : "border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border",
                      isActive
                        ? "border-slate-700 bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn("truncate text-sm", isActive ? "text-white" : "text-slate-900")}>
                      {item.name}
                    </div>
                    <div className={cn("truncate text-xs", isActive ? "text-slate-300" : "text-slate-500")}>
                      {item.label}
                    </div>
                  </div>
                </div>
                <ChevronRight className={cn("h-4 w-4", isActive ? "text-slate-300" : "text-slate-400")} />
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-200 px-3 py-4">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors",
              pathname === "/admin/settings"
                ? "border-slate-300 bg-slate-900 text-white"
                : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
            )}
          >
            <Settings className="h-4 w-4" />
            ตั้งค่าระบบ
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-sm text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <div className="text-xs text-slate-500">Admin Console</div>
              <div className="text-sm font-semibold text-slate-950">MAN-ORDER</div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors active:scale-95 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
