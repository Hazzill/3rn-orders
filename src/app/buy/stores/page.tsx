"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { getStoreMapLink, getStoreOrderSeed, getStorePhoneLink } from "@/lib/storeUtils";
import {
  Store,
  MapPin,
  Phone,
  Search,
  ChevronRight,
  Loader2,
  Plus,
  Navigation,
  ShoppingCart,
  Building2,
} from "lucide-react";
import { NetworkStore } from "@/types";

export default function StoreListPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { stores, loading } = useStores();
  const { setOrderData, resetOrder } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");

  if (!buyer) return null;

  const filteredStores = stores.filter((store) => {
    const q = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.type?.toLowerCase().includes(q) ||
      store.location?.toLowerCase().includes(q)
    );
  });

  const handleSelectStore = (store: NetworkStore) => {
    resetOrder();
    setOrderData((prev) => ({
      ...prev,
      ...getStoreOrderSeed(store),
    }));
    router.push("/buy/new/items");
  };

  const handleOpenStore = (storeId: string) => {
    router.push(`/buy/stores/${storeId}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-3 pb-20">
      <MobileHeader
        title="ระบบจัดการร้านค้า"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy")}
      />

      {/* Statistics Row */}
      <div className="grid grid-cols-2 gap-2 px-1">
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 py-2.5 px-3.5 transition-all">
          <div className="text-[10px] uppercase tracking-wider text-blue-600 font-black">ร้านค้าทั้งหมด</div>
          <div className="text-xl font-black text-blue-800">{stores.length}</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white py-2.5 px-3.5 transition-all shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black">ผลการค้นหา</div>
          <div className="text-xl font-black text-slate-900">{filteredStores.length}</div>
        </div>
      </div>

      <div className="px-1 space-y-2">
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
          </div>
          <Input
            placeholder="ค้นหาชื่อร้านค้า หรือพื้นที่ใช้งาน..."
            className="h-11 pl-10 rounded-xl border-2 border-slate-100 bg-white text-[13px] font-bold text-slate-900 focus:border-blue-400 focus:ring-0 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Link href="/buy/stores/new" className="block">
          <button className="flex w-full items-center justify-between rounded-xl bg-slate-900 py-2.5 px-4 shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-black text-white leading-tight">เพิ่มร้านค้าใหม่</div>
                <div className="text-[9px] text-white/50 uppercase font-bold tracking-widest leading-none">Register New Partner</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30" />
          </button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 pt-1 border-b border-slate-50 pb-1.5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-none flex items-center gap-1.5">
            <Building2 className="h-3 w-3" />
            รายชื่อพาร์ทเนอร์ • DIRECTORY
          </h2>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in transition-all">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="mt-4 text-[12px] font-black uppercase tracking-widest leading-none">กำลังโหลดข้อมูลชั่วครู่...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="mx-1 rounded-2xl border-2 border-dashed border-slate-100 bg-white/50 py-20 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Store className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-[15px] font-black text-slate-900 underline decoration-primary decoration-4 underline-offset-4">ไม่พบร้านค้าในระบบ</p>
              <p className="mt-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                โปรดลองคำค้นหาอื่น หรือสร้างร้านค้าใหม่
              </p>
            </div>
          ) : (
            filteredStores.map((store) => {
              const mapLink = getStoreMapLink(store);
              const phoneLink = getStorePhoneLink(store);

              return (
                <div
                  key={store.id}
                  onClick={() => handleOpenStore(store.id)}
                  className="relative mx-1 cursor-pointer rounded-xl border border-slate-200 border-l-4 border-l-primary bg-white p-3 hover:border-slate-400 transition-all active:scale-[0.99] shadow-sm animate-in slide-in-from-bottom-2 duration-300 select-none"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-black text-slate-950 leading-tight mb-1 truncate">
                        {store.name}
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[9.5px] font-black text-slate-600 uppercase tracking-widest leading-none">
                        {store.type || "ทั่วไป"}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <a
                        href={phoneLink || "#"}
                        onClick={(e) => { e.stopPropagation(); if (!phoneLink) e.preventDefault(); }}
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-lg border transition-all active:scale-90",
                          phoneLink ? "bg-white border-slate-200 text-slate-600 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed"
                        )}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={mapLink || "#"}
                        target={mapLink ? "_blank" : undefined}
                        onClick={(e) => { e.stopPropagation(); if (!mapLink) e.preventDefault(); }}
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-lg border transition-all active:scale-90",
                          mapLink ? "bg-white border-slate-200 text-slate-600 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed"
                        )}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-slate-50">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="text-[12px] font-black uppercase tracking-tight truncate leading-none">{store.location || "ไม่ระบุพื้นที่จัดส่ง"}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="h-3 w-3 shrink-0 text-slate-300" />
                          <span className="text-[11px] font-black leading-none">{store.phone}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectStore(store);
                      }}
                      className="h-9 px-4 rounded-lg bg-primary text-slate-950 flex items-center gap-2 active:scale-95 shadow-md shadow-primary/20 hover:bg-[#b0f53d] transition-all border border-primary shrink-0"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-black uppercase tracking-tight">สั่งสินค้า</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

