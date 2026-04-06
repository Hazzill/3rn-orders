"use client";
import React, { useState } from "react";
import { Store, MapPin, MoreVertical, Phone, ShoppingCart, Plus, Loader2, Trash2, Edit2, ExternalLink, Building2, Search, CheckCircle2 } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStores } from "@/hooks/useStores";
import { useSettings } from "@/hooks/useSettings";
import { NetworkStore } from "@/types";

export default function StoresPage() {
  const { stores, loading, addStore, updateStore, deleteStore } = useStores();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<NetworkStore, "id">>({
    name: "",
    type: "",
    location: "",
    mapUrl: "",
    phone: "",
    orders: 0,
  });

  const storeStats = [
    { label: "TOTAL STORES", value: stores.length, icon: Building2, color: "text-slate-400", bg: "bg-slate-50" },
    { label: "CATAGORIES", value: settings.categories.length, icon: Store, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "TOTAL ORDERS", value: stores.reduce((a, b) => a + (b.orders || 0), 0), icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "ACTIVE", value: stores.filter(s => (s.orders || 0) > 0).length, icon: ExternalLink, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      type: settings.categories[0] || "",
      location: "",
      mapUrl: "",
      phone: "",
      orders: 0,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: NetworkStore) => {
    setFormData({
      name: store.name,
      type: store.type,
      location: store.location,
      mapUrl: store.mapUrl || "",
      phone: store.phone,
      orders: store.orders,
    });
    setCurrentId(store.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && currentId) {
        await updateStore(currentId, formData);
      } else {
        await addStore(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบข้อมูลร้านค้า?")) {
      try {
        await deleteStore(id);
      } catch (err) {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-slate-950 tracking-tight leading-none uppercase">รายชื่อร้านค้า</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Network Partner Directory</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="ค้นหาร้านค้า..."
              className="pl-11 h-12 bg-white border-2 border-slate-100 rounded-xl w-64 text-sm font-bold shadow-sm focus:border-blue-400 transition-all font-sans"
            />
          </div>
          <Button
            onClick={handleOpenAdd}
            className="h-11 px-6 rounded-xl bg-slate-950 text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> เพิ่มพาร์ทเนอร์
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {storeStats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border-2 border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 truncate">{stat.label}</div>
                <div className="text-xl font-bold text-slate-950 leading-none">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">STORE INFORMATION</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">BUSINESS TYPE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">GEOLOCATION</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">CONTACT</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">ORDER VOL.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-32 text-center opacity-30 animate-pulse font-black uppercase text-[12px] tracking-widest">FETCHING DATA...</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-40 text-center text-slate-300">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <span className="text-[12px] font-black uppercase tracking-widest">NO PARTNERS REGISTERED</span>
                </td></tr>
              ) : (
                stores.map((shop) => (
                  <tr key={shop.id} className="group hover:bg-slate-50/50 transition-all font-bold">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                             <Store className="h-5 w-5" />
                          </div>
                           <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-950 leading-tight truncate uppercase tracking-tight">{shop.name}</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {shop.id.slice(-8).toUpperCase()}</div>
                           </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex h-7 px-3 items-center rounded-lg bg-slate-50 text-xs font-bold text-slate-500 uppercase border border-slate-100">
                           {shop.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-300" />
                          <div className="flex items-center gap-1.5 overflow-hidden">
                             <span className="text-[13px] font-bold truncate max-w-[120px]">{shop.location || "—"}</span>
                             {shop.mapUrl && (
                                <a 
                                  href={shop.mapUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                  title="ดูแผนที่"
                                >
                                   <ExternalLink className="w-3 h-3" />
                                </a>
                             )}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-[13px] font-bold">{shop.phone || "—"}</span>
                       </div>
                    </td>
                     <td className="px-6 py-4 text-center">
                        <span className="text-base font-bold text-slate-950 tracking-tighter">{shop.orders || 0}</span>
                     </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 pr-6">
                       <button 
                        onClick={() => handleOpenEdit(shop)} 
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-950 hover:text-white transition-all active:scale-95"
                       >
                         <Edit2 className="w-4 w-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(shop.id)} 
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                       >
                         <Trash2 className="w-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={<span className="font-black uppercase tracking-widest text-[14px]">{isEditing ? "แก้ไขข้อมูลร้านค้า" : "ลงทะเบียนพาร์ทเนอร์ใหม่"}</span>}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">ชื่อร้านค้า (REGISTER NAME)</Label>
              <Input 
                required 
                placeholder="ระบุชื่อที่จะใช้แสดงผลในระบบ..." 
                className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">ประเภทธุรกิจ</Label>
                <Select 
                  className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">เลือกประเภท...</option>
                  {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">เบอร์โทรศัพท์ติดต่อ</Label>
                <Input 
                  placeholder="เช่น 086-XXX-XXXX" 
                  className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans"
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">ที่ตั้งร้านค้า / พื้นที่ให้บริการ</Label>
              <Input 
                placeholder="เช่น กทม., สมุทรปราการ, เขตบางนา..." 
                className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans"
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">พิกัดแผนที่ (GOOGLE MAPS URL)</Label>
              <div className="relative group">
                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500" />
                <Input 
                  placeholder="https://maps.google.com/..." 
                  className="pl-11 h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans"
                  value={formData.mapUrl} 
                  onChange={(e) => setFormData({...formData, mapUrl: e.target.value})} 
                />
              </div>
            </div>
          </div>

           <div className="flex gap-3 pt-6 border-t-2 border-slate-50 mt-4">
             <button 
               type="button" 
               className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 border-2 border-transparent" 
               onClick={() => setIsModalOpen(false)}
             >
               ยกเลิก
             </button>
             <button 
               disabled={submitting} 
               className="flex-[2] h-12 bg-slate-950 text-white text-sm font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 shadow-sm"
             >
               {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {isEditing ? "อัปเดตข้อมูล" : "ลงทะเบียนร้านค้า"}
                 </div>
               )}
             </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
