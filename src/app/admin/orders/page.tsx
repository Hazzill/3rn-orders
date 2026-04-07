"use client";
import React, { useState, useEffect } from "react";
import {
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatusChip,
  AdminStatCard,
  AdminStatGrid,
} from "@/components/admin/AdminUI";
import {
  Search,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  ShoppingBag,
  Plus,
  Trash2,
  User,
  Store,
  Edit3,
  Activity,
  History
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { useStaff } from "@/hooks/useStaff";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Order, Item } from "@/types";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", tone: "amber" as const },
  buying: { label: "กำลังซื้อ", tone: "blue" as const },
  sorting: { label: "ตรวจสอบ", tone: "purple" as const },
  completed: { label: "สำเร็จแล้ว", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
};

export default function OrdersPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, loading, createOrder, updateOrder, deleteOrder } = useOrders();
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

  const handleDeleteOrder = async (id: string, requesterName: string) => {
    if (!confirm(`คุณต้องการลบออร์เดอร์ของ ${requesterName} ใช่หรือไม่?`)) return;
    try {
      await deleteOrder(id);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบออร์เดอร์");
    }
  };

  if (settingsLoading) {
    return <div className="flex flex-col items-center justify-center py-40 animate-pulse text-slate-300">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <span className="text-sm">กำลังดึงข้อมูลมาให้ช้าๆ...</span>
    </div>;
  }

  return (
    <>
      <AdminPage>
        <AdminHeader
          title="จัดการออร์เดอร์"
          subtitle="ศูนย์กลางควบคุมและติดตามรายการสั่งซื้อสินค้าพัสดุพาร์ทเนอร์"
          actions={
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="ค้นหาบิลสั่งซื้อ..."
                  className="pl-11 h-11 bg-white border border-slate-200 rounded-xl w-64 text-sm  focus:border-blue-400 transition-all font-sans"
                />
              </div>
              <AdminPrimaryButton onClick={handleOpenAdd} icon={Plus}>
                สร้างบิลใหม่
              </AdminPrimaryButton>
            </div>
          }
        />

        <AdminStatGrid>
          <AdminStatCard
            label="รายการรวม"
            value={orders.length}
            detail="ออร์เดอร์รวมที่บันทึกในระบบ"
            icon={Package}
            tone="slate"
          />
          <AdminStatCard
            label="รอยืนยัน"
            value={orders.filter((o) => o.status === "pending").length}
            detail="คำขอซื้อที่ยังไม่ตอบรับ"
            icon={Clock}
            tone="amber"
          />
          <AdminStatCard
            label="กำลังดำเนินการ"
            value={orders.filter((o) => o.status === "buying").length}
            detail="คำสั่งที่อยู่ระหว่างจัดหา"
            icon={ShoppingCart}
            tone="blue"
          />
          <AdminStatCard
            label="เสร็จสิ้นแล้ว"
            value={orders.filter((o) => o.status === "completed").length}
            detail="รายการที่ปิดงานสมบูรณ์"
            icon={History}
            tone="emerald"
          />
        </AdminStatGrid>

        <AdminPanel title="รายการออร์เดอร์" subtitle="สถานะการจัดหาพัสดุและวันเวลาที่ดำเนินการล่าสุด">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>เลขที่บิล</th>
                  <th>ผู้สั่งซื้อ</th>
                  <th>ร้านคู่ค้า</th>
                  <th>ผู้จัดซื้อ</th>
                  <th className="text-center">รายการ</th>
                  <th>สถานะ</th>
                  <th className="text-right">วันเวลา</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm ">กำลังโหลดรายการออร์เดอร์</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <AdminEmptyState
                        icon={ShoppingBag}
                        title="ยังไม่มีรายการสั่งซื้อ"
                        description="เมื่อมีการสร้างบิลใหม่ รายการจะแสดงขึ้นที่ตารางนี้"
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td>
                          <span className="font-mono text-xs text-slate-700 font-bold">#{order.id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                              {order.requesterName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm  text-slate-900 leading-tight">{order.requesterName}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm  text-slate-900 leading-tight">{order.storeName || "ทั่วไป"}</span>
                          </div>
                        </td>
                        <td>
                          {order.buyerId || order.buyerName ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600 overflow-hidden">
                                {order.buyerName?.substring(0, 2).toUpperCase() || "??"}
                              </div>
                              <span className="text-xs font-bold text-slate-600">
                                {order.buyerName || "—"}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-sm  bg-slate-100 text-slate-600 uppercase tracking-tighter">
                              ไม่มีผู้ซื้อ
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {order.items.length} รายการ
                          </span>
                        </td>
                        <td>
                          <AdminStatusChip label={status.label} tone={status.tone} />
                        </td>
                        <td className="text-right">
                          <div className="space-y-1">
                            <div className="text-sm  text-slate-900">
                              {order.createdAt ? format(order.createdAt.toDate(), "HH:mm", { locale: th }) : "—"}
                            </div>
                            <div className="text-sm  text-slate-500 upperca">
                              {order.createdAt ? format(order.createdAt.toDate(), "dd MMM yy", { locale: th }) : "—"}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <AdminSecondaryButton
                              onClick={() => handleOpenManage(order)}
                              icon={Edit3}
                              className="h-8 w-8 p-0"
                            />
                            <AdminSecondaryButton
                              onClick={() => handleOpenEdit(order)}
                              icon={ChevronRight}
                              className="h-8 w-8 p-0"
                            />
                            <AdminSecondaryButton
                              onClick={() => handleDeleteOrder(order.id, order.requesterName || "")}
                              icon={Trash2}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border-red-100"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </AdminPage>

      {/* Main Order Modal (Add/Edit) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "แก้ไขบิลสั่งซื้อ" : "สร้างบิลสั่งซื้อใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-tight">พนักงานผู้สั่งซื้อ</Label>
              <Select required value={formData.requesterId} className="h-10 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-900" onChange={(e) => {
                const s = staff.find(st => st.id === e.target.value);
                setFormData({ ...formData, requesterId: e.target.value, requesterName: s?.name || "" });
              }}>
                <option value="">เลือกพนักงาน...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-tight">ชื่อร้านค้าคู่ค้า</Label>
              <Input placeholder="ระบุชื่อร้านค้า..." className="h-10 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-900" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
            </div>

            <div className="pt-4 mt-4 border-t-2 border-slate-100 space-y-3">
              <div className="flex items-center justify-between px-0.5">
                <Label className="text-sm font-bla text-slate-900 uppercase">รายการสินค้า • ITEMS</Label>
                <span className="text-sm  text-blue-600">{(formData.items || []).length} SELECTED</span>
              </div>

              <div className="flex gap-1.5">
                <Input placeholder="ชื่อสินค้า..." className="flex-[2] h-10 bg-white border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-900" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                <Input type="number" placeholder="Qty" className="flex-[0.5] h-10 bg-white border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-900 text-center" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
                <Select className="flex-1 h-10 bg-white border-2 border-slate-200 rounded-lg text-xs font-bold text-slate-900" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                  {settings.units.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
                <AdminPrimaryButton type="button" onClick={handleAddItem} icon={Plus} className="w-10 h-10 p-0 shrink-0" />
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 flex flex-col pt-1 custom-scrollbar">
                {(formData.items || []).length === 0 && <div className="text-center py-6 rounded-xl border-2 border-dashed border-slate-200 text-xs  text-slate-400 upperca">เพิ่มสินค้าอย่างน้อย 1 รายการ</div>}
                {(formData.items || []).map((item: Item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg border-2 border-slate-100 group transition-all bg-white hover:border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-sm  text-slate-900 leading-tight">{item.name}</span>
                      <span className="text-sm  text-slate-600 uppercase tracking-wider mt-0.5">{item.qty} {item.unit}</span>
                    </div>
                    <AdminSecondaryButton onClick={() => handleRemoveItem(item.id)} icon={Trash2} className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t-2 border-slate-100">
            <AdminSecondaryButton className="flex-1 font-bold h-10 text-xs text-slate-700" onClick={() => setIsModalOpen(false)}>ยกเลิก</AdminSecondaryButton>
            <AdminPrimaryButton submitting={submitting} icon={CheckCircle2} className="flex-[2]  h-10 text-xs">
              {isEditing ? "อัปเดตบิล" : "สร้างออร์เดอร์"}
            </AdminPrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Item Management Modal (Fulfillment) */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="จัดการสถานะสินค้า"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm  text-slate-900 leading-tight truncate">{managingOrder?.storeName || "ทั่วไป"}</div>
              <div className="text-sm  text-slate-600 flex items-center gap-1.5 mt-0.5">
                <User className="h-3 w-3" />
                ผู้ขอ: {managingOrder?.requesterName}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm  text-slate-9 uppercase px-1">Checklist • รายการสินค้า</div>
            {managedItems.map((item) => (
              <div key={item.id} className="p-3 rounded-xl border-2 border-slate-100 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-4 px-1">
                  <span className="text-sm font-bold text-slate-900 flex-1">{item.name}</span>
                  <span className="text-xs  text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">{item.qty} {item.unit}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "bought")}
                    className={cn(
                      "h-9 rounded-lg px-2 text-sm  uppercase tracking-tighter transition-all border-2",
                      item.status === "bought" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    เรียบร้อย
                  </button>
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "to_buy")}
                    className={cn(
                      "h-9 rounded-lg px-2 text-sm  uppercase tracking-tighter transition-all border-2",
                      item.status === "to_buy" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    รอซื้อ
                  </button>
                  <button
                    onClick={() => updateManagedItemStatus(item.id!, "cancelled")}
                    className={cn(
                      "h-9 rounded-lg px-2 text-sm  uppercase tracking-tighter transition-all border-2",
                      item.status === "cancelled" ? "bg-red-600 border-red-600 text-white" : "bg-white border-slate-100 text-slate-400"
                    )}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-3 border-t-2 border-slate-100">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm font-bla text-slate-900 uppercase">บันทึกเพิ่มเติม</Label>
              {manageNote && <span className="text-[9px]  text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Modified</span>}
            </div>
            <textarea
              value={manageNote}
              onChange={(e) => setManageNote(e.target.value)}
              placeholder="ระบุรายละเอียดสำคัญ..."
              className="w-full h-20 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none placeholder:text-slate-300"
            />
          </div>

          <AdminPrimaryButton
            onClick={saveManagedItems}
            submitting={submitting}
            icon={Activity}
            className="w-full h-11  text-sm"
          >
            บันทึกสถานะจัดซื้อ
          </AdminPrimaryButton>
        </div>
      </Modal>
    </>
  );
}
