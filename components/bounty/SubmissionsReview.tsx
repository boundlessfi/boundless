
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, CheckCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  applicantName: string;
  applicantAddress: string;
  contentUri: string;
  anchorStatus: "pending" | "anchored" | "failed";
  submittedAt: string;
  preSelected?: boolean;
}

interface SubmissionsReviewProps {
  submissions: Submission[];
  submissionVisibility: "public" | "hidden_until_deadline";
  deadlinePassed: boolean;
  prizeTiers: { position: number; label: string; amount: number }[];
  onPreSelect: (submissionId: string, position: number) => void;
  onClearSelect: (submissionId: string) => void;
}

export function SubmissionsReview({
  submissions, submissionVisibility, deadlinePassed, prizeTiers, onPreSelect, onClearSelect
}: SubmissionsReviewProps) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const gated = submissionVisibility === "hidden_until_deadline" && !deadlinePassed;

  const handlePreSelect = (subId: string, position: number) => {
    setSelected(prev => ({ ...prev, [subId]: position }));
    onPreSelect(subId, position);
  };

  const handleClear = (subId: string) => {
    setSelected(prev => { const n = { ...prev }; delete n[subId]; return n; });
    onClearSelect(subId);
  };

  if (gated) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Clock className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="font-medium">Submissions are hidden until the deadline passes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </h3>
        {Object.keys(selected).length > 0 && (
          <Badge variant="secondary">{Object.keys(selected).length} pre-selected</Badge>
        )}
      </div>

      {submissions.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p>No submissions yet.</p>
        </CardContent></Card>
      )}

      {submissions.map(sub => {
        const tier = selected[sub.id];
        return (
          <Card key={sub.id} className={tier !== undefined ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{sub.applicantName}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {sub.applicantAddress.slice(0,8)}...{sub.applicantAddress.slice(-6)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sub.anchorStatus === "anchored" ? "default" : "secondary"}>
                    {sub.anchorStatus}
                  </Badge>
                  {tier !== undefined && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Position {tier}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={sub.contentUri} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> View submission
              </a>
              <p className="text-xs text-muted-foreground">
                Submitted {new Date(sub.submittedAt).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-2">
                {prizeTiers.map(t => (
                  <Button key={t.position} size="sm"
                    variant={tier === t.position ? "default" : "outline"}
                    onClick={() => tier === t.position ? handleClear(sub.id) : handlePreSelect(sub.id, t.position)}>
                    {t.label} ({t.amount} USDC)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
export default SubmissionsReview;
