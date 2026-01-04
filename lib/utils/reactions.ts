import { ReactionType } from '@/types/comment';

/**
 * Reaction configuration with display properties
 */
export interface ReactionConfig {
  type: ReactionType;
  label: string;
  emoji: string;
  color: string;
  hoverColor: string;
}

/**
 * All available reaction configurations
 */
export const REACTION_CONFIGS: Record<ReactionType, ReactionConfig> = {
  [ReactionType.LIKE]: {
    type: ReactionType.LIKE,
    label: 'Like',
    emoji: '👍',
    color: 'text-blue-500',
    hoverColor: 'hover:text-blue-600',
  },
  [ReactionType.DISLIKE]: {
    type: ReactionType.DISLIKE,
    label: 'Dislike',
    emoji: '👎',
    color: 'text-red-500',
    hoverColor: 'hover:text-red-600',
  },
  [ReactionType.LOVE]: {
    type: ReactionType.LOVE,
    label: 'Love',
    emoji: '❤️',
    color: 'text-red-500',
    hoverColor: 'hover:text-red-600',
  },
  [ReactionType.LAUGH]: {
    type: ReactionType.LAUGH,
    label: 'Laugh',
    emoji: '😂',
    color: 'text-yellow-500',
    hoverColor: 'hover:text-yellow-600',
  },
  [ReactionType.THUMBS_UP]: {
    type: ReactionType.THUMBS_UP,
    label: 'Thumbs Up',
    emoji: '👍',
    color: 'text-green-500',
    hoverColor: 'hover:text-green-600',
  },
  [ReactionType.THUMBS_DOWN]: {
    type: ReactionType.THUMBS_DOWN,
    label: 'Thumbs Down',
    emoji: '👎',
    color: 'text-gray-500',
    hoverColor: 'hover:text-gray-600',
  },
  [ReactionType.FIRE]: {
    type: ReactionType.FIRE,
    label: 'Fire',
    emoji: '🔥',
    color: 'text-orange-500',
    hoverColor: 'hover:text-orange-600',
  },
  [ReactionType.ROCKET]: {
    type: ReactionType.ROCKET,
    label: 'Rocket',
    emoji: '🚀',
    color: 'text-purple-500',
    hoverColor: 'hover:text-purple-600',
  },
  [ReactionType.CELEBRATE]: {
    type: ReactionType.CELEBRATE,
    label: 'Celebrate',
    emoji: '🎉',
    color: 'text-pink-500',
    hoverColor: 'hover:text-pink-600',
  },
  [ReactionType.INSIGHTFUL]: {
    type: ReactionType.INSIGHTFUL,
    label: 'Insightful',
    emoji: '💡',
    color: 'text-yellow-500',
    hoverColor: 'hover:text-yellow-600',
  },
};

/**
 * Get reaction configuration by type
 */
export function getReactionConfig(type: ReactionType): ReactionConfig {
  return REACTION_CONFIGS[type];
}

/**
 * Get all reaction configurations
 */
export function getAllReactionConfigs(): ReactionConfig[] {
  return Object.values(REACTION_CONFIGS);
}

/**
 * Get popular reactions (most commonly used)
 */
export function getPopularReactions(): ReactionConfig[] {
  return [
    REACTION_CONFIGS[ReactionType.LIKE],
    REACTION_CONFIGS[ReactionType.LOVE],
    REACTION_CONFIGS[ReactionType.LAUGH],
    REACTION_CONFIGS[ReactionType.FIRE],
    REACTION_CONFIGS[ReactionType.THUMBS_UP],
  ];
}

/**
 * Format reaction count for display
 */
export function formatReactionCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Sort reactions by popularity
 */
export function sortReactionsByPopularity(
  reactions: Array<{ type: ReactionType; count: number }>
): Array<{ type: ReactionType; count: number }> {
  return reactions.sort((a, b) => b.count - a.count);
}

/**
 * Get reaction summary for display
 */
export function getReactionSummary(
  reactions: Array<{ type: ReactionType; count: number }>,
  userReaction?: ReactionType
): {
  topReactions: Array<{
    config: ReactionConfig;
    count: number;
    isUserReaction: boolean;
  }>;
  totalCount: number;
} {
  const sortedReactions = sortReactionsByPopularity(reactions);

  const topReactions = sortedReactions.slice(0, 3).map(reaction => ({
    config: getReactionConfig(reaction.type),
    count: reaction.count,
    isUserReaction: userReaction === reaction.type,
  }));

  const totalCount = sortedReactions.reduce(
    (sum, reaction) => sum + reaction.count,
    0
  );

  return {
    topReactions,
    totalCount,
  };
}

/**
 * Check if user has reacted with specific type
 */
export function hasUserReaction(
  userId: string,
  reactions: Array<{ type: ReactionType; users: string[] }>
): ReactionType | null {
  for (const reaction of reactions) {
    if (reaction.users.includes(userId)) {
      return reaction.type;
    }
  }
  return null;
}

/**
 * Toggle reaction (add if not present, remove if present)
 */
export function toggleReaction(
  currentReactions: Array<{
    type: ReactionType;
    count: number;
    users: string[];
  }>,
  userId: string,
  reactionType: ReactionType
): Array<{ type: ReactionType; count: number; users: string[] }> {
  const existingReactionIndex = currentReactions.findIndex(
    r => r.type === reactionType
  );

  if (existingReactionIndex >= 0) {
    const existingReaction = currentReactions[existingReactionIndex];
    const hasUserReacted = existingReaction.users.includes(userId);

    if (hasUserReacted) {
      // Remove user's reaction
      const newUsers = existingReaction.users.filter(id => id !== userId);
      if (newUsers.length === 0) {
        // Remove reaction entirely if no users left
        return currentReactions.filter(
          (_, index) => index !== existingReactionIndex
        );
      } else {
        // Update reaction with removed user
        return currentReactions.map((reaction, index) =>
          index === existingReactionIndex
            ? { ...reaction, count: reaction.count - 1, users: newUsers }
            : reaction
        );
      }
    } else {
      // Add user's reaction
      return currentReactions.map((reaction, index) =>
        index === existingReactionIndex
          ? {
              ...reaction,
              count: reaction.count + 1,
              users: [...reaction.users, userId],
            }
          : reaction
      );
    }
  } else {
    // Add new reaction type
    return [
      ...currentReactions,
      {
        type: reactionType,
        count: 1,
        users: [userId],
      },
    ];
  }
}

/**
 * Get reaction tooltip text
 */
export function getReactionTooltip(
  reaction: { type: ReactionType; count: number; users: string[] },
  userNames: Record<string, string>
): string {
  const config = getReactionConfig(reaction.type);
  const userList = reaction.users
    .slice(0, 3)
    .map(id => userNames[id] || 'Unknown User')
    .join(', ');

  const remaining = reaction.users.length - 3;
  const userText =
    remaining > 0 ? `${userList} and ${remaining} others` : userList;

  return `${config.emoji} ${config.label} by ${userText}`;
}
