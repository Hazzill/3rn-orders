"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { StaffMember } from "@/hooks/useStaff";
import { useRouter, usePathname } from "next/navigation";

interface BuyerContextType {
  buyer: StaffMember | null;
  login: (username: string, staffList: StaffMember[]) => boolean;
  loginWithStaff: (staff: StaffMember) => void;
  logout: () => void;
  loading: boolean;
}

const BuyerContext = createContext<BuyerContextType>({
  buyer: null,
  login: () => false,
  loginWithStaff: () => {},
  logout: () => {},
  loading: true,
});

export function BuyerProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedBuyer = localStorage.getItem("powertech_buyer");
    if (savedBuyer) {
      setBuyer(JSON.parse(savedBuyer));
    }
    setLoading(false);
  }, []);

  const login = (username: string, staffList: StaffMember[]) => {
    const found = staffList.find(s => s.username === username || s.name === username);
    if (found) {
      setBuyer(found);
      localStorage.setItem("powertech_buyer", JSON.stringify(found));
      return true;
    }
    return false;
  };

  /** Direct login with a resolved StaffMember (used by LINE auth flow) */
  const loginWithStaff = (staff: StaffMember) => {
    setBuyer(staff);
    localStorage.setItem("powertech_buyer", JSON.stringify(staff));
  };

  const logout = () => {
    setBuyer(null);
    localStorage.removeItem("powertech_buyer");
    if (pathname.startsWith("/order")) {
      router.push("/order/login");
      return;
    }
    router.push("/buy/login");
  };

  // Auth Protection - Redirect to login if not in login page and not authenticated
  useEffect(() => {
    const isLoginPage = pathname === "/buy/login" || pathname === "/order/login";
    const isProtectedPath = pathname.startsWith("/buy") || pathname.startsWith("/order");
    
    if (!loading && !buyer && !isLoginPage && isProtectedPath) {
      if (pathname.startsWith("/order")) {
        router.push("/order/login");
      } else {
        router.push("/buy/login");
      }
    }
  }, [buyer, loading, pathname, router]);

  return (
    <BuyerContext.Provider value={{ buyer, login, loginWithStaff, logout, loading }}>
      {children}
    </BuyerContext.Provider>
  );
}

export const useBuyerAuth = () => useContext(BuyerContext);
