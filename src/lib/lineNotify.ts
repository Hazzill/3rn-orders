import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppSettings } from "@/types";

/**
 * Send a LINE notification to the configured group
 * Reads settings from Firestore to determine groupId and whether the event type is enabled
 */
export async function sendLineGroupNotification(
  eventType: "new_order" | "completed",
  message: any
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
 * Build a Flex Message for a new order
 */
export function buildNewOrderMessage(data: {
  requesterName: string;
  storeName: string;
  itemCount: number;
  mapUrl?: string;
  items?: { name: string; qty: number; unit: string }[];
}): any {
  const itemList = data.items
    ? data.items.map((i) => `${i.name} ${i.qty} ${i.unit}`).join("\n")
    : `${data.itemCount} รายการ`;

  const flex: any = {
    type: "flex",
    altText: `🛒 คำสั่งซื้อใหม่จาก ${data.requesterName}`,
    contents: {
      type: "bubble",
      size: "medium",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#0F172A",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: "🛒 คำสั่งซื้อใหม่!",
            weight: "bold",
            color: "#ffffff",
            size: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: data.storeName || "ไม่ระบุร้านค้า",
            weight: "bold",
            size: "xl",
            margin: "md",
            wrap: true,
          },
          {
             type: "box",
             layout: "vertical",
             margin: "lg",
             spacing: "sm",
             contents: [
                {
                   type: "box",
                   layout: "baseline",
                   spacing: "md",
                   contents: [
                      { type: "text", text: "👤 ผู้สั่ง", color: "#64748B", size: "sm", flex: 2 },
                      { type: "text", text: data.requesterName, weight: "bold", color: "#1E293B", size: "sm", flex: 5, wrap: true }
                   ]
                },
                {
                   type: "box",
                   layout: "baseline",
                   spacing: "md",
                   contents: [
                      { type: "text", text: "📦 รายการ", color: "#64748B", size: "sm", flex: 2 },
                      { type: "text", text: itemList, color: "#1E293B", size: "sm", flex: 5, wrap: true }
                   ]
                }
             ]
          }
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [] as any[]
      },
    },
  };

  if (data.mapUrl) {
    flex.contents.footer.contents.push({
      type: "button",
      style: "primary",
      height: "sm",
      color: "#2563EB",
      action: {
        type: "uri",
        label: "📍 ดูแผงผัง/แผนที่",
        uri: data.mapUrl,
      },
    });
  }

  flex.contents.footer.contents.push({
    type: "button",
    style: "link",
    height: "sm",
    color: "#475569",
    action: {
      type: "uri",
      label: "เปิดระบบจัดการ",
      uri: `${window.location.origin}/order`
    }
  });

  return flex;
}

/**
 * Build a Flex Message for a completed order
 */
export function buildCompletedOrderMessage(data: {
  storeName: string;
  itemCount: number;
  boughtCount: number;
  cancelledCount: number;
  mapUrl?: string;
  completedBy?: string;
}): any {
  const resultText = `ซื้อแล้ว ${data.boughtCount} / ${data.itemCount} รายการ`;
  
  const flex: any = {
    type: "flex",
    altText: `✅ ออร์เดอร์เสร็จสิ้น: ${data.storeName}`,
    contents: {
      type: "bubble",
      size: "medium",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#10B981",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: "✅ ออร์เดอร์เสร็จสิ้น!",
            weight: "bold",
            color: "#ffffff",
            size: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: data.storeName || "ไม่ระบุร้านค้า",
            weight: "bold",
            size: "xl",
            margin: "md",
            wrap: true,
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
               {
                  type: "box",
                  layout: "baseline",
                  spacing: "md",
                  contents: [
                     { type: "text", text: "📊 สรุป", color: "#64748B", size: "sm", flex: 2 },
                     { type: "text", text: resultText, weight: "bold", color: "#1E293B", size: "sm", flex: 5, wrap: true }
                  ]
               },
               data.cancelledCount > 0 ? {
                  type: "box",
                  layout: "baseline",
                  spacing: "md",
                  contents: [
                     { type: "text", text: "❌ ขาด/ยกเลิก", color: "#64748B", size: "sm", flex: 2 },
                     { type: "text", text: `${data.cancelledCount} รายการ`, color: "#EF4444", size: "sm", flex: 5 }
                  ]
               } : null,
               {
                  type: "box",
                  layout: "baseline",
                  spacing: "md",
                  contents: [
                     { type: "text", text: "👤 โดย", color: "#64748B", size: "sm", flex: 2 },
                     { type: "text", text: data.completedBy || "-", color: "#1E293B", size: "sm", flex: 5 }
                  ]
               }
            ].filter(Boolean) as any[]
          }
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [] as any[]
      }
    }
  };

  if (data.mapUrl) {
    flex.contents.footer.contents.push({
      type: "button",
      style: "secondary",
      height: "sm",
      action: {
        type: "uri",
        label: "📍 แผนที่ร้านค้า",
        uri: data.mapUrl,
      },
    });
  }

  return flex;
}
