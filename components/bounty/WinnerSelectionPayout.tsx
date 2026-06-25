
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, CheckCircle, Hash } from "lucide-react";

interface WinnerSlot {
  position: number;
  label: string;
  amount: number;
  submissionId?: string;
  applicantAddress?: string;
  applicantName?: string;
}

interface WinnerSelectionPayoutProps {
  bountyId: string;
  slots: WinnerSlot[];
  escrowMode: "managed" | "external";
  onSelectWinnersAndPay: (winners: { applicantAddress: string; position: number }[]) => Promise<{ txHash: string }>;
}

type Step = "review" | "confirm" | "paying" | "complete";

export function WinnerSelectionPayout({ bountyId, slots, escrowMode, onSelectWinnersAndPay }: WinnerSelectionPayoutProps) {
  const [step, setStep] = useState<Step>("review");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const filled = slots.filter(s => s.applicantAddress);
  const allFilled = filled.length === slots.length;
  const totalPayout = slots.reduce((sum, s) => sum + s.amount, 0);

  const handlePay = async () => {
    setStep("paying");
    setError("");
    try {
      const winners = filled.map(s => ({ applicantAddress: s.applicantAddress!, position: s.position }));
      const result = await onSelectWinnersAndPay(winners);
      setTxHash(result.txHash);
      setStep("complete");
    } catch (e: any) {
      setError(e.message ?? "Payout failed");
      setStep("confirm");
    }
  };

  if (step === "complete") {
    return (
      <Card className="border-green-500">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <p className="font-semibold text-lg">Bounty Completed!</p>
          <p className="text-sm text-muted-foreground">Winners paid. Bounty is now COMPLETED.</p>
          {txHash && (
            <a href={}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Hash className="h-3 w-3" />{txHash.slice(0,16)}...
            </a>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />Winner Selection
          </CardTitle>
          <CardDescription>
            {escrowMode === "managed" ? "Payout signs server-side" : "Payout requires your wallet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.map(slot => (
            <div key={slot.position} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Badge variant={slot.position === 1 ? "default" : "secondary"}>
                  {slot.label}
                </Badge>
                <span className="text-sm">
                  {slot.applicantName ?? <span className="text-muted-foreground italic">Not selected</span>}
                </span>
              </div>
              <span className="text-sm font-semibold">{slot.amount} USDC</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between text-sm font-semibold">
            <span>Total payout</span>
            <span>{totalPayout} USDC</span>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {step === "review" && (
        <Button onClick={() => setStep("confirm")} disabled={!allFilled} className="w-full">
          Review & Pay Winners
        </Button>
      )}
      {step === "confirm" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            This will pay {totalPayout} USDC on-chain and mark the bounty COMPLETED.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("review")} className="flex-1">Back</Button>
            <Button onClick={handlePay} className="flex-1">Confirm &amp; Pay</Button>
          </div>
        </div>
      )}
      {step === "paying" && (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing payout...
        </Button>
      )}
    </div>
  );
}
export default WinnerSelectionPayout;
