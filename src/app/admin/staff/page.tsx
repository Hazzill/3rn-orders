"use client";
import { useState } from "react";
import Image from "next/image";
import { Users, MoreVertical, Loader2, Phone, ShieldCheck, Mail, Smartphone, UserPlus, Link2, Unlink, Search, CheckCircle2, Shield, Edit3 } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStaff, StaffMember } from "@/hooks/useStaff";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function StaffPage() {
  const { staff, loading } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: "",
    username: "",
    phone: "",
    role: "ผู้สั่งซื้อ",
    status: "active"
  });

  const staffStats = [
    { label: "TOTAL STAFF", value: staff.length, icon: Users, color: "text-slate-400", bg: "bg-slate-50" },
    { label: "ADMINISTRATORS", value: staff.filter(s => s.role === 'Admin').length, icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "ACTIVE USERS", value: staff.filter(s => s.status === 'active').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "LINE CONNECTED", value: staff.filter(s => s.lineUserId).length, icon: Link2, color: "text-[#06C755]", bg: "bg-[#06C755]/5" },
  ];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", username: "", phone: "", role: "ผู้สั่งซื้อ", status: "active" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setIsEditing(true);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleUnlinkLine = async (member: StaffMember) => {
    if (!confirm(`ยกเลิกการเชื่อมต่อ LINE ของ ${member.name} ?`)) return;
    try {
      await updateDoc(doc(db, "users", member.id), {
        lineUserId: null,
        linePictureUrl: null,
        lineDisplayName: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Unlink LINE error:", err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "users", formData.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const newId = `user_${Date.now()}`;
        await setDoc(doc(db, "users", newId), {
          ...formData,
          id: newId,
          deals: 0,
          createdAt: serverTimestamp(),
          status: "active"
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      alert(`Error saving staff member.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-slate-950 tracking-tight leading-none uppercase">บัญชีพนักงาน</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Internal Resource Directory</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="ค้นหาพนักงาน..."
              className="pl-11 h-12 bg-white border-2 border-slate-100 rounded-xl w-64 text-sm font-bold shadow-sm focus:border-blue-400 transition-all font-sans"
            />
          </div>
          <Button
            onClick={handleOpenAdd}
            className="h-11 px-6 rounded-xl bg-slate-950 text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> เพิ่มพนักงาน
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {staffStats.map((stat, i) => (
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">MEMBER IDENTITY</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">PERMISSION / ROLE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">STATUS</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">MOBILE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">LINE LINK</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-32 text-center opacity-30 animate-pulse font-black uppercase text-[12px] tracking-widest">CONNECTING TO DATABASE...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-40 text-center text-slate-300">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <span className="text-[12px] font-black uppercase tracking-widest">NO STAFF MEMBERS FOUND</span>
                </td></tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="group hover:bg-slate-50/50 transition-all font-bold">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shrink-0 group-hover:border-primary transition-all">
                             {member.linePictureUrl ? (
                               <Image src={member.linePictureUrl} alt={member.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                             ) : (
                               <Users className="h-5 w-5" />
                             )}
                          </div>
                          <div className="min-w-0">
                             <div className="text-sm font-bold text-slate-950 leading-tight truncate uppercase tracking-tight">{member.name}</div>
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">@{member.username || member.id.slice(-6).toUpperCase()}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className={cn("h-4 w-4", member.role === 'Admin' ? "text-primary" : "text-slate-300")} />
                           <span className="text-sm font-bold text-slate-700 uppercase">{member.role}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={cn("h-1.5 w-1.5 rounded-full", member.status === 'active' ? "bg-emerald-500" : "bg-slate-300")} />
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{member.status}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px] text-slate-400">
                       {member.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                       {member.lineUserId ? (
                          <div className="flex flex-col gap-1 items-start group/line">
                             <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#06C755]/10 text-[#06C755] text-[9px] font-black uppercase tracking-widest">
                                <Link2 className="h-3 w-3" /> CONNECTED
                             </span>
                             <button
                               onClick={() => handleUnlinkLine(member)}
                               className="text-[9px] font-black text-red-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                             >
                               UNLINK ACCOUNT ?
                             </button>
                          </div>
                       ) : (
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter italic">No Link</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                       <button 
                        onClick={() => handleOpenEdit(member)} 
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-950 hover:text-white transition-all active:scale-95"
                       >
                         <Edit3 className="w-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={<span className="font-black uppercase tracking-widest text-[14px]">{isEditing ? "แก้ไขข้อมูลพนักงาน" : "ลงทะเบียนพนักงานใหม่"}</span>}>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">ชื่อ-นามสกุล (FULL NAME)</Label>
              <Input required placeholder="ระบุชื่อจริงภาษาไทย..." className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">ชื่อผู้ใช้งาน (LOGIN ID)</Label>
                <Input required placeholder="somchai_p" className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">เบอร์โทรศัพท์ (MOBILE)</Label>
                <Input placeholder="08X-XXX-XXXX" className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900 font-sans" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">บทบาทและความรับผิดชอบ</Label>
              <Select className="h-12 border-2 border-slate-100 rounded-xl text-[14px] font-bold text-slate-900" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} >
                <option value="ผู้สั่งซื้อ">📁 ผู้สั่งซื้อ (Orderer)</option>
                <option value="พนักงานจัดซื้อ">🛒 พนักงานจัดซื้อ (Buyer)</option>
                <option value="Admin">⚡ ผู้ดูแลระบบ (Admin)</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t-2 border-slate-50 mt-4">
            <button type="button" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 border-2 border-transparent" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
            <button disabled={submitting} className="flex-[2] h-12 bg-slate-950 text-white text-sm font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 shadow-sm">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 text-primary" /> {isEditing ? "บันทึกแก้ไข" : "ยืนยันลงทะเบียน"}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
