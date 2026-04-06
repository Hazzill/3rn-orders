"use client";

import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Card, Label } from "@/components/ui/FormElements";
import { useOrderContext } from "@/context/OrderContext";
import { useRouter } from "next/navigation";
import { useBuyerAuth } from "@/context/BuyerContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { useState } from "react";
import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import {
  sendLineGroupNotification,
  buildNewOrderMessage,
} from "@/lib/lineNotify";

export default function SummaryPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { orderData, setOrderData, resetOrder } = useOrderContext();
  const [submitting, setSubmitting] = useState(false);

  if (!buyer) return null;

  const handleSendOrder = async () => {
    if (orderData.items.length === 0) return;

    setSubmitting(true);
    try {
      let finalStoreId = orderData.storeId;

      if (!finalStoreId && orderData.storeName) {
        const storesRef = collection(db, "stores");
        const storeQuery = query(
          storesRef,
          where("name", "==", orderData.storeName),
          limit(1),
        );
        const querySnapshot = await getDocs(storeQuery);

        if (!querySnapshot.empty) {
          finalStoreId = querySnapshot.docs[0].id;
        } else {
          const newStoreRef = await addDoc(collection(db, "stores"), {
            name: orderData.storeName,
            location: orderData.location || "",
            phone: orderData.contact || "",
            type: "ทั่วไป",
            orders: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          finalStoreId = newStoreRef.id;
        }
      }

      await addDoc(collection(db, "orders"), {
        ...orderData,
        items: orderData.items.map((item) => ({
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          name: item.name,
          qty: Number(item.quantity) || 0,
          unit: item.unit,
          status: "to_buy",
        })),
        storeId: finalStoreId,
        mapUrl: orderData.mapUrl || "",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requesterId: buyer.id,
        requesterName: buyer.name,
        requesterUsername: buyer.username || "",
      });

      // Send LINE notification for new order
      try {
        const msg = buildNewOrderMessage({
          requesterName: buyer.name,
          storeName: orderData.storeName || "",
          mapUrl: orderData.mapUrl || "",
          itemCount: orderData.items.length,
          items: orderData.items.map((i) => ({
            name: i.name,
            qty: Number(i.quantity) || 0,
            unit: i.unit,
          })),
        });
        await sendLineGroupNotification("new_order", msg);
      } catch (notifyErr) {
        console.error("LINE notification error:", notifyErr);
      }

      resetOrder();
      router.push("/buy");
    } catch (err) {
      console.error(err);
      alert("Failed to send order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <MobileHeader
        title="ตรวจสอบและยืนยัน"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/new/items")}
      />

      <div className="px-1.5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-1.5 w-8 rounded-full bg-slate-900" />
             <div className="h-1.5 w-8 rounded-full bg-slate-900" />
             <div className="h-1.5 w-8 rounded-full bg-slate-900" />
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-slate-900 leading-tight">
            ยืนยันรายการสั่งซื้อ
          </h2>
          <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
            ตรวจสอบข้อมูลให้ถูกต้องก่อนส่งให้เจ้าหน้าที่จัดซื้อ
          </p>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-5 shadow-sm">
           <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-5">
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ร้านค้า</span>
                 <p className="text-[14px] font-bold text-slate-900 leading-tight">{orderData.storeName || "ไม่ได้ระบุ"}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จุดรับของ</span>
                 <p className="text-[14px] font-bold text-slate-900 leading-tight">{orderData.location || "-"}</p>
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex items-center justify-between px-0.5">
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">รายการสินค้า ({orderData.items.length})</span>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {orderData.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border-2 border-slate-50 bg-slate-50/50 p-3.5"
                  >
                    <div className="text-[14px] font-bold text-slate-900 leading-tight truncate mr-2">{item.name}</div>
                    <div className="text-[11px] font-black text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-100 shrink-0">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-1.5 pt-1">
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-0.5">หมายเหตุเพิ่มเติมถึงจัดซื้อ</label>
             <textarea
               placeholder="ระบุลายละเอียดเพิ่มเติมถ้ามี (เช่น ยี่ห้อสำรอง, ความเร่งด่วน)..."
               className="min-h-[100px] w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-3.5 text-[14px] font-bold text-slate-900 outline-none focus:border-slate-300 focus:bg-white transition-all ring-0"
               value={orderData.note}
               onChange={(e) =>
                 setOrderData({ ...orderData, note: e.target.value })
               }
             />
           </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/buy/new/items")}
            className="flex-1 h-14 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] uppercase tracking-widest"
          >
            ย้อนกลับ
          </button>
          <button
            disabled={submitting || orderData.items.length === 0}
            onClick={handleSendOrder}
            className="flex-[1.8] h-14 rounded-2xl bg-slate-900 text-white text-[15px] font-black shadow-lg shadow-slate-900/15 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-[0.15em] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                ยืนยันส่งคำสั่งซื้อ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
