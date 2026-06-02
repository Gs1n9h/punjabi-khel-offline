import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import {
  useListTongueTwisters,
  useCreateTongueTwister,
  useUpdateTongueTwister,
  useDeleteTongueTwister,
} from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface TTForm {
  text: string;
  transliteration: string;
  translation: string;
  difficulty: Difficulty;
  isActive: boolean;
}

const emptyForm: TTForm = { text: "", transliteration: "", translation: "", difficulty: "easy", isActive: true };

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

function TTDialog({
  open, onClose, initial, onSave, loading, title,
}: {
  open: boolean; onClose: () => void; initial: TTForm; onSave: (f: TTForm) => void; loading: boolean; title: string;
}) {
  const [form, setForm] = useState<TTForm>(initial);
  const set = (k: keyof TTForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Punjabi Text *</Label>
            <Input value={form.text} onChange={e => set("text", e.target.value)} placeholder="ਕੱਚਾ ਪਾਪੜ…" className="font-bold text-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Transliteration</Label>
            <Input value={form.transliteration} onChange={e => set("transliteration", e.target.value)} placeholder="Kacha papar…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Translation (English)</Label>
            <Input value={form.translation} onChange={e => set("translation", e.target.value)} placeholder="Raw papadum…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Difficulty</Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                <button key={d} onClick={() => set("difficulty", d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all ${form.difficulty === d ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-200 text-muted-foreground"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs font-bold">Active</Label>
            <Switch checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={loading || !form.text} className="bg-primary text-white">
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTongueTwisters() {
  const { data: twisters, isLoading } = useListTongueTwisters();
  const createTT = useCreateTongueTwister();
  const updateTT = useUpdateTongueTwister();
  const deleteTT = useDeleteTongueTwister();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<{ open: boolean; initial: TTForm; id?: number; title: string }>({ open: false, initial: emptyForm, title: "Add Tongue Twister" });

  const openCreate = () => setDialog({ open: true, initial: { ...emptyForm }, title: "Add Tongue Twister" });
  const openEdit = (t: any) => setDialog({
    open: true, id: t.id, title: "Edit Tongue Twister",
    initial: { text: t.text, transliteration: t.transliteration ?? "", translation: t.translation ?? "", difficulty: t.difficulty, isActive: t.isActive },
  });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/tongue-twisters"] });

  const handleSave = (form: TTForm) => {
    if (dialog.id) {
      updateTT.mutate({ id: dialog.id, data: form }, {
        onSuccess: () => { toast({ title: "Updated" }); closeDialog(); invalidate(); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    } else {
      createTT.mutate({ data: form }, {
        onSuccess: () => { toast({ title: "Created" }); closeDialog(); invalidate(); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number, text: string) => {
    if (!confirm(`Delete this tongue twister?`)) return;
    deleteTT.mutate({ id }, {
      onSuccess: () => { toast({ title: "Deleted" }); invalidate(); },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
  };

  const isSaving = createTT.isPending || updateTT.isPending;

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Tongue Twisters" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg">Boli List</h2>
          <Button onClick={openCreate} size="sm" className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-1" /> Add New
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-28 w-full rounded-2xl" /><Skeleton className="h-28 w-full rounded-2xl" /></div>
        ) : twisters?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <p className="text-muted-foreground font-bold">No tongue twisters yet.</p>
            <Button onClick={openCreate} className="mt-3 bg-primary text-white" size="sm"><Plus className="w-4 h-4 mr-1" />Add First</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {twisters?.map(t => (
              <div key={t.id} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[t.difficulty as Difficulty] || "bg-slate-100 text-slate-500"}`}>
                      {t.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${t.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                </div>
                <p className="font-black text-xl text-foreground leading-tight mb-1">{t.text}</p>
                {t.transliteration && <p className="text-xs text-muted-foreground italic mb-0.5">"{t.transliteration}"</p>}
                {t.translation && <p className="text-xs text-slate-500">{t.translation}</p>}
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)} className="h-8">
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(t.id, t.text)} className="h-8 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TTDialog open={dialog.open} onClose={closeDialog} initial={dialog.initial} onSave={handleSave} loading={isSaving} title={dialog.title} />
    </MobileContainer>
  );
}
