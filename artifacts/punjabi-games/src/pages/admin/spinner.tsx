import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useListSpinnerConfigs, useCreateSpinnerConfig } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminSpinner() {
  const { data: configs, isLoading } = useListSpinnerConfigs();
  const createConfig = useCreateSpinnerConfig();

  const handleCreate = () => {
    createConfig.mutate({
      data: {
        name: "New Configuration",
        isActive: false,
        items: [
          { label: "Option 1", type: "text", color: "#E8721A", weight: 1 },
          { label: "Option 2", type: "text", color: "#1A56E8", weight: 1 },
          { label: "Option 3", type: "text", color: "#FFD700", weight: 1 }
        ]
      }
    });
  };

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Manage Spinner" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Configurations</h2>
          <Button onClick={handleCreate} disabled={createConfig.isPending} size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Config
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-20 w-full rounded-xl" />
             <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {configs?.map(config => (
              <div key={config.id} className="p-4 bg-white border-2 border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold">{config.name}</h3>
                  <p className="text-xs text-muted-foreground">{config.items.length} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${config.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {config.isActive ? 'Active' : 'Inactive'}
                  </span>
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
