"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  FileText,
  Trophy,
  Wallet,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface BountyManageNavProps {
  bountyId: string;
  bountyStatus: "draft" | "active" | "submissions" | "judging" | "payout" | "completed" | "cancelled";
  hasDisputes?: boolean;
  pendingPayouts?: number;
}

export function BountyManageNav({
  bountyId,
  bountyStatus,
  hasDisputes = false,
  pendingPayouts = 0,
}: BountyManageNavProps) {
  const pathname = usePathname();
  const baseUrl = `/me/bounties/${bountyId}/manage`;

  const navItems = [
    {
      label: "Overview",
      href: baseUrl,
      icon: BarChart3,
      enabled: true,
    },
    {
      label: "Configure",
      href: `${baseUrl}/configure`,
      icon: Settings,
      enabled: ["draft", "active"].includes(bountyStatus),
    },
    {
      label: "Applications",
      href: `${baseUrl}/applications`,
      icon: Users,
      enabled: true,
      badge: bountyStatus === "active" ? "Review" : undefined,
    },
    {
      label: "Submissions",
      href: `${baseUrl}/submissions`,
      icon: FileText,
      enabled: ["submissions", "judging", "payout", "completed"].includes(bountyStatus),
    },
    {
      label: "Select Winners",
      href: `${baseUrl}/winners`,
      icon: Trophy,
      enabled: ["judging", "payout"].includes(bountyStatus),
      highlight: bountyStatus === "judging",
    },
    {
      label: "Payout",
      href: `${baseUrl}/payout`,
      icon: Wallet,
      enabled: ["payout", "completed"].includes(bountyStatus),
      badge: pendingPayouts > 0 ? `${pendingPayouts} pending` : undefined,
    },
    {
      label: "Disputes",
      href: `${baseUrl}/disputes`,
      icon: AlertTriangle,
      enabled: true,
      badge: hasDisputes ? "Action needed" : undefined,
      badgeVariant: hasDisputes ? "destructive" : "default",
    },
    {
      label: "Results",
      href: `${baseUrl}/results`,
      icon: CheckCircle,
      enabled: bountyStatus === "completed",
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (!item.enabled) {
          return (
            <div
              key={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.highlight && !isActive && "border-l-2 border-yellow-500"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  item.badgeVariant === "destructive"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted-foreground/20"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}  
    </nav>
  );
}

// Management CTA button for the bounty list
export function ManageBountyCTA({ bountyId }: { bountyId: string }) {
  return (
    <Link
      href={`/me/bounties/${bountyId}/manage`}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
    >
      <Settings className="h-4 w-4" />
      Manage
    </Link>
  );
}

export default BountyManageNav;
