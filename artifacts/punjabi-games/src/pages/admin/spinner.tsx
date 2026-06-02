import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import {
  useListSpinnerConfigs,
  useCreateSpinnerConfig,
  useUpdateSpinnerConfig,
  useDeleteSpinnerConfig,
} from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, GripVertical, Palette } from "lucide-react";

type DisplayMode = "wheel" | "slot-vertical" | "slot-horizontal" | "flash";

interface SpinItem {
  label: string;
  type: string;
  color: string;
  weight: number;
}

interface ConfigForm {
  name: string;
  description: string;
  isActive: boolean;
  displayMode: DisplayMode;
  items: SpinItem[];
}

const DEFAULT_COLORS = ["#E8721A","#1A56E8","#FFB300","#4CAF50","#E91E63","#9C27B0","#00BCD4","#FF5722"];
const MODES: { value: DisplayMode; label: string }[] = [
  { value: "wheel", label: "🎡 Wheel" },
  { value: "slot-vertical", label: "↕ Slot Vertical" },
  { value: "slot-horizontal", label: "↔ Slot Horizontal" },
  { value: "flash", label: "⚡ Flash Card" },
];

const empty: ConfigForm = { name: "", description: "", isActive: true, displayMode: "wheel", items: [
  { label: "ਅ", type: "text", color: "#E8721A", weight: 1 },
  { label: "ਆ", type: "text", color: "#1A56E8", weight: 1 },
] };

function ConfigDialog({
  open,
  onClose,
  initial,
  onSave,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  initial: ConfigForm;
  onSave: (f: ConfigForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<ConfigForm>(initial);

  const set = (k: keyof ConfigForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const setItem = (i: number, k: keyof SpinItem, v: any) =>
    setForm(p => { const items = [...p.items]; items[i] = { ...items[i], [k]: v }; return { ...p, items }; });

  const addItem = () => setForm(p => ({
    ...p,
    items: [...p.items, { label: "New", type: "text", color: DEFAULT_COLORS[p.items.length % DEFAULT_COLORS.length], weight: 1 }],
  }));

  const removeItem = (i: number) => setForm(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Edit Config" : "New Config"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Name *</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Punjabi Alphabet" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Description</Label>
            <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional description" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Display Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(m => (
                <button key={m.value} onClick={() => set("displayMode", m.value)}
                  className={`p-2 rounded-xl text-xs font-bold border-2 transition-all ${form.displayMode === m.value ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-muted-foreground"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <Label className="text-xs font-bold">Active</Label>
            <Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Items ({form.items.length})</Label>
              <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {form.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                  <input type="color" value={item.color} onChange={e => setItem(i, "color", e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent" title="Color" />
                  <Input value={item.label} onChange={e => setItem(i, "label", e.target.value)} placeholder="Label" className="h-8 flex-1 text-sm font-bold" />
                  <Input type="number" value={item.weight} onChange={e => setItem(i, "weight", parseInt(e.target.value) || 1)}
                    min={1} max={10} className="h-8 w-14 text-sm text-center" title="Weight" />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={loading || !form.name || form.items.length === 0} className="bg-primary text-white">
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSpinner() {
  const { data: configs, isLoading } = useListSpinnerConfigs();
  const createConfig = useCreateSpinnerConfig();
  const updateConfig = useUpdateSpinnerConfig();
  const deleteConfig = useDeleteSpinnerConfig();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<{ open: boolean; initial: ConfigForm; id?: number }>({ open: false, initial: empty });

  const openCreate = () => setDialog({ open: true, initial: { ...empty, items: [...empty.items] } });
  const openEdit = (c: any) => setDialog({
    open: true,
    id: c.id,
    initial: { name: c.name, description: c.description ?? "", isActive: c.isActive, displayMode: (c.displayMode as DisplayMode) || "wheel", items: (c.items as SpinItem[]).map(i => ({ ...i })) },
  });

  const closeDialog = () => setDialog(d => ({ ...d, open: false }));

  const handleSave = (form: ConfigForm) => {
    if (dialog.id) {
      updateConfig.mutate({ id: dialog.id, data: { ...form, items: form.items as any } }, {
        onSuccess: () => { toast({ title: "Config updated" }); closeDialog(); queryClient.invalidateQueries({ queryKey: ["/api/spinner/configs"] }); },
        onError: () => toast({ title: "Error saving", variant: "destructive" }),
      });
    } else {
      createConfig.mutate({ data: { ...form, items: form.items as any } }, {
        onSuccess: () => { toast({ title: "Config created" }); closeDialog(); queryClient.invalidateQueries({ queryKey: ["/api/spinner/configs"] }); },
        onError: () => toast({ title: "Error creating", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteConfig.mutate({ id }, {
      onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/spinner/configs"] }); },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
  };

  const isSaving = createConfig.isPending || updateConfig.isPending;

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Spinner Configs" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg">Configurations</h2>
          <Button onClick={openCreate} size="sm" className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-1" /> New Config
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : configs?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <p className="text-muted-foreground font-bold">No configs yet.</p>
            <Button onClick={openCreate} className="mt-3 bg-primary text-white" size="sm"><Plus className="w-4 h-4 mr-1" />Create First</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {configs?.map(config => (
              <div key={config.id} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-black text-base">{config.name}</h3>
                    {config.description && <p className="text-xs text-muted-foreground">{config.description}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${config.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {config.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700">
                    {config.displayMode || "wheel"}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-100 text-primary">
                    {config.items.length} items
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(config.items as SpinItem[]).slice(0, 8).map((item, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-xs font-bold text-white" style={{ backgroundColor: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}>
                      {item.label}
                    </span>
                  ))}
                  {config.items.length > 8 && <span className="text-xs text-muted-foreground font-bold">+{config.items.length - 8}</span>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(config)} className="h-8">
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(config.id, config.name)} className="h-8 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfigDialog
        open={dialog.open}
        onClose={closeDialog}
        initial={dialog.initial}
        onSave={handleSave}
        loading={isSaving}
      />
    </MobileContainer>
  );
}
