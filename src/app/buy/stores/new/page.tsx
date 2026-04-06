"use client";

import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/FormElements";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Store, MapPin, Phone, Tag, Loader2, Link2, PlusCircle, Building2 } from "lucide-react";

export default function CreateStorePage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState({
    name: "",
    type: "",
    location: "",
    mapUrl: "",
    phone: "",
  });

  const handleCreate = async () => {
    if (!store.name) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "stores"), {
        ...store,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      });
      router.push("/buy/stores");
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <MobileHeader
        title="เพิ่มคู่ค้าใหม่"
        userName={buyer?.lineDisplayName || buyer?.name || "ผู้ใช้งานระบบ"}
        userAvatar={buyer?.linePictureUrl}
        userRole={buyer?.role || "ผู้ใช้งานระบบ"}
        onBack={() => router.push("/buy/stores")}
      />

      <div className="px-1.5 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <PlusCircle className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-slate-900 leading-none">
            ลงทะเบียนร้านค้า
          </h2>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          Partnership Registration • ข้อมูลคู่ค้า
        </p>
      </div>

      <div className="space-y-4 px-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-5 rounded-2xl border-2 border-slate-100 bg-white space-y-5 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <Building2 className="h-3 w-3" />
              ชื่อร้านค้าหรือบริษัท
            </Label>
            <Input
              placeholder="เช่น ร้านเฮียเม้ง วัสดุก่อสร้าง"
              className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <Tag className="h-3 w-3" />
              หมวดหมู่ / ประเภทร้าน
            </Label>
            <Input
              placeholder="เช่น อุปกรณ์ไฟฟ้า, สุขภัณฑ์"
              className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
              value={store.type}
              onChange={(e) => setStore({ ...store, type: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
              <MapPin className="h-3 w-3" />
              สถานที่ตั้ง / พื้นที่ให้บริการ
            </Label>
            <textarea
              placeholder="เช่น ย่านบางพลี, หน้าปากซอย 5"
              className="min-h-[100px] w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-3.5 text-[14px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              value={store.location}
              onChange={(e) => setStore({ ...store, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
                  <Phone className="h-3 w-3" />
                  เบอร์ติดต่อ
                </Label>
                <Input
                  placeholder="08X-XXX-XXXX"
                  className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                  value={store.phone}
                  onChange={(e) => setStore({ ...store, phone: e.target.value })}
                />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-0.5">
                  <Link2 className="h-3 w-3" />
                  Google Maps URL
                </Label>
                <Input
                  placeholder="Link แผนที่"
                  className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                  value={store.mapUrl}
                  onChange={(e) => setStore({ ...store, mapUrl: e.target.value })}
                />
             </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => router.back()} 
            variant="secondary" 
            className="flex-1 h-12 rounded-xl text-sm font-black uppercase tracking-widest border-2"
          >
            ยกเลิก
          </Button>
          <Button
            disabled={loading || !store.name}
            onClick={handleCreate}
            className="flex-[1.5] h-12 rounded-xl text-sm font-black uppercase tracking-widest bg-primary text-slate-950 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>
    </div>
  );
}

