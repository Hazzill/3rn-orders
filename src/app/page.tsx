"use client";

import Link from "next/link";
import { UserCog, ShoppingCart, Truck, ChevronRight, Loader2 } from "lucide-react";
import { useLiff } from "@/lib/liff";
import { useStaff } from "@/hooks/useStaff";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const { profile, isLoggedIn, loading: liffLoading, login } = useLiff();
  const { staff, loading: staffLoading } = useStaff();
  const router = useRouter();

  const currentUser = useMemo(() => {
    if (!profile || !staff.length) return null;
    return staff.find(s => s.lineUserId === profile.userId);
  }, [profile, staff]);

  useEffect(() => {
    if (!liffLoading && !staffLoading && isLoggedIn && currentUser) {
      if (currentUser.role === "buyer") {
        router.replace("/buy");
      } else if (currentUser.role === "orderer") {
        router.replace("/order");
      }
    }
  }, [liffLoading, staffLoading, isLoggedIn, currentUser, router]);

  const allRoles = [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: UserCog,
      allowed: ["admin"],
    },
    {
      title: "Order Mobile",
      href: "/order",
      icon: ShoppingCart,
      allowed: ["admin", "orderer"],
    },
    {
      title: "Buyer Mobile",
      href: "/buy",
      icon: Truck,
      allowed: ["admin", "buyer"],
    },
  ];

  const visibleRoles = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return allRoles;
    return allRoles.filter(r => r.allowed.includes(currentUser.role));
  }, [currentUser]);

  if (liffLoading || (isLoggedIn && staffLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-4xl mb-4">
            Welcome to Staff Portal
          </h1>
          <p className="text-slate-500 mb-8">Please login with LINE to continue</p>
          <button 
            onClick={login}
            className="rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white transition-colors hover:bg-slate-800"
          >
            LOGIN WITH LINE
          </button>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !currentUser) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          Your account is not registered in the system. Please contact the administrator.
        </p>
        <div className="bg-slate-100 p-4 rounded-xl text-xs font-mono text-slate-500 break-all mb-8">
          Line ID: {profile?.userId}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm font-bold text-slate-950 uppercase tracking-widest hover:underline"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-4xl">
          Select Workspace
        </h1>
        {currentUser && (
          <p className="mt-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Logged in as: {currentUser.name} ({currentUser.role})
          </p>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-4">
        {visibleRoles.map((role) => (
          <Link key={role.title} href={role.href} className="group">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 transition-colors group-hover:border-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{role.title}</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
