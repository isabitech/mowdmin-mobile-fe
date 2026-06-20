# Gospel Music, Testimonies, and Sermons Handover

## What was added on mobile

The Home screen now has three new quick-action cards that follow the same visual pattern as the existing donation-style cards:

- `Gospel Music`
- `Testimonies`
- `Sermons`

Each card opens its own page and follows the app's existing UI language.

## New frontend routes

- `GospelMusic`
- `Testimonies`
- `Sermons`

## New frontend files

- `src/screens/content/GospelMusicScreen.tsx`
- `src/screens/content/SermonsScreen.tsx`
- `src/screens/community/TestimoniesScreen.tsx`
- `src/services/faithMediaApi.ts`
- `src/services/testimoniesApi.ts`
- `src/components/content/FaithMediaScreen.tsx`
- `src/components/content/FaithMediaCard.tsx`
- `src/components/content/FaithMediaListItem.tsx`
- `src/components/testimonies/TestimonyCard.tsx`
- `src/components/testimonies/MyTestimonyCard.tsx`
- `src/components/testimonies/TestimonyComposerCard.tsx`
- `src/components/home/QuickActionCard.tsx`

## Feature behavior

### Gospel Music

- Uses the same media-library style already present in the app.
- Shows a hero/featured item, category chips, search, a horizontal media rail, and a list section.
- Playback opens the existing `VideoPlayer` screen.
- Frontend currently pulls from the existing media source and filters items that look like gospel/worship content.

### Sermons

- Uses the same media-library style as Gospel Music.
- Supports featured content, search, category chips, and playback.
- Frontend currently pulls from the existing media source and filters items that look like sermon/message/teaching content.

### Testimonies

- Built to feel close to Prayer Wall.
- Has two tabs:
  - `Community Feed`: read public testimonies from others, like them, and comment.
  - `Share Yours`: create and manage your own testimonies.
- Includes a comments bottom-sheet style modal similar to Prayer Wall.

## Backend expectations

## 1. Gospel Music and Sermons

### Current frontend expectation

The mobile app currently uses the existing `GET /media` endpoint and filters the returned items locally.

### Required media fields

Each media item should provide:

```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "category_id": {
    "_id": "string",
    "name": "string",
    "description": "string"
  },
  "thumbnail": "https://...",
  "isLive": false,
  "type": "video",
  "media_url": "https://...",
  "author": "string",
  "duration": "34 min",
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-28T10:00:00.000Z"
}
```

### How the app classifies Gospel Music

The frontend checks these fields:

- `title`
- `description`
- `category_id.name`
- `type`
- `author`

If any of them contain words like these, the item appears under Gospel Music:

- `gospel`
- `music`
- `worship`
- `praise`
- `choir`
- `song`
- `hymn`

### How the app classifies Sermons

If the same fields contain words like these, the item appears under Sermons:

- `sermon`
- `message`
- `teaching`
- `word`
- `preaching`
- `homily`
- `service`

### Recommendation for backend

To make the frontend behave predictably, use clean category names like:

- `Gospel Music`
- `Worship Session`
- `Praise Medley`
- `Sermon`
- `Teaching`
- `Sunday Message`

### Optional backend improvement

If backend prefers explicit filtering later, these would be useful:

- `GET /media?kind=gospel-music`
- `GET /media?kind=sermon`

The app does not require these yet, but they would make classification more exact.

## 2. Testimonies

The app expects a backend API that mirrors the Prayer Wall pattern.

### Testimony model expected by frontend

```json
{
  "_id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "isPublic": true,
  "likeCount": 12,
  "commentCount": 4,
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-28T10:00:00.000Z",
  "author": {
    "_id": "string",
    "name": "John Doe",
    "avatar": "https://..."
  },
  "isLiked": false
}
```

### Comment model expected by frontend

```json
{
  "_id": "string",
  "userId": "string",
  "testimonyId": "string",
  "comment": "string",
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-28T10:00:00.000Z",
  "author": {
    "_id": "string",
    "name": "Jane Doe",
    "avatar": "https://..."
  }
}
```

### Endpoints expected by frontend

#### Get all public testimonies

`GET /testimony`

Expected response:

```json
{
  "status": "success",
  "message": "Testimonies fetched successfully",
  "data": [/* testimony array */]
}
```

#### Get current user's testimonies

`GET /testimony/user`

Expected response:

```json
{
  "status": "success",
  "message": "User testimonies fetched successfully",
  "data": [/* testimony array */]
}
```

#### Create testimony

`POST /testimony/create`

Request body:

```json
{
  "title": "God healed me",
  "description": "Full testimony text here",
  "isPublic": true
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Testimony created successfully",
  "data": {/* testimony object */}
}
```

#### Update testimony

`PUT /testimony/:testimonyId`

Request body:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "isPublic": true
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Testimony updated successfully",
  "data": {/* testimony object */}
}
```

#### Delete testimony

`DELETE /testimony/:testimonyId`

Expected response:

```json
{
  "status": "success",
  "message": "Testimony deleted successfully"
}
```

#### Toggle like on a testimony

`POST /testimony-like/:testimonyId/like`

Expected response:

```json
{
  "status": "success",
  "message": "Testimony like toggled successfully",
  "data": {
    "testimony": {/* testimony object */},
    "liked": true
  }
}
```

#### Get comments for a testimony

`GET /testimony-comment/:testimonyId/comments`

Accepted response shapes:

```json
{
  "status": "success",
  "message": "Comments fetched successfully",
  "data": [/* comments array */]
}
```

or

```json
{
  "status": "success",
  "message": "Comments fetched successfully",
  "data": {
    "comments": [/* comments array */]
  }
}
```

#### Add comment to a testimony

`POST /testimony-comment/:testimonyId/comment`

Request body:

```json
{
  "comment": "This blessed me, thank you for sharing."
}
```

Expected response:

```json
{
  "status": "success",
  "message": "Comment added successfully",
  "data": {/* comment object */}
}
```

#### Delete a comment

`DELETE /testimony-comment/:commentId`

Expected response:

```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

## Auth expectations

These testimony endpoints should be protected with the same auth pattern used elsewhere in the app:

- `GET /testimony/user`
- `POST /testimony/create`
- `PUT /testimony/:testimonyId`
- `DELETE /testimony/:testimonyId`
- `POST /testimony-like/:testimonyId/like`
- `POST /testimony-comment/:testimonyId/comment`
- `DELETE /testimony-comment/:commentId`

`GET /testimony` can be public or authenticated, but authenticated is better if `isLiked` should be returned per user.

## Important frontend notes

- The app sorts testimonies and media using `createdAt` where available.
- For the testimonies feed, `author.name`, `likeCount`, `commentCount`, and `isLiked` are important for the UI.
- For Gospel Music and Sermons, `media_url` is required for playback.
- For Gospel Music and Sermons, `thumbnail` is required for the cards and featured banner.

## Current fallback behavior

The mobile app already has safe fallbacks while backend is still being wired:

- Gospel Music and Sermons fall back to local sample content if no matching backend media is available.
- Testimonies fall back to local device storage if the testimony endpoints are not ready yet.

That means the UI can already be reviewed even before backend implementation is complete.
