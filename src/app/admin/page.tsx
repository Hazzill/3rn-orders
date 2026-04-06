"use client";

import { Activity, Clock, Loader2, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useOrders } from "@/hooks/useOrders";
import {
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminSecondaryButton,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const statusMap = {
  pending: { label: "รอดำเนินการ", tone: "amber" as const },
  buying: { label: "กำลังจัดซื้อ", tone: "blue" as const },
  completed: { label: "เสร็จสิ้น", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
  sorting: { label: "ตรวจสอบ", tone: "slate" as const },
};

export default function AdminDashboard() {
  const { orders, loading } = useOrders();

  return (
    <AdminPage>
      <AdminHeader
        title="ภาพรวมระบบ"
        subtitle="สรุปสถานะงานจัดซื้อและรายการล่าสุดของวันนี้"
      />

      <AdminStatGrid>
        <AdminStatCard
          label="รอดำเนินการ"
          value={orders.filter((order) => order.status === "pending").length}
          detail="คำขอที่ยังไม่เริ่มดำเนินการ"
          icon={Clock}
          tone="amber"
        />
        <AdminStatCard
          label="กำลังจัดซื้อ"
          value={orders.filter((order) => order.status === "buying").length}
          detail="รายการที่อยู่ระหว่างติดตาม"
          icon={ShoppingCart}
          tone="blue"
        />
        <AdminStatCard
          label="เสร็จสิ้น"
          value={orders.filter((order) => order.status === "completed").length}
          detail="รายการที่ปิดงานแล้ว"
          icon={Activity}
          tone="emerald"
        />
        <AdminStatCard
          label="ยกเลิก"
          value={orders.filter((order) => order.status === "cancelled").length}
          detail="รายการที่ถูกยกเลิก"
          icon={Activity}
          tone="red"
        />
      </AdminStatGrid>

      <AdminPanel
        title="รายการล่าสุด"
        subtitle="แสดง 10 รายการล่าสุดจากระบบ"
        action={
          <AdminSecondaryButton onClick={() => (window.location.href = "/admin/orders")}>
            ดูทั้งหมด
          </AdminSecondaryButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ผู้ขอซื้อ</th>
                <th>ร้านค้า</th>
                <th>รายละเอียด</th>
                <th>สถานะ</th>
                <th className="text-right">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">กำลังโหลดข้อมูล</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <AdminEmptyState
                      icon={ShoppingCart}
                      title="ยังไม่มีรายการสั่งซื้อ"
                      description="เมื่อมีการสร้างออร์เดอร์ใหม่ รายการล่าสุดจะแสดงที่หน้านี้"
                    />
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order) => {
                  const status = statusMap[order.status as keyof typeof statusMap] ?? statusMap.pending;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td>
                        <span className="font-mono text-sm text-slate-700">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900">{order.requesterName}</div>
                          <div className="text-xs text-slate-500">ผู้ขอซื้อ</div>
                        </div>
                      </td>
                      <td className="text-slate-700">{order.storeName || "-"}</td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-sm text-slate-700">{order.items.length} รายการ</div>
                          <div className="max-w-[240px] truncate text-xs text-slate-500">
                            {order.items.map((item) => item.name).join(", ")}
                          </div>
                        </div>
                      </td>
                      <td>
                        <AdminStatusChip label={status.label} tone={status.tone} />
                      </td>
                      <td className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm text-slate-900">
                            {order.createdAt ? format(order.createdAt.toDate(), "HH:mm", { locale: th }) : "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {order.createdAt ? format(order.createdAt.toDate(), "dd MMM yy", { locale: th }) : "-"}
                          </div>
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
  );
}
