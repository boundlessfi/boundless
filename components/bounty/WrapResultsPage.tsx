
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Archive, Megaphone, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Winner { rank: number; participantName: string; tierAmount: number; payoutTx?: string; }
interface WrapResultsPageProps {
  bountyId: string;
  bountyTitle: string;
  winners: Winner[];
  isArchived: boolean;
  onPublishAnnouncement: (message: string, winnerIds: string[]) => Promise<void>;
  onArchive: () => Promise<void>;
  onRestore: () => Promise<void>;
}

export function WrapResultsPage({
  bountyId, bountyTitle, winners, isArchived, onPublishAnnouncement, onArchive, onRestore
}: WrapResultsPageProps) {
  const [announcement, setAnnouncement] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublishAnnouncement(announcement, winners.map((_, i) => String(i)));
      setAnnounced(true);
    } finally {
      setPublishing(false);
    }
  };

  const rankLabel = (r: number) => r === 1 ? "1st" : r === 2 ? "2nd" : r === 3 ? "3rd" : ;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Results — {bountyTitle}
          </CardTitle>
          <CardDescription>Final winners and payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {winners.length === 0 ? (
            <p className="text-muted-foreground text-sm">No winners selected.</p>
          ) : winners.map((w, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Badge variant={w.rank === 1 ? "default" : "secondary"}>{rankLabel(w.rank)}</Badge>
                <span className="font-medium">{w.participantName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{w.tierAmount} USDC</span>
                {w.payoutTx && (
                  <a href={}
                     target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {!announced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />Publish Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea placeholder="Write a winners announcement..." value={announcement}
              onChange={e => setAnnouncement(e.target.value)} rows={3} />
            <Button onClick={handlePublish} disabled={publishing || !announcement.trim()}>
              {publishing ? "Publishing..." : "Publish & Notify Winners"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {isArchived ? "Archived" : "Archive Bounty"}
          </CardTitle>
          <CardDescription>Archived bounties are hidden but never deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          {isArchived ? (
            <Button variant="outline" onClick={onRestore} disabled={archiving}>Restore Bounty</Button>
          ) : (
            <Button variant="secondary" onClick={async () => { setArchiving(true); await onArchive(); setArchiving(false); }}
              disabled={archiving}>
              {archiving ? "Archiving..." : "Archive Bounty"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default WrapResultsPage;
