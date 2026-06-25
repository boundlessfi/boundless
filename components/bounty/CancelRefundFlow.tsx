
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, XCircle } from "lucide-react";

interface CancelRefundFlowProps {
  bountyId: string;
  bountyTitle: string;
  escrowBalance: number;
  contributorCount: number;
  onCancel: (bountyId: string) => Promise<void>;
  onClose: () => void;
}

export function CancelRefundFlow({
  bountyId, bountyTitle, escrowBalance, contributorCount, onCancel, onClose
}: CancelRefundFlowProps) {
  const [step, setStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setStep("processing");
    setError(null);
    try {
      await onCancel(bountyId);
      setStep("done");
    } catch (e: any) {
      setError(e.message ?? "Cancellation failed");
      setStep("confirm");
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          {step === "done" ? "Bounty Cancelled" : "Cancel Bounty"}
        </CardTitle>
        <CardDescription>{bountyTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "confirm" && (
          <>
            <div className="bg-muted rounded-md p-3 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Refund order</p>
                  <ol className="list-decimal ml-4 mt-1 space-y-1 text-muted-foreground">
                    <li>Contributors refunded first ({contributorCount} contributor{contributorCount !== 1 ? "s" : ""})</li>
                    <li>Remaining escrow balance returned to you</li>
                  </ol>
                </div>
              </div>
              <p className="text-muted-foreground">
                Escrow balance: <strong>{escrowBalance} USDC</strong>
              </p>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleCancel}>Confirm Cancellation</Button>
              <Button variant="outline" onClick={onClose}>Keep Bounty</Button>
            </div>
          </>
        )}
        {step === "processing" && (
          <p className="text-sm text-muted-foreground animate-pulse">Processing cancellation and refunds...</p>
        )}
        {step === "done" && (
          <div className="space-y-3">
            <p className="text-sm text-green-600">Bounty cancelled. Refunds are being processed.</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CancelRefundFlow;
