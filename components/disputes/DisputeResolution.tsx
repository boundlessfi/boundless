"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

interface Dispute {
  id: string;
  bountyId: string;
  participantId: string;
  participantName: string;
  submissionId: string;
  reason: string;
  status: "open" | "under_review" | "upheld" | "overturned";
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  resolvedBy?: string;
}

interface DisputeResolutionProps {
  disputes: Dispute[];
  isOrganizer: boolean;
  onRaiseDispute?: (reason: string) => Promise<void>;
  onResolveDispute?: (disputeId: string, decision: "uphold" | "overturn", notes: string) => Promise<void>;
}

export function DisputeResolution({
  disputes,
  isOrganizer,
  onRaiseDispute,
  onResolveDispute,
}: DisputeResolutionProps) {
  const [newDisputeReason, setNewDisputeReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRaiseDispute = async () => {
    if (!newDisputeReason.trim() || !onRaiseDispute) return;
    setIsSubmitting(true);
    try {
      await onRaiseDispute(newDisputeReason);
      setNewDisputeReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (disputeId: string, decision: "uphold" | "overturn") => {
    if (!onResolveDispute) return;
    setIsSubmitting(true);
    try {
      await onResolveDispute(disputeId, decision, resolutionNotes[disputeId] || "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Dispute["status"]) => {
    const config = {
      open: { variant: "destructive" as const, icon: AlertTriangle, label: "Open" },
      under_review: { variant: "secondary" as const, icon: Clock, label: "Under Review" },
      upheld: { variant: "default" as const, icon: CheckCircle, label: "Upheld" },
      overturned: { variant: "outline" as const, icon: XCircle, label: "Overturned" },
    };
    const { variant, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "under_review");
  const resolvedDisputes = disputes.filter((d) => d.status === "upheld" || d.status === "overturned");

  return (
    <div className="space-y-6">
      {/* Participant: Raise Dispute */}
      {!isOrganizer && onRaiseDispute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Raise a Dispute
            </CardTitle>
            <CardDescription>
              If you believe there was an error in the evaluation of your submission, you can raise a dispute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the reason for your dispute..."
              value={newDisputeReason}
              onChange={(e) => setNewDisputeReason(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleRaiseDispute}
              disabled={!newDisputeReason.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Organizer: Dispute Queue */}
      {isOrganizer && openDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Dispute Queue ({openDisputes.length})
            </CardTitle>
            <CardDescription>Review and resolve pending disputes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {openDisputes.map((dispute) => (
              <Card key={dispute.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{dispute.participantName}</p>
                      <p className="text-sm text-muted-foreground">
                        Submission: {dispute.submissionId}
                      </p>
                    </div>
                    {getStatusBadge(dispute.status)}
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{dispute.reason}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Filed: {dispute.createdAt.toLocaleDateString()}
                  </p>
                  <Textarea
                    placeholder="Resolution notes (optional)..."
                    value={resolutionNotes[dispute.id] || ""}
                    onChange={(e) =>
                      setResolutionNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
                    }
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleResolve(dispute.id, "uphold")}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Uphold
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(dispute.id, "overturn")}
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Overturn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dispute History / Audit Trail */}
      {resolvedDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dispute History</CardTitle>
            <CardDescription>Resolved disputes and their outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedDisputes.map((dispute) => (
              <div key={dispute.id} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dispute.participantName}</span>
                  {getStatusBadge(dispute.status)}
                </div>
                <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                {dispute.resolution && (
                  <div className="bg-muted p-2 rounded text-sm">
                    <strong>Resolution:</strong> {dispute.resolution}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Resolved by {dispute.resolvedBy} on {dispute.resolvedAt?.toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {disputes.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No disputes have been filed.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DisputeResolution;
