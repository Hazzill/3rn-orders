import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppSettings } from "@/types";

/**
 * Send a LINE notification to the configured group
 * Reads settings from Firestore to determine groupId and whether the event type is enabled
 */
export async function sendLineGroupNotification(
  eventType: "new_order" | "completed",
  message: string
): Promise<boolean> {
  try {
    // Fetch current settings from Firestore
    const settingsRef = doc(db, "settings", "app-config");
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      console.warn("Settings not found, skipping LINE notification");
      return false;
    }

    const settings = settingsSnap.data() as AppSettings;

    // Check if LINE notifications are enabled globally
    if (!settings.lineNotifyEnabled) {
      return false;
    }

    // Check if this specific event type is enabled
    if (eventType === "new_order" && !settings.notifyOnNewOrder) {
      return false;
    }
    if (eventType === "completed" && !settings.notifyOnCompleted) {
      return false;
    }

    // Check if group ID is configured
    const groupId = settings.lineGroupId;
    if (!groupId || groupId.trim() === "") {
      console.warn("LINE Group ID not configured, skipping notification");
      return false;
    }

    // Send via API route
    const response = await fetch("/api/line-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("LINE notification failed:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("sendLineGroupNotification error:", error);
    return false;
  }
}

/**
 * Build a notification message for a new order
 */
export function buildNewOrderMessage(data: {
  requesterName: string;
  storeName: string;
  itemCount: number;
  items?: { name: string; qty: number; unit: string }[];
}): string {
  const itemList = data.items
    ? data.items.map((i) => `  • ${i.name} ${i.qty} ${i.unit}`).join("\n")
    : "";

  return [
    `🛒 คำสั่งซื้อใหม่!`,
    ``,
    `👤 ผู้สั่ง: ${data.requesterName}`,
    `🏪 ร้าน: ${data.storeName || "ไม่ระบุ"}`,
    `📦 รายการ: ${data.itemCount} รายการ`,
    itemList ? `\n${itemList}` : "",
    ``,
    `⏳ สถานะ: รอยืนยัน`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Build a notification message for a completed order
 */
export function buildCompletedOrderMessage(data: {
  storeName: string;
  itemCount: number;
  boughtCount: number;
  cancelledCount: number;
  completedBy?: string;
}): string {
  return [
    `✅ ออร์เดอร์เสร็จสิ้น!`,
    ``,
    `🏪 ร้าน: ${data.storeName || "ไม่ระบุ"}`,
    `📦 ทั้งหมด: ${data.itemCount} รายการ`,
    `✓ ซื้อแล้ว: ${data.boughtCount} รายการ`,
    data.cancelledCount > 0
      ? `✗ ไม่มี/ยกเลิก: ${data.cancelledCount} รายการ`
      : "",
    data.completedBy ? `\n👤 จัดซื้อโดย: ${data.completedBy}` : "",
    ``,
    `🎉 สถานะ: เสร็จสมบูรณ์`,
  ]
    .filter(Boolean)
    .join("\n");
}
