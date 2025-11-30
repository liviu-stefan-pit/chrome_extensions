# Adult Content Implementation Guide

## Overview
This implementation adds proper 18+ adult anime support using the **AniList API's native `isAdult` parameter**, providing seamless integration with the existing codebase.

## Key Features

### 1. **AniList Native Support**
- Uses AniList's built-in `isAdult` parameter in GraphQL queries
- No external APIs needed - single source of truth
- Proper adult content filtering at the API level

### 2. **Two User Preferences**
Located in Settings Modal:

#### Show 18+ Content
- When enabled: Includes both regular and adult anime (isAdult parameter = undefined)
- When disabled: Only shows safe content (isAdult = false)
- Results are naturally sorted by AniList's scoring algorithm

#### 18+ Content Only
- When enabled: Shows ONLY adult anime (isAdult = true)
- Applies to all three main tabs:
  - **Currently Airing**: Adult anime currently airing
  - **This Season**: Adult anime from current season
  - **All Time Best**: Top-rated adult anime of all time
- This option is disabled unless "Show 18+ Content" is checked first

### 3. **Implementation Details**

#### Modified Files

**`src/services/anilist.ts`**
- Added `isAdult` parameter to all GraphQL queries
- Logic: 
  - `adultOnly = true` → `isAdult: true` (only adult)
  - `showAdult = true` → `isAdult: undefined` (mixed content)
  - `showAdult = false` → `isAdult: false` (safe only)
- Updated methods:
  - `getTopAiring()`: Passes isAdult filter
  - `getCurrentSeason()`: Passes isAdult filter
  - `getSchedule()`: Passes isAdult filter to airingSchedules
  - `searchAnime()`: Passes isAdult filter

**`src/components/SettingsModal.ts`**
- Added dependency logic: "18+ Content Only" is disabled unless "Show 18+ Content" is checked
- Both settings trigger page reload to refresh content
- Proper DOM element selection with container IDs

**`src/components/AnimeCard.ts`**
- Added 18+ badge overlay (red, top-right corner)
- Badge appears when `anime.isAdult === true`

### 4. **Data Flow**

#### Normal Mode (Adult content disabled)
```
User → AniList API (isAdult: false) → Display safe content
```

#### Show Adult Content Mode
```
User → AniList API (isAdult: undefined) → Display mixed content with 18+ badges
```

#### Adult Content Only Mode
```
User → AniList API (isAdult: true) → Display only adult content with 18+ badges
```

### 5. **GraphQL Query Example**

```graphql
query ($page: Int, $perPage: Int, $isAdult: Boolean) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: SCORE_DESC, isAdult: $isAdult) {
      id
      title { romaji english }
      isAdult
      averageScore
      # ... other fields
    }
  }
}
```

### 6. **Caching Strategy**
- **AniList Service**: 6-hour Chrome storage cache
- Cache keys include adult preference mode to prevent data leaks between modes
- Three separate caches: `safe`, `with_adult`, `adult_only`

## User Experience

### Settings UI
1. Open Settings (gear icon)
2. Scroll to "Show 18+ Content" toggle
3. Enable to mix adult content with regular content
4. Optional: Enable "18+ Content Only" for adult-exclusive mode
5. Save changes (triggers page reload)

### Visual Indicators
- **18+ Badge**: Red badge in top-right corner of anime cards
- **Mixed Content**: Adult anime appears alongside regular anime
- **Adult Only Mode**: All content shows 18+ badge

## Technical Notes

### Why AniList Native Support?
- **Single API**: No need for external services like Jikan
- **Consistency**: Same data format across all content
- **Reliability**: Official AniList adult content database
- **Performance**: No additional API calls or rate limiting concerns
- **Accuracy**: AniList's isAdult flag is authoritative

### isAdult Parameter Behavior
- `isAdult: true` - Only returns adult content
- `isAdult: false` - Only returns safe content
- `isAdult: undefined` (omitted) - Returns both adult and safe content

### Benefits Over Previous Implementation
1. **Simpler**: No need to combine results from two APIs
2. **Faster**: Single API call instead of multiple
3. **More Reliable**: No dependency on third-party APIs
4. **Better Coverage**: AniList has comprehensive adult anime database
5. **Consistent Scoring**: All content uses same scoring system

## Future Enhancements
- Add user age verification dialog
- Add more granular filtering options
- Implement genre-based adult content filtering
- Add warning modal before entering adult-only mode
