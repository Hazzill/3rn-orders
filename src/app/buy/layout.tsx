import React from "react";
import { OrderProvider } from "@/context/OrderContext";

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <div className="buy-ui min-h-screen bg-transparent px-4 pb-12 pt-4">
        {children}
      </div>
    </OrderProvider>
  );
}
