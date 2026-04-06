"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/components/ui/Button";
import { getStoreMapLink, getStoreOrderSeed, getStorePhoneLink } from "@/lib/storeUtils";
import {
  Store,
  MapPin,
  Phone,
  Navigation,
  ShoppingCart,
  Loader2,
  Building2,
  ChevronLeft,
} from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { stores, loading } = useStores();
  const { resetOrder, setOrderData } = useOrderContext();

  const store = useMemo(
    () => stores.find((item) => item.id === params.id),
    [params.id, stores],
  );

  if (!buyer) return null;

  const handleOrder = () => {
    if (!store) return;
    resetOrder();
    setOrderData((prev) => ({
      ...prev,
      ...getStoreOrderSeed(store),
    }));
    router.push("/buy/new/items");
  };

  const mapLink = store ? getStoreMapLink(store) : "";
  const phoneLink = store ? getStorePhoneLink(store) : "";

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <MobileHeader
        title={store?.name || "ข้อมูลร้านค้า"}
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/stores")}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
          <p className="mt-4 text-[12px] font-black uppercase tracking-[0.2em]">กำลังโหลดข้อมูล...</p>
        </div>
      ) : !store ? (
        <div className="mx-2 space-y-4 rounded-2xl border-2 border-dashed border-slate-100 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Store className="h-8 w-8 text-slate-200" />
          </div>
          <div className="space-y-1">
            <div className="text-[17px] font-black text-slate-900">ไม่พบร้านค้าในระบบ</div>
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-tighter">DATA NOT FOUND</p>
          </div>
          <button 
            onClick={() => router.push("/buy/stores")} 
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-950 text-white text-[13px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับไปหน้ารวม
          </button>
        </div>
      ) : (
        <div className="px-2 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner shrink-0 text-slate-950">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[18px] font-black text-slate-900 leading-tight mb-1 truncate">{store.name}</h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                   {store.type || "ทั่วไป"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="flex items-start gap-4 group">
                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Location</span>
                  <span className="text-[13px] font-bold text-slate-900 leading-snug break-words">{store.location || "ไม่ระบุพื้นที่"}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Contact</span>
                  <span className="text-[13px] font-bold text-slate-900 leading-none">{store.phone || "ไม่ระบุเบอร์โทร"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={phoneLink || "#"}
              onClick={(event) => { if (!phoneLink) event.preventDefault(); }}
              className={cn(
                "h-12 rounded-xl flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 border-2",
                phoneLink ? "bg-white border-slate-100 text-slate-900 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <Phone className="h-4 w-4" />
              ติดต่อ
            </a>

            <a
              href={mapLink || "#"}
              target={mapLink ? "_blank" : undefined}
              onClick={(event) => { if (!mapLink) event.preventDefault(); }}
              className={cn(
                "h-12 rounded-xl flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 border-2",
                mapLink ? "bg-white border-slate-100 text-slate-900 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <Navigation className="h-4 w-4" />
              แผนที่
            </a>

            <button 
              onClick={handleOrder} 
              className="col-span-2 h-14 mt-1 rounded-xl bg-primary text-slate-950 flex items-center justify-center gap-3 text-[14px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.98] transition-all border-b-4 border-slate-900/10"
            >
              <ShoppingCart className="h-5 w-5" />
              สร้างออร์เดอร์ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
