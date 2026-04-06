"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Plus,
  Trash2,
  User,
  Store,
  Edit3,
  XCircle,
  FileText,
  Activity,
  History
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { useStaff } from "@/hooks/useStaff";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Order, Item } from "@/types";

const STATUS_CHIPS: Record<string, { label: string; class: string }> = {
  pending: { label: "รอยืนยัน", class: "border-amber-100 bg-amber-50 text-amber-600" },
  buying: { label: "กำลังซื้อ", class: "border-blue-100 bg-blue-50 text-blue-600" },
  sorting: { label: "ตรวจสอบ", class: "border-purple-100 bg-purple-50 text-purple-600" },
  completed: { label: "สำเร็จแล้ว", class: "border-emerald-100 bg-emerald-50 text-emerald-600" },
  cancelled: { label: "ยกเลิก", class: "border-red-100 bg-red-50 text-red-600" },
};

export default function OrdersPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, loading, createOrder, updateOrder } = useOrders();
  const { staff } = useStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Order>>({
    requesterId: "",
    requesterName: "",
    storeName: "",
    items: [],
    status: "pending",
    note: "",
  });

  const [managingOrder, setManagingOrder] = useState<Order | null>(null);
  const [managedItems, setManagedItems] = useState<Item[]>([]);
  const [manageNote, setManageNote] = useState("");

  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: "",
    qty: 1,
    unit: "ชิ้น",
  });

  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0) {
      setNewItem(prev => ({ ...prev, unit: prev.unit || settings.units[0] }));
    }
  }, [settingsLoading, settings.units]);

  const stats = [
    { label: "ALL ORDERS", value: orders.length, icon: Package, color: "text-slate-400", bg: "bg-slate-50", sub: "รายการทั้งหมด" },
    { label: "PENDING", value: orders.filter((o) => o.status === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50", sub: "รอรับเรื่อง" },
    { label: "PROCESSING", value: orders.filter((o) => o.status === "buying").length, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50", sub: "กำลังจัดซื้อ" },
    { label: "ARCHIVED", value: orders.filter((o) => o.status === "completed").length, icon: History, color: "text-emerald-500", bg: "bg-emerald-50", sub: "เสร็จสิ้น" },
  ];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ requesterId: "", requesterName: "", storeName: "", items: [], status: "pending", note: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setIsEditing(true);
    setFormData(order);
    setIsModalOpen(true);
  };

  const handleOpenManage = (order: Order) => {
    setManagingOrder(order);
    setManagedItems([...order.items]);
    setManageNote(order.note || "");
    setIsManageModalOpen(true);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.qty) {
      const item: Item = {
        id: `item_${Date.now()}`,
        name: newItem.name as string,
        qty: Number(newItem.qty),
        unit: newItem.unit || settings.units[0] || "ชิ้น",
        status: "to_buy",
      };
      setFormData({ ...formData, items: [...(formData.items || []), item] });
      setNewItem({ name: "", qty: 1, unit: settings.units[0] || "ชิ้น" });
    }
  };

  const handleRemoveItem = (id: string) => {
    setFormData({ ...formData, items: (formData.items || []).filter((i) => i.id !== id) });
  };

  const updateManagedItemStatus = (itemId: string, status: Item["status"]) => {
    setManagedItems(prev => prev.map(item => item.id === itemId ? { ...item, status } : item));
  };

  const saveManagedItems = async () => {
    if (!managingOrder) return;
    setSubmitting(true);
    try {
      const allDone = managedItems.length > 0 && managedItems.every(i => i.status !== "to_buy");
      let newStatus = allDone ? "completed" : "buying";
      await updateOrder(managingOrder.id, { items: managedItems, note: manageNote, status: newStatus as Order["status"] });
      setIsManageModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requesterId || (formData.items || []).length === 0) {
      alert("กรุณาระบุผู้สั่งซื้อและเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && formData.id) await updateOrder(formData.id, formData);
      else await createOrder(formData);
      setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  if (settingsLoading) {
    return <div className="flex flex-col items-center justify-center py-40 animate-pulse text-slate-300">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <span className="text-sm font-black  tracking-widest">กำลังดึงข้อมูลมาให้ช้าๆ...</span>
    </div>;
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1">
          <h1 className="text-xl  text-slate-950 tracking-tight leading-none ">จัดการออร์เดอร์</h1>
          <p className="text-sm  text-slate-500  tracking-[0.2em] leading-none">Global Procurement Control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900" />
            <Input
              placeholder="ค้นหาบิลสั่งซื้อ..."
              className="pl-11 h-11 bg-white border-2 border-slate-100 rounded-xl w-64 text-sm font-black shadow-sm outline-none font-sans"
            />
          </div>
          <Button
            onClick={handleOpenAdd}
            className="h-11 px-6 rounded-xl bg-slate-950 text-white   text-sm tracking-widest flex items-center gap-2 active:bg-slate-800 shadow-lg"
          >
            <Plus className="w-4 h-4" /> สร้างบิล
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border-2 border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm  text-slate-500  tracking-widest leading-none mb-1 truncate">{stat.label}</div>
                <div className="text-lg  text-slate-900 leading-none">{stat.value}</div>
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
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">BILL ID</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">REQUESTER</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">PARTNER STORE</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">BUYER</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100 text-center">ITEMS</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100">STATUS</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100 text-right">DATE/TIME</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-[0.1em] border-b border-slate-100 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-8 py-32 text-center opacity-30 animate-pulse font-bold text-sm tracking-widest text-slate-400 uppercase">Syncing Cloud Database...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-8 py-40 text-center text-slate-300">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <span className="text-xs font-bold tracking-widest uppercase">No Active Orders found</span>
                </td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4 text-[11px] font-mono font-medium text-slate-400 group-hover:text-slate-900 transition-colors">#{order.id.slice(-6)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                          {order.requesterName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-950 leading-tight">{order.requesterName}</span>
                          <span className="text-[10px] font-medium text-slate-400 tracking-tight">พนักงานสั่ง</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-950 leading-tight">{order.storeName || "ทั่วไป"}</span>
                        <span className="text-[10px] font-medium text-slate-400 tracking-tight">ร้านค้าคู่ค้า</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.buyerId || order.buyerName ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600">
                             {order.buyerName?.substring(0, 2).toUpperCase() || 
                              staff.find(s => s.id === order.buyerId)?.name.substring(0, 2).toUpperCase() || "??"}
                          </div>
                          <span className="text-[12px] font-medium text-slate-600">
                            {order.buyerName || staff.find(s => s.id === order.buyerId)?.name || "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-300 border border-slate-100">
                          ยังไม่มีผู้ซื้อ
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-6 px-2.5 items-center rounded-lg bg-slate-50 text-[11px] font-bold text-slate-500 border border-slate-100">
                        {order.items.length} รายการ
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleOpenManage(order)}
                        className={cn(
                          "inline-flex items-center rounded-lg px-2.5 py-1 border text-[11px] font-bold tracking-tight shadow-sm transition-all hover:scale-105 active:scale-95",
                          STATUS_CHIPS[order.status]?.class || "bg-slate-50 text-slate-400 border-slate-200"
                        )}
                      >
                        {STATUS_CHIPS[order.status]?.label}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-medium text-slate-950 leading-none">
                            {order.createdAt ? format(order.createdAt.toDate(), "HH:mm", { locale: th }) : "—"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                          {order.createdAt ? format(order.createdAt.toDate(), "dd MMM yy", { locale: th }) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenManage(order)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-slate-950 shadow-sm shadow-primary/10 hover:bg-[#b0f53d]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-950 hover:text-white"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Order Modal (Add/Edit) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={<span className="font-black  tracking-widest text-[14px]">{isEditing ? "แก้ไขบิลสั่งซื้อ" : "สร้างบิลสั่งซื้อใหม่"}</span>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-sm   tracking-widest text-slate-500">พนักงานผู้สั่งซื้อ (Requester)</Label>
              <Select required value={formData.requesterId} className="h-11 border-2 border-slate-100 rounded-xl text-sm  text-slate-900" onChange={(e) => {
                const s = staff.find(st => st.id === e.target.value);
                setFormData({ ...formData, requesterId: e.target.value, requesterName: s?.name || "" });
              }}>
                <option value="">เลือกพนักงาน...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm   tracking-widest text-slate-500">ชื่อร้านค้าคู่ค้า (Partner Store)</Label>
              <Input placeholder="ระบุชื่อร้านค้า..." className="h-11 border-2 border-slate-100 rounded-xl text-sm  text-slate-900" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
            </div>

            <div className="pt-6 mt-6 border-t-2 border-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black  tracking-[0.2em] text-slate-400">รายการสินค้า • ITEMS</Label>
                <span className="text-sm font-black text-slate-300">{(formData.items || []).length} SELECTED</span>
              </div>

              <div className="flex gap-2">
                <Input placeholder="ชื่อสินค้า..." className="flex-[2] h-11 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-sm " value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                <Input type="number" placeholder="Qty" className="flex-1 h-11 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-sm " value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
                <Select className="flex-1 h-11 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-sm " value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                  {settings.units.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
                <button type="button" onClick={handleAddItem} className="bg-slate-950 w-11 h-11 flex items-center justify-center rounded-xl text-primary transition-all active:scale-95 shadow-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex flex-col pt-2 custom-scrollbar">
                {(formData.items || []).length === 0 && <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-100 text-sm font-black text-slate-300  tracking-widest">No Items Added</div>}
                {(formData.items || []).map((item: Item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl border-2 border-slate-50 group hover:border-slate-100 transition-all bg-white shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm  text-slate-950 leading-tight">{item.name}</span>
                      <span className="text-sm font-semibold text-slate-500  tracking-widest mt-1">{item.qty} {item.unit}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-200 hover:bg-red-50 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t-2 border-slate-50">
            <button type="button" className="flex-1 h-14 rounded-xl text-[12px] font-black  tracking-widest text-slate-400 hover:bg-slate-50 transition-all border-2 border-transparent" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
            <button disabled={submitting} className="flex-[2] h-14 bg-slate-950 text-white text-sm font-black  tracking-[0.1em] rounded-xl flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 text-primary" /> {isEditing ? "อัปเดตบิล" : "สร้างออร์เดอร์ใหม่"}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item Management Modal (Fulfillment) */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title={<span className="font-black  tracking-widest text-[14px]">ยืนยันการจัดซื้อสินค้า</span>}
      >
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 border-b-2 border-slate-50 pb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary text-slate-950 flex items-center justify-center shadow-lg shadow-primary/10">
              <Store className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="text-lg  text-slate-950 leading-tight truncate  tracking-tight">{managingOrder?.storeName || "—"}</div>
              <div className="text-sm  text-slate-500  tracking-widest flex items-center gap-1.5 mt-1.5">
                <User className="h-3.5 w-3.5" />
                Requester: {managingOrder?.requesterName}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm   text-slate-300 tracking-widest mb-1 px-1">Checklist • รายการสินค้า</div>
            {managedItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/30 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base  text-slate-900 leading-tight flex-1">{item.name}</span>
                  <span className="text-sm  text-slate-400  shrink-0">{item.qty} {item.unit}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "bought")}
                    className={cn(
                      "h-11 rounded-xl px-2 text-sm   tracking-tight transition-all border-2",
                      item.status === "bought" ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-white border-slate-100 text-slate-500 active:bg-slate-50"
                    )}
                  >
                    เรียบร้อย
                  </button>
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "to_buy")}
                    className={cn(
                      "h-10 rounded-xl px-2 text-sm font-black  tracking-tight transition-all border-2",
                      item.status === "to_buy" ? "bg-slate-200 border-slate-200 text-slate-700 shadow-md" : "bg-white border-slate-100 text-slate-200"
                    )}
                  >
                    รอดำเนินการ
                  </button>
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "cancelled")}
                    className={cn(
                      "h-10 rounded-xl px-2 text-sm font-black  tracking-tight transition-all border-2",
                      item.status === "cancelled" ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20" : "bg-white border-slate-100 text-slate-200"
                    )}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t-2 border-slate-50">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <Label className="text-sm   tracking-widest text-slate-500">บันทึกเพิ่มเติม (Note)</Label>
              {manageNote && <span className="text-sm  text-primary">EDITING</span>}
            </div>
            <textarea
              value={manageNote}
              onChange={(e) => setManageNote(e.target.value)}
              placeholder="ระบุรายละเอียดสำคัญ..."
              className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm  text-slate-900 focus:bg-white focus:border-blue-400 transition-all outline-none resize-none"
            />
          </div>

          <button
            onClick={saveManagedItems}
            disabled={submitting}
            className="w-full h-14 bg-slate-950 text-white text-[14px] font-black  tracking-[0.1em] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl border-b-4 border-primary/20"
          >
            {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Activity className="h-5 w-5 text-primary" /> ยืนยันรายการ</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
