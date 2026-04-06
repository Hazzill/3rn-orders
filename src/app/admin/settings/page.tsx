"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Briefcase, 
  Box, 
  Tag, 
  BellRing,
  Loader2,
  MessageSquare,
  Send,
  ShoppingCart,
  PackageCheck,
  ShieldAlert,
  Server,
  Globe
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  
  const [newCat, setNewCat] = useState("");
  const [newUnit, setNewUnit] = useState("");

  useEffect(() => {
    if (!loading) {
      setLocalSettings(settings);
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: 'categories' | 'units', value: string, setValue: Function) => {
    if (value && !localSettings[field].includes(value)) {
      setLocalSettings({
        ...localSettings,
        [field]: [...localSettings[field], value]
      });
      setValue("");
    }
  };

  const removeItem = (field: 'categories' | 'units', value: string) => {
    setLocalSettings({
      ...localSettings,
      [field]: localSettings[field].filter(item => item !== value)
    });
  };

  const toggleOption = (field: 'lineNotifyEnabled' | 'orderFilteringEnabled' | 'notifyOnNewOrder' | 'notifyOnCompleted') => {
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field]
    });
  };

  const handleTestNotification = async () => {
    if (!localSettings.lineGroupId?.trim()) {
      setTestResult({ ok: false, msg: "กรุณาระบุ LINE Group ID ก่อน" });
      return;
    }

    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/line-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: localSettings.lineGroupId.trim(),
          message: `🔔 ทดสอบการแจ้งเตือน\n\nระบบ: ${localSettings.systemName}\nบริษัท: ${localSettings.companyName}\n\n✅ การเชื่อมต่อ LINE สำเร็จ!`,
        }),
      });

      if (res.ok) {
        setTestResult({ ok: true, msg: "ส่งข้อความทดสอบสำเร็จ!" });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({ ok: false, msg: data.error || "ส่งข้อความไม่สำเร็จ" });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse text-slate-300">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <span className="text-[11px] font-black uppercase tracking-widest">LOADING SYSTEM CONFIG...</span>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1.5">
           <h1 className="text-[32px] font-black text-slate-950 tracking-tight leading-none uppercase">ตั้งค่าระบบ</h1>
           <p className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Core System Parameters</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-xl bg-slate-950 text-white font-black uppercase text-[12px] tracking-widest flex items-center gap-3 hover:bg-primary hover:text-slate-950 transition-all shadow-lg active:scale-95"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-primary" />}
          บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <h4 className="text-[13px] font-black uppercase text-slate-900 tracking-tight leading-none">เอกลักษณ์องค์กร</h4>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Identity Settings</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ชื่อระบบ (SYSTEM ID)</Label>
                <Input 
                  value={localSettings.systemName} 
                  onChange={(e) => setLocalSettings({...localSettings, systemName: e.target.value})}
                  className="h-12 border-2 border-slate-50 bg-slate-50/30 rounded-xl text-[14px] font-black text-slate-900 focus:bg-white focus:border-blue-400 transition-all font-sans"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ชื่อนิติบุคคล / บริษัท</Label>
                <Input 
                  value={localSettings.companyName} 
                  onChange={(e) => setLocalSettings({...localSettings, companyName: e.target.value})}
                  className="h-12 border-2 border-slate-50 bg-slate-50/30 rounded-xl text-[14px] font-black text-slate-900 focus:bg-white focus:border-blue-400 transition-all font-sans"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <h4 className="text-[13px] font-black uppercase text-slate-900 tracking-tight leading-none">ฟีเจอร์หลัก</h4>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Core Engine</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'lineNotifyEnabled', label: 'แจ้งเตือนอัตโนมัติ (LINE)' },
                { id: 'orderFilteringEnabled', label: 'การคัดกรองออเดอร์แม่นยำ' }
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border-2 border-slate-50">
                  <span className="text-[12px] font-black uppercase text-slate-700 tracking-tight">{opt.label}</span>
                  <button 
                    onClick={() => toggleOption(opt.id as any)}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-300",
                      localSettings[opt.id as keyof typeof localSettings] ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300",
                      localSettings[opt.id as keyof typeof localSettings] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm overflow-hidden">
             <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-50">
                <div className="h-10 w-10 rounded-xl bg-[#06C755]/10 text-[#06C755] flex items-center justify-center">
                   <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                   <h4 className="text-[13px] font-black uppercase text-slate-900 tracking-tight leading-none">LINE Group API</h4>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Group Notifications</span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">GROUP NOTIFY ID</Label>
                   <Input
                     value={localSettings.lineGroupId || ""}
                     onChange={(e) => setLocalSettings({ ...localSettings, lineGroupId: e.target.value })}
                     placeholder="Cxxxxxxxxxxxxxxxx..."
                     className="h-12 border-2 border-slate-50 bg-slate-50/30 rounded-xl text-[12px] font-black text-slate-900 focus:bg-white focus:border-blue-400 transition-all font-mono"
                   />
                </div>

                <div className="space-y-2">
                   {[
                      { id: 'notifyOnNewOrder', label: 'NEW ORDER RECEIVED', icon: ShoppingCart, color: 'text-amber-500' },
                      { id: 'notifyOnCompleted', label: 'ORDER COMPLETED', icon: PackageCheck, color: 'text-emerald-500' }
                   ].map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border-2 border-slate-50 group hover:border-slate-100 transition-all">
                         <div className="flex items-center gap-3">
                            <evt.icon className={cn("h-4 w-4", evt.color)} />
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider font-sans">{evt.label}</span>
                         </div>
                         <button
                            onClick={() => toggleOption(evt.id as any)}
                            className={cn(
                               "h-4 w-8 rounded-full relative transition-all duration-300",
                               localSettings[evt.id as keyof typeof localSettings] ? "bg-[#06C755]" : "bg-slate-200"
                            )}
                         >
                            <div className={cn(
                               "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300",
                               localSettings[evt.id as keyof typeof localSettings] ? "left-4.5" : "left-0.5"
                            )} />
                         </button>
                      </div>
                   ))}
                </div>

                <div className="pt-2">
                   <button
                     onClick={handleTestNotification}
                     disabled={testSending || !localSettings.lineGroupId?.trim()}
                     className={cn(
                       "flex w-full h-12 items-center justify-center gap-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95",
                       localSettings.lineGroupId?.trim()
                         ? "bg-[#06C755] text-white shadow-lg shadow-[#06C755]/20 hover:brightness-110"
                         : "bg-slate-100 text-slate-300 cursor-not-allowed"
                     )}
                   >
                     {testSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                     TEST NOTIFICATION
                   </button>
                </div>
                
                {testResult && (
                   <div className={cn("p-4 rounded-xl text-[10px] font-black uppercase bg-slate-50 text-center border-2", testResult.ok ? "border-emerald-100 text-emerald-600" : "border-red-100 text-red-500")}>
                      {testResult.msg}
                   </div>
                )}
             </div>
          </Card>
        </div>

        {/* Center/Right Column: Master Data Tables */}
        <div className="lg:col-span-8 space-y-8">
           {/* Categories Management */}
           <Card className="p-8 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-100">
                       <Tag className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="text-[18px] font-black uppercase text-slate-950 tracking-tight leading-none">คลังหมวดหมู่สินค้า</h4>
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 block">Global Category Bank</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 max-w-md mb-8">
                 <Input 
                   placeholder="ระบุหมวดหมู่ใหม่..." 
                   className="h-12 border-2 border-slate-100 bg-slate-50/30 rounded-xl text-[14px] font-black text-slate-900 focus:bg-white focus:border-blue-400 transition-all font-sans"
                   value={newCat}
                   onChange={(e) => setNewCat(e.target.value)}
                 />
                 <button 
                   onClick={() => addItem('categories', newCat, setNewCat)}
                   className="h-12 w-12 shrink-0 bg-slate-950 rounded-xl flex items-center justify-center text-primary shadow-xl hover:bg-black transition-all active:scale-95"
                 >
                   <Plus className="h-6 w-6" />
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {localSettings.categories.length === 0 && <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl text-[12px] font-black text-slate-300 uppercase tracking-widest italic">Bank is empty</div>}
                 {localSettings.categories.map((cat) => (
                   <div key={cat} className="group relative flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-primary/50 hover:bg-slate-50/50 transition-all">
                     <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{cat}</span>
                     <button 
                       onClick={() => removeItem('categories', cat)}
                       className="h-7 w-7 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 className="h-3.5 w-3.5" />
                     </button>
                   </div>
                 ))}
              </div>
           </Card>

           {/* Units Management */}
           <Card className="p-8 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                       <Box className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="text-[18px] font-black uppercase text-slate-950 tracking-tight leading-none">มาตราส่วน / หน่วยนับ</h4>
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 block">Standard UoM Registry</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 max-w-md mb-8">
                 <Input 
                   placeholder="เช่น ลัง, กิโล, ม้วน..." 
                   className="h-12 border-2 border-slate-100 bg-slate-50/30 rounded-xl text-[14px] font-black text-slate-900 focus:bg-white focus:border-blue-400 transition-all font-sans"
                   value={newUnit}
                   onChange={(e) => setNewUnit(e.target.value)}
                 />
                 <button 
                   onClick={() => addItem('units', newUnit, setNewUnit)}
                   className="h-12 w-12 shrink-0 bg-slate-950 rounded-xl flex items-center justify-center text-primary shadow-xl hover:bg-black transition-all active:scale-95"
                 >
                   <Plus className="h-6 w-6" />
                 </button>
              </div>

              <div className="flex flex-wrap gap-3">
                 {localSettings.units.length === 0 && <div className="w-full py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl text-[12px] font-black text-slate-300 uppercase tracking-widest italic">Registry is empty</div>}
                 {localSettings.units.map((unit) => (
                   <div key={unit} className="group relative px-6 py-3 bg-slate-50/80 border-2 border-transparent hover:border-primary/30 hover:bg-white rounded-2xl flex items-center gap-3 transition-all">
                     <span className="text-[14px] font-black text-slate-700 uppercase tracking-widest">{unit}</span>
                     <button 
                       onClick={() => removeItem('units', unit)}
                       className="h-6 w-0 flex items-center justify-center text-red-400 overflow-hidden group-hover:w-6 transition-all"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
              </div>
           </Card>
           
           <div className="pt-10 flex flex-col items-center justify-center opacity-20">
              <div className="flex items-center gap-6 mb-4">
                 <Server className="h-5 w-5" />
                 <Globe className="h-5 w-5" />
                 <ShieldAlert className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Enterprise Asset Management Framework v2.9.2</p>
           </div>
        </div>
      </div>
    </div>
  );
}
