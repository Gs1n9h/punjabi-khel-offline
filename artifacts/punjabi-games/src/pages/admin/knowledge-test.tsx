import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useListKnowledgeTests } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminKnowledgeTest() {
  const { data: questions, isLoading } = useListKnowledgeTests();

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Manage Quiz Questions" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Questions DB</h2>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Q
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-24 w-full rounded-xl" />
             <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {questions?.map(q => (
              <div key={q.id} className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                    {q.category || 'General'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${q.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {q.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-2">{q.question}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`p-1 rounded border ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
