import {
  Zap,
  Building2,
  Users,
  DollarSign,
  Vote,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Heart,
  Shield,
  Mail,
  Lock,
  Bell,
  Target,
  Rocket,
  Trophy,
  Clock,
  FileText,
  UserPlus,
  XCircle,
  Ban,
  KeyRound,
  Archive,
  ArchiveRestore,
  LucideIcon,
} from 'lucide-react';
import { NotificationType } from '@/types/notifications';

/**
 * Maps notification types to appropriate Lucide icons
 */
export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  switch (type) {
    // Organization Notifications
    case NotificationType.ORGANIZATION_CREATED:
    case NotificationType.ORGANIZATION_UPDATED:
      return Building2;
    case NotificationType.ORGANIZATION_DELETED:
      return AlertCircle;
    case NotificationType.ORGANIZATION_INVITE_SENT:
      return Mail;
    case NotificationType.ORGANIZATION_INVITE_ACCEPTED:
    case NotificationType.ORGANIZATION_MEMBER_ADDED:
      return CheckCircle;
    case NotificationType.ORGANIZATION_MEMBER_REMOVED:
      return Users;
    case NotificationType.ORGANIZATION_ROLE_CHANGED:
      return KeyRound;
    case NotificationType.ORGANIZATION_ARCHIVED:
      return Archive;
    case NotificationType.ORGANIZATION_UNARCHIVED:
      return ArchiveRestore;

    // Hackathon Notifications
    case NotificationType.HACKATHON_CREATED:
    case NotificationType.HACKATHON_UPDATED:
      return Target;
    case NotificationType.HACKATHON_STATUS_CHANGED:
      return Zap;
    case NotificationType.HACKATHON_PUBLISHED:
    case NotificationType.HACKATHON_ACTIVE:
      return Rocket;
    case NotificationType.HACKATHON_COMPLETED:
      return CheckCircle;
    case NotificationType.HACKATHON_CANCELLED:
      return AlertCircle;
    case NotificationType.HACKATHON_REGISTERED:
      return FileText;
    case NotificationType.HACKATHON_SUBMISSION_SUBMITTED:
      return FileText;
    case NotificationType.HACKATHON_SUBMISSION_SHORTLISTED:
      return Trophy;
    case NotificationType.HACKATHON_SUBMISSION_DISQUALIFIED:
      return AlertCircle;
    case NotificationType.HACKATHON_WINNERS_ANNOUNCED:
      return Trophy;
    case NotificationType.HACKATHON_DEADLINE_APPROACHING:
      return Clock;

    // Team Invitation Notifications
    case NotificationType.TEAM_INVITATION_SENT:
      return UserPlus;
    case NotificationType.TEAM_INVITATION_ACCEPTED:
      return CheckCircle;
    case NotificationType.TEAM_INVITATION_DECLINED:
      return XCircle;
    case NotificationType.TEAM_INVITATION_EXPIRED:
      return Clock;
    case NotificationType.TEAM_INVITATION_CANCELLED:
      return Ban;

    // Project Status
    case NotificationType.PROJECT_CREATED:
    case NotificationType.PROJECT_UPDATED:
      return Building2;
    case NotificationType.PROJECT_VERIFIED:
    case NotificationType.PROJECT_APPROVED:
    case NotificationType.PROJECT_COMPLETED:
      return CheckCircle;
    case NotificationType.PROJECT_REJECTED:
    case NotificationType.PROJECT_CANCELLED:
      return AlertCircle;
    case NotificationType.PROJECT_FUNDED:
      return DollarSign;

    // Funding Status
    case NotificationType.FUNDING_RECEIVED:
    case NotificationType.FUNDING_GOAL_MET:
      return DollarSign;
    case NotificationType.FUNDING_FAILED:
    case NotificationType.FUNDING_DEADLINE_APPROACHING:
      return AlertCircle;
    case NotificationType.REFUND_PROCESSED:
      return CheckCircle;

    // Voting Status
    case NotificationType.VOTING_STARTED:
    case NotificationType.VOTING_ENDED:
    case NotificationType.VOTE_RECEIVED:
    case NotificationType.VOTING_THRESHOLD_MET:
      return Vote;

    // Milestone Status
    case NotificationType.MILESTONE_CREATED:
    case NotificationType.MILESTONE_UPDATED:
      return Zap;
    case NotificationType.MILESTONE_COMPLETED:
    case NotificationType.MILESTONE_FUNDS_RELEASED:
      return CheckCircle;
    case NotificationType.MILESTONE_DEADLINE_APPROACHING:
      return AlertCircle;

    // Interaction Notifications
    case NotificationType.COMMENT_RECEIVED:
    case NotificationType.COMMENT_REPLY:
    case NotificationType.COMMENT_MENTION:
      return MessageSquare;
    case NotificationType.REACTION_RECEIVED:
      return Heart;

    // Account Notifications
    case NotificationType.ACCOUNT_VERIFIED:
      return CheckCircle;
    case NotificationType.PASSWORD_CHANGED:
    case NotificationType.EMAIL_CHANGED:
      return Lock;
    case NotificationType.SECURITY_ALERT:
      return Shield;

    default:
      return Bell;
  }
};

/**
 * Gets notification color class based on type
 */
export const getNotificationColor = (type: NotificationType): string => {
  // Security alerts - red
  if (type === NotificationType.SECURITY_ALERT) {
    return 'border-red-200 bg-red-50 text-red-900';
  }

  // Success states - green
  if (
    type === NotificationType.PROJECT_FUNDED ||
    type === NotificationType.PROJECT_COMPLETED ||
    type === NotificationType.FUNDING_GOAL_MET ||
    type === NotificationType.MILESTONE_COMPLETED ||
    type === NotificationType.ACCOUNT_VERIFIED ||
    type === NotificationType.ORGANIZATION_INVITE_ACCEPTED ||
    type === NotificationType.ORGANIZATION_MEMBER_ADDED ||
    type === NotificationType.ORGANIZATION_UNARCHIVED ||
    type === NotificationType.HACKATHON_COMPLETED ||
    type === NotificationType.HACKATHON_SUBMISSION_SHORTLISTED ||
    type === NotificationType.HACKATHON_WINNERS_ANNOUNCED ||
    type === NotificationType.TEAM_INVITATION_ACCEPTED
  ) {
    return 'border-green-200 bg-green-50 text-green-900';
  }

  // Warning/alert states - yellow/orange
  if (
    type === NotificationType.FUNDING_DEADLINE_APPROACHING ||
    type === NotificationType.MILESTONE_DEADLINE_APPROACHING ||
    type === NotificationType.HACKATHON_DEADLINE_APPROACHING ||
    type === NotificationType.TEAM_INVITATION_EXPIRED ||
    type === NotificationType.ORGANIZATION_ARCHIVED
  ) {
    return 'border-yellow-200 bg-yellow-50 text-yellow-900';
  }

  // Error/rejection states - red
  if (
    type === NotificationType.PROJECT_REJECTED ||
    type === NotificationType.ORGANIZATION_DELETED ||
    type === NotificationType.HACKATHON_CANCELLED ||
    type === NotificationType.HACKATHON_SUBMISSION_DISQUALIFIED ||
    type === NotificationType.TEAM_INVITATION_DECLINED ||
    type === NotificationType.TEAM_INVITATION_CANCELLED
  ) {
    return 'border-red-200 bg-red-50 text-red-900';
  }

  // Default - blue for unread, gray for read
  return 'border-blue-200 bg-blue-50 text-blue-900';
};
