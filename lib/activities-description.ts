export const getActivityDescription = (activityType: string) => {
  switch (activityType) {
    case 'AVATAR_CHANGED':
      return 'You changed your avatar';
    case 'PROJECT_FOLLOWED':
      return 'You followed a project';
    case 'PROJECT_CREATED':
      return 'You created a project';
    case 'COMMENT_ADDED':
      return 'You added a comment';
    case 'VOTE_CAST':
      return 'You cast a vote';
    case 'GRANT_APPLIED':
      return 'You applied for a grant';
    default:
      return 'Unknown activity';
  }
};
