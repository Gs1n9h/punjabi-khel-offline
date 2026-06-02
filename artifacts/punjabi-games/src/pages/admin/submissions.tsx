import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useListTongueTwisterSubmissions, useReviewTongueTwisterSubmission } from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AdminSubmissions() {
  const { data: submissions, isLoading } = useListTongueTwisterSubmissions({ query: { queryKey: ["submissions"] } });
  const reviewSubmission = useReviewTongueTwisterSubmission();
  const { toast } = useToast();

  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || [];

  const handleReview = (id: number, status: 'approved' | 'rejected', score: number) => {
    reviewSubmission.mutate({
      id,
      data: { status, score, feedback: status === 'approved' ? 'Great job!' : 'Keep practicing!' }
    }, {
      onSuccess: () => {
        toast({ title: "Review submitted" });
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
      }
    });
  };

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="Review Audio Submissions" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <h2 className="font-bold text-lg">Pending Reviews ({pendingSubmissions.length})</h2>

        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : pendingSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-slate-100">
            <p className="text-muted-foreground font-bold">No pending submissions!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.map(sub => (
              <div key={sub.id} className="p-4 bg-white border-2 border-orange-100 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-bold text-sm">@{sub.username}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
                
                <audio src={sub.audioUrl} controls className="w-full mb-4 h-10" />
                
                <SubmissionReviewer onSubmit={(status, score) => handleReview(sub.id, status, score)} isSubmitting={reviewSubmission.isPending} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}

function SubmissionReviewer({ onSubmit, isSubmitting }: { onSubmit: (status: 'approved' | 'rejected', score: number) => void, isSubmitting: boolean }) {
  const [score, setScore] = useState("85");
  
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Label className="text-xs">Score (0-100)</Label>
        <Input 
          type="number" 
          min="0" 
          max="100" 
          value={score} 
          onChange={(e) => setScore(e.target.value)} 
          className="h-10 font-bold"
        />
      </div>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSubmit('rejected', 0)}
        disabled={isSubmitting}
        className="h-10 w-10 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <XCircle className="w-5 h-5" />
      </Button>
      <Button 
        size="icon"
        onClick={() => onSubmit('approved', parseInt(score) || 0)}
        disabled={isSubmitting}
        className="h-10 w-10 bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-5 h-5" />
      </Button>
    </div>
  )
}
