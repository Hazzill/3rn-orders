"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ClipboardList,
  History,
  LogOut,
  Plus,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { useBuyerAuth } from "@/context/BuyerContext";

export default function MobileHeader({
  title = "POWERTECH LIMITED",
  userName = "ผู้ใช้งานระบบ",
  userAvatar,
  userRole = "ผู้ใช้งานระบบ",
  onBack,
}: {
  title?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  onBack?: () => void;
}) {
  const { logout } = useBuyerAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [userAvatar]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="sticky top-0 z-40 mx-auto -mx-4 max-w-md border-b border-slate-200 bg-white px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-md border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Powertech Limited
            </div>
            <div className="truncate text-lg font-semibold  text-slate-900">
              {title}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-3">
          <div className="min-w-0 text-right">
            <div className="truncate text-sm font-semibold leading-5 text-slate-900">
              {userName}
            </div>
            <div className="truncate text-[12px] leading-4 text-slate-500">{userRole}</div>
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 text-slate-700 transition-colors hover:border-slate-300"
            >
              {userAvatar && !imageFailed ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                  unoptimized
                />
              ) : (
                <User className="h-5 w-5 text-gray-300" />
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[92%] max-w-sm -translate-x-1/2 items-center justify-around rounded-xl border border-slate-300 bg-white p-2">
      <Link href="/buy" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/buy"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>สั่งสินค้า</span>
        </Button>
      </Link>

      <div className="relative">
        <Link href="/buy/new">
          <div className="absolute -top-11 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-primary bg-primary">
            <Plus className="h-7 w-7 text-black" strokeWidth={3} />
          </div>
        </Link>
      </div>

      <Link href="/order" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/order"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <ClipboardList className="h-5 w-5" />
          <span>จัดซื้อ</span>
        </Button>
      </Link>

      <Link href="/buy/history" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/buy/history"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <History className="h-5 w-5" />
          <span>ประวัติ</span>
        </Button>
      </Link>
    </div>
  );
}
