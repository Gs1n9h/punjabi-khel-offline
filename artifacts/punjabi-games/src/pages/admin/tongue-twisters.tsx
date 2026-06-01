import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useListTongueTwisters } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminTongueTwisters() {
  const { data: twisters, isLoading } = useListTongueTwisters();

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Manage Tongue Twisters" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Tongue Twisters</h2>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add New
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-24 w-full rounded-xl" />
             <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {twisters?.map(twister => (
              <div key={twister.id} className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-primary">
                    {twister.difficulty}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${twister.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {twister.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-black text-lg mb-1">{twister.text}</h3>
                {twister.transliteration && <p className="text-xs text-muted-foreground italic">"{twister.transliteration}"</p>}
                
                <div className="mt-3 flex justify-end">
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
