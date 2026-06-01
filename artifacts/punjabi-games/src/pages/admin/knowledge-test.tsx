import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import {
  useListKnowledgeTests,
  useCreateKnowledgeQuestion,
  useUpdateKnowledgeQuestion,
  useDeleteKnowledgeQuestion,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface QForm {
  question: string;
  imageUrl: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: Difficulty;
  isActive: boolean;
}

const emptyForm: QForm = {
  question: "", imageUrl: "", options: ["", "", "", ""], correctAnswer: "",
  explanation: "", category: "", difficulty: "easy", isActive: true,
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

function QDialog({ open, onClose, initial, onSave, loading, title }: {
  open: boolean; onClose: () => void; initial: QForm; onSave: (f: QForm) => void; loading: boolean; title: string;
}) {
  const [form, setForm] = useState<QForm>(initial);
  const set = (k: keyof QForm, v: any) => setForm(p => ({ ...p, [k]: v }));
  const setOption = (i: number, v: string) => setForm(p => { const opts = [...p.options]; opts[i] = v; return { ...p, options: opts }; });

  const validOptions = form.options.filter(o => o.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Question *</Label>
            <Input value={form.question} onChange={e => set("question", e.target.value)} placeholder="ਇਹ ਕੀ ਹੈ?" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Image URL (optional)</Label>
            <Input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Category</Label>
            <Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Letters, Numbers, Culture…" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">Answer Options * (click to set correct)</Label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => set("correctAnswer", opt)} disabled={!opt}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${form.correctAnswer === opt && opt ? "bg-green-500 border-green-500 text-white" : "border-slate-300 text-slate-300"}`}>
                  <CheckCircle className="w-4 h-4" />
                </button>
                <Input value={opt} onChange={e => { setOption(i, e.target.value); if (form.correctAnswer === opt) set("correctAnswer", e.target.value); }}
                  placeholder={`Option ${i + 1}`} className={`h-9 ${form.correctAnswer === opt && opt ? "border-green-400 bg-green-50 font-bold" : ""}`} />
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground">Click the circle to mark the correct answer.</p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Explanation (optional)</Label>
            <Input value={form.explanation} onChange={e => set("explanation", e.target.value)} placeholder="Why this is the answer…" />
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
          <Button onClick={() => onSave(form)}
            disabled={loading || !form.question || validOptions.length < 2 || !form.correctAnswer}
            className="bg-primary text-white">
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminKnowledgeTest() {
  const { data: questions, isLoading } = useListKnowledgeTests();
  const createQ = useCreateKnowledgeQuestion();
  const updateQ = useUpdateKnowledgeQuestion();
  const deleteQ = useDeleteKnowledgeQuestion();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<{ open: boolean; initial: QForm; id?: number; title: string }>({ open: false, initial: emptyForm, title: "Add Question" });

  const openCreate = () => setDialog({ open: true, initial: { ...emptyForm, options: ["", "", "", ""] }, title: "Add Question" });
  const openEdit = (q: any) => setDialog({
    open: true, id: q.id, title: "Edit Question",
    initial: {
      question: q.question, imageUrl: q.imageUrl ?? "", correctAnswer: q.correctAnswer,
      options: [...q.options, ...Array(Math.max(0, 4 - q.options.length)).fill("")],
      explanation: q.explanation ?? "", category: q.category ?? "",
      difficulty: q.difficulty, isActive: q.isActive,
    },
  });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/knowledge-tests"] });

  const handleSave = (form: QForm) => {
    const payload = { ...form, options: form.options.filter(o => o.trim()), imageUrl: form.imageUrl || undefined, explanation: form.explanation || undefined, category: form.category || undefined };
    if (dialog.id) {
      updateQ.mutate({ id: dialog.id, data: payload }, {
        onSuccess: () => { toast({ title: "Updated" }); closeDialog(); invalidate(); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    } else {
      createQ.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Created" }); closeDialog(); invalidate(); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this question?")) return;
    deleteQ.mutate({ id }, {
      onSuccess: () => { toast({ title: "Deleted" }); invalidate(); },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
  };

  const isSaving = createQ.isPending || updateQ.isPending;

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Knowledge Questions" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-lg">Questions ({questions?.length ?? 0})</h2>
          <Button onClick={openCreate} size="sm" className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Q
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>
        ) : questions?.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <p className="text-muted-foreground font-bold">No questions yet.</p>
            <Button onClick={openCreate} className="mt-3 bg-primary text-white" size="sm"><Plus className="w-4 h-4 mr-1" />Add First</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions?.map(q => (
              <div key={q.id} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[q.difficulty as Difficulty] || "bg-slate-100"}`}>{q.difficulty}</span>
                    {q.category && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700">{q.category}</span>}
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${q.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{q.isActive ? "Active" : "Off"}</span>
                  </div>
                </div>
                <p className="font-bold text-sm mb-2 leading-snug">{q.question}</p>
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-1.5 rounded-lg border text-xs font-medium ${opt === q.correctAnswer ? "bg-green-50 border-green-300 text-green-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                      {opt === q.correctAnswer && "✓ "}{opt}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(q)} className="h-8">
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(q.id)} className="h-8 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QDialog open={dialog.open} onClose={closeDialog} initial={dialog.initial} onSave={handleSave} loading={isSaving} title={dialog.title} />
    </MobileContainer>
  );
}
