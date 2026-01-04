# 🗣️ Comment System Implementation

A comprehensive, production-ready comment system built with React/Next.js, featuring real-time updates, advanced moderation, and rich user interactions.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Components](#components)
- [Hooks](#hooks)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Migration Guide](#migration-guide)

## ✨ Features

### Core Features

- ✅ **Multi-entity Support**: Comments on Projects, Bounties, Hackathons, Grants, etc.
- ✅ **Threaded Comments**: Nested replies with configurable depth
- ✅ **8 Reaction Types**: LIKE, DISLIKE, LOVE, LAUGH, THUMBS_UP, THUMBS_DOWN, FIRE, ROCKET
- ✅ **Real-time Updates**: WebSocket integration for live comment updates
- ✅ **Content Validation**: Client-side validation with spam detection
- ✅ **Advanced Moderation**: Report system with resolution workflow

### User Experience

- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Loading States**: Proper loading indicators
- ✅ **Error Handling**: Comprehensive error states
- ✅ **Responsive Design**: Mobile-first responsive UI
- ✅ **Accessibility**: WCAG compliant components

### Developer Experience

- ✅ **TypeScript**: Full type safety
- ✅ **Modular Hooks**: Reusable, composable hooks
- ✅ **Generic Components**: Entity-agnostic components
- ✅ **Comprehensive Testing**: Test page with all features

## 🏗️ Architecture

### Data Flow

```
User Action → Hook → API → Backend → WebSocket → UI Update
```

### Component Hierarchy

```
GenericCommentThread
├── CommentInput (with validation)
├── CommentItem[]
│   ├── CommentReactions
│   ├── CommentReplyInput
│   └── CommentReportForm
└── LoadMoreButton
```

### Hook Architecture

```
useCommentSystem (main orchestrator)
├── useComments (data fetching)
├── useCreateComment (create operations)
├── useUpdateComment (update operations)
├── useDeleteComment (delete operations)
├── useReportComment (reporting)
└── useCommentReactions (reactions)
```

## 🔌 API Integration

### Base URL

```
/api/comments
```

### Endpoints Used

- `GET /api/comments` - Fetch comments with filtering
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/reactions` - Add reaction
- `DELETE /api/comments/:id/reactions/:type` - Remove reaction
- `POST /api/comments/:id/report` - Report comment
- `GET /api/comments/:id/reactions` - Get reactions

### Query Parameters

```typescript
interface GetCommentsQuery {
  entityType: CommentEntityType;
  entityId: string;
  authorId?: string;
  parentId?: string;
  status?: CommentStatus;
  includeReactions?: boolean;
  includeReports?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## 🧩 Components

### GenericCommentThread

Main comment thread component that works with any entity type.

```tsx
<GenericCommentThread
  entityType={CommentEntityType.PROJECT}
  entityId='project-123'
  currentUser={user}
  commentsHook={commentSystem.comments}
  createCommentHook={commentSystem.createComment}
  // ... other hooks
  maxDepth={3}
  showReactions={true}
  showReporting={true}
  showModeration={isModerator}
/>
```

### CommentModerationDashboard

Moderation interface for handling reports and comment status.

```tsx
<CommentModerationDashboard />
```

### Entity-Specific Components

- `ProjectComments` - For project pages
- `HackathonComments` - For hackathon discussions
- `BountyComments` - For bounty discussions

## 🎣 Hooks

### useCommentSystem

Main orchestrator hook that combines all comment functionality.

```tsx
const commentSystem = useCommentSystem({
  entityType: CommentEntityType.PROJECT,
  entityId: 'project-123',
  page: 1,
  limit: 20,
  enabled: true,
});
```

### Individual Hooks

- `useComments` - Data fetching and pagination
- `useCreateComment` - Comment creation
- `useUpdateComment` - Comment editing
- `useDeleteComment` - Comment deletion
- `useReportComment` - Comment reporting
- `useCommentReactions` - Reaction management
- `useCommentRealtime` - WebSocket integration

### useCommentRealtime

Real-time updates via WebSocket.

```tsx
useCommentRealtime(
  { entityType, entityId, userId },
  {
    onCommentCreated: comment => {
      /* handle new comment */
    },
    onReactionAdded: data => {
      /* handle reaction */
    },
    // ... other event handlers
  }
);
```

## 💡 Usage Examples

### Basic Project Comments

```tsx
import { ProjectComments } from '@/components/project-details/comment-section/project-comments';

function ProjectPage({ projectId }: { projectId: string }) {
  return (
    <div>
      {/* Project content */}
      <ProjectComments projectId={projectId} />
    </div>
  );
}
```

### Hackathon Comments

```tsx
import { HackathonComments } from '@/components/hackathons/HackathonComments';

function HackathonPage({ hackathonId }: { hackathonId: string }) {
  return (
    <div>
      {/* Hackathon content */}
      <HackathonComments hackathonId={hackathonId} />
    </div>
  );
}
```

### Custom Comment Thread

```tsx
import { GenericCommentThread } from '@/components/comments/GenericCommentThread';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType } from '@/types/comment';

function CustomComments({
  entityType,
  entityId,
}: {
  entityType: CommentEntityType;
  entityId: string;
}) {
  const commentSystem = useCommentSystem({
    entityType,
    entityId,
    enabled: true,
  });

  const currentUser = {
    id: 'user-1',
    name: 'John Doe',
    isModerator: false,
  };

  return (
    <GenericCommentThread
      entityType={entityType}
      entityId={entityId}
      currentUser={currentUser}
      {...commentSystem}
    />
  );
}
```

## 🌐 WebSocket Real-time Integration

### **Architecture Overview**

The comment system uses WebSocket connections to provide real-time updates across all entity types.

### **Connection Details**

- **Namespace**: `/realtime`
- **Room Structure**: `{entityType}:{entityId}`
- **Authentication**: Via `userId` query parameter

### **Supported Real-time Events**

#### **1. Comment Operations**

```typescript
// Event Structure
{
  entityType: 'PROJECT',
  entityId: 'project-123',
  update: {
    type: 'comment-added' | 'comment-updated' | 'comment-deleted',
    data: Comment // or { commentId: string }
  }
}
```

#### **2. Reaction Operations**

```typescript
// Event Structure
{
  entityType: 'PROJECT',
  entityId: 'project-123',
  update: {
    type: 'reaction-added' | 'reaction-removed',
    data: {
      commentId: string,
      reactionType: ReactionType,
      userId: string
    }
  }
}
```

### **Frontend Integration**

#### **Automatic Subscription**

```typescript
// The useCommentRealtime hook handles this automatically
const realtime = useCommentRealtime(
  { entityType, entityId, userId, enabled: true },
  {
    onCommentCreated: comment => addCommentToUI(comment),
    onCommentUpdated: comment => updateCommentInUI(comment),
    onCommentDeleted: commentId => removeCommentFromUI(commentId),
    onReactionAdded: data =>
      updateReactionCount(data.commentId, data.reactionType),
    onReactionRemoved: data =>
      updateReactionCount(data.commentId, data.reactionType),
  }
);
```

#### **Manual Connection (if needed)**

```typescript
import io from 'socket.io-client';

const socket = io(`${BACKEND_URL}/realtime`, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  query: { userId: currentUserId },
});

// Subscribe to entity
socket.emit('subscribe-entity', {
  entityType: 'PROJECT',
  entityId: 'project-123',
});

// Listen for updates
socket.on('entity-update', update => {
  // Handle real-time events
});
```

### **Backend Broadcasting**

The backend automatically broadcasts events when:

- Comments are created, updated, or deleted
- Reactions are added or removed
- Comment status changes (moderation)

### **Performance Benefits**

- ✅ **Efficient**: Room-based subscriptions (only relevant updates)
- ✅ **Scalable**: Supports unlimited entity types
- ✅ **Real-time**: Instant updates without polling
- ✅ **Reliable**: Automatic reconnection on disconnect

## 🧪 Testing

### Test Page

Visit `/test-new-comments` to test all features:

- Comment creation and editing
- Nested replies
- All 8 reaction types
- Reporting system
- Moderation dashboard
- Real-time updates
- Content validation

### Test Configuration

- **Entity Type**: Switch between different entity types
- **Entity ID**: Test with different entity IDs
- **User Roles**: Test moderator vs regular user features

## 🔄 Migration Guide

### From Old Project Comments

**Before:**

```tsx
import { ProjectComments } from '@/components/project-details/comment-section/project-comments';

// Old component with limited features
<ProjectComments projectId={projectId} />;
```

**After:**

```tsx
import { ProjectComments } from '@/components/project-details/comment-section/project-comments';

// New component with full feature set
<ProjectComments projectId={projectId} />;
```

The `ProjectComments` component has been updated internally to use the new system while maintaining the same API.

### Adding Comments to New Entities

1. **Import the GenericCommentThread:**

```tsx
import { GenericCommentThread } from '@/components/comments/GenericCommentThread';
import { useCommentSystem } from '@/hooks/use-comment-system';
```

2. **Initialize the comment system:**

```tsx
const commentSystem = useCommentSystem({
  entityType: CommentEntityType.YOUR_ENTITY,
  entityId: yourEntityId,
  enabled: true,
});
```

3. **Render the comment thread:**

```tsx
<GenericCommentThread
  entityType={CommentEntityType.YOUR_ENTITY}
  entityId={yourEntityId}
  currentUser={currentUser}
  {...commentSystem}
/>
```

## 📊 Performance Considerations

### Optimization Strategies

- **Pagination**: Cursor-based pagination for large threads
- **Virtual Scrolling**: For threads with 100+ comments
- **Debounced Updates**: Batch rapid reaction updates
- **Optimistic Updates**: Instant UI feedback with rollback on error
- **Lazy Loading**: Load nested replies on demand

### Memory Management

- **Cleanup**: Proper WebSocket connection cleanup
- **Debouncing**: Prevent excessive API calls
- **Caching**: Local comment data caching with TTL

## 🔒 Security Features

### Content Validation

- **Spam Detection**: Pattern-based spam filtering
- **Link Limits**: Maximum links per comment
- **Length Limits**: Min/max character limits
- **Prohibited Content**: Configurable banned patterns

### Rate Limiting

- **Comment Creation**: Rate limiting per user
- **API Calls**: Backend rate limiting
- **WebSocket**: Connection limits

### Moderation

- **Content Filtering**: Automatic content analysis
- **Report System**: User reporting with review queue
- **Status Management**: Hide/delete/approve comments
- **Audit Trail**: Full moderation history

## 🚀 Deployment Checklist

- [ ] Backend API endpoints deployed
- [ ] WebSocket server configured
- [ ] Database migrations completed
- [ ] Content validation rules configured
- [ ] Moderation queue initialized
- [ ] Rate limiting configured
- [ ] CDN configured for static assets
- [ ] Monitoring and logging set up

## 📈 Monitoring & Analytics

### Key Metrics

- **Comment Volume**: Comments per entity type
- **Engagement Rate**: Reactions per comment
- **Moderation Load**: Reports processed per day
- **Real-time Performance**: WebSocket latency
- **Error Rates**: API failure rates

### Logging

- **User Actions**: Comment creation, reactions, reports
- **Moderation Actions**: Report resolutions, status changes
- **System Events**: WebSocket connections, API calls
- **Errors**: Failed operations with context

## 🐛 Troubleshooting

### Common Issues

**Comments not loading:**

- Check API endpoints are accessible
- Verify entity type and ID are correct
- Check network connectivity

**Real-time updates not working:**

- Verify WebSocket server is running
- Check firewall settings
- Confirm user permissions

**Reactions not updating:**

- Check reaction permissions
- Verify user authentication
- Confirm WebSocket connection

**Moderation not working:**

- Verify user role permissions
- Check moderation API endpoints
- Confirm database connections

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_COMMENT_DEBUG=true
```

## 🤝 Contributing

### Code Standards

- Use TypeScript for all new code
- Follow existing component patterns
- Add comprehensive error handling
- Include loading states
- Test all features thoroughly

### Adding New Features

1. Update type definitions first
2. Implement API integration
3. Create/update hooks
4. Build UI components
5. Add tests and documentation
6. Update this README

---

## 📞 Support

For questions or issues with the comment system:

1. Check this README first
2. Review the test page at `/test-new-comments`
3. Check browser console for errors
4. Verify backend API is responding
5. Review WebSocket connection status

The comment system is designed to be robust, scalable, and maintainable. All features have been thoroughly tested and are production-ready.
