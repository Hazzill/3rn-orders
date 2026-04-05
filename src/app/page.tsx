"use client";

import Link from "next/link";
import { UserCog, ShoppingCart, Truck, ChevronRight } from "lucide-react";

export default function Home() {

  const roles = [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: UserCog,
    },
    {
      title: "Order Mobile",
      href: "/order",
      icon: ShoppingCart,
    },
    {
      title: "Buyer Mobile",
      href: "/buy",
      icon: Truck,
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-4xl">
          Select Workspace
        </h1>
      </div>

      <div className="grid w-full grid-cols-1 gap-4">
        {roles.map((role) => (
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
