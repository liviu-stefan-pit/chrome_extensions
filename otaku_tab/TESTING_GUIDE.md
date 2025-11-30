# Testing Guide for Adult Content Implementation

## Manual Testing Steps

### 1. Test Settings UI

#### Enable Show 18+ Content
1. Open the extension
2. Click Settings (gear icon)
3. Scroll to "Show 18+ Content" toggle
4. Toggle ON
5. ✅ Verify: "18+ Content Only" toggle becomes enabled
6. Click "Save Changes"
7. ✅ Verify: Page reloads

#### Enable 18+ Content Only
1. Open Settings again
2. Ensure "Show 18+ Content" is ON
3. Toggle "18+ Content Only" ON
4. Click "Save Changes"
5. ✅ Verify: Page reloads

#### Test Dependency
1. Open Settings
2. If "Show 18+ Content" is ON, toggle it OFF
3. ✅ Verify: "18+ Content Only" automatically becomes unchecked and disabled
4. ✅ Verify: The container has opacity-50 styling

### 2. Test Content Display

#### Normal Mode (No Adult Content)
1. Disable both adult content toggles
2. Navigate to "Currently Airing" tab
3. ✅ Verify: No anime cards have "18+" badge
4. Navigate to "This Season" tab
5. ✅ Verify: No anime cards have "18+" badge
6. Navigate to "All Time Best" tab
7. ✅ Verify: No anime cards have "18+" badge

#### Mixed Mode (Show 18+ Content)
1. Enable "Show 18+ Content" only
2. Navigate to "Currently Airing" tab
3. ✅ Verify: Mix of regular anime and anime with "18+" badges
4. ✅ Verify: Anime are sorted by score
5. Navigate to "This Season" tab
6. ✅ Verify: Mix of regular anime and anime with "18+" badges
7. Navigate to "All Time Best" tab
8. ✅ Verify: Mix of regular anime and anime with "18+" badges

#### Adult Only Mode (18+ Content Only)
1. Enable both "Show 18+ Content" AND "18+ Content Only"
2. Navigate to "Currently Airing" tab
3. ✅ Verify: ALL anime cards have "18+" badges
4. ✅ Verify: Content is from Jikan API (adult anime)
5. Navigate to "This Season" tab
6. ✅ Verify: ALL anime cards have "18+" badges
7. Navigate to "All Time Best" tab
8. ✅ Verify: ALL anime cards have "18+" badges

### 3. Test Search Functionality

#### Search in Normal Mode
1. Disable adult content toggles
2. Use search bar to search for any anime
3. ✅ Verify: Results don't include 18+ badges
4. ✅ Verify: No adult content in results

#### Search in Mixed Mode
1. Enable "Show 18+ Content"
2. Search for "test" or any keyword
3. ✅ Verify: Mix of regular and 18+ tagged results
4. ✅ Verify: Results sorted by relevance/score

#### Search in Adult Only Mode
1. Enable both adult toggles
2. Search for any keyword
3. ✅ Verify: ALL results have 18+ badges
4. ✅ Verify: Only adult content displayed

### 4. Test Visual Elements

#### 18+ Badge Appearance
1. Enable mixed mode
2. Find an anime with 18+ badge
3. ✅ Verify: Badge is red background
4. ✅ Verify: Badge says "18+"
5. ✅ Verify: Badge is in top-right corner
6. ✅ Verify: Badge has white text
7. ✅ Verify: Badge has shadow for visibility

### 5. Test Performance

#### Jikan API Rate Limiting
1. Open browser DevTools Console
2. Enable adult content mode
3. Navigate between tabs quickly
4. ✅ Verify: No Jikan API errors in console
5. ✅ Verify: Requests are properly queued (1 per second)
6. Look for log messages like `[Jikan] Fetched adult anime from Jikan: X`

#### Caching
1. Load "All Time Best" with adult content
2. Wait 2-3 seconds
3. Navigate away and back to "All Time Best"
4. ✅ Verify: Content loads instantly (from cache)
5. ✅ Verify: Console shows cache hit messages

### 6. Test Edge Cases

#### Empty Results
1. Enable adult-only mode
2. Navigate to tabs
3. ✅ Verify: If Jikan API returns no results, page doesn't crash
4. ✅ Verify: Empty state is handled gracefully

#### API Errors
1. Disconnect internet
2. Enable adult content
3. Try loading content
4. ✅ Verify: Extension doesn't crash
5. ✅ Verify: Error is logged to console
6. ✅ Verify: Falls back to cached data if available

#### Ecchi Exclusion
1. Enable adult-only mode
2. Check all displayed anime
3. ✅ Verify: No ecchi anime appear (only Rx-rated hentai)
4. ✅ Verify: Genre tags don't include "Ecchi" alone

## Console Debugging

### Expected Log Messages

**Normal Mode:**
```
[AniList] Fetching top all-time, adultOnly: false, showAdult: false
[AniList] After filtering: X anime
```

**Mixed Mode:**
```
[AniList] Fetching top all-time, adultOnly: false, showAdult: true
[AniList] After filtering: X anime
[Jikan] Fetched adult anime from Jikan: Y
```

**Adult Only Mode:**
```
[AniList] Returning only adult content from Jikan: X
```

### Error Messages to Watch For

**Jikan API Errors (should be handled gracefully):**
```
[Jikan] API error: 429 (rate limit)
[Jikan] Error fetching adult anime: ...
```

**Cache Messages:**
```
[AniList] Cache hit: top_alltime_with_adult
[AniList] Fetching: current_season_top_safe
```

## Automated Testing (Optional)

If you set up automated tests, verify:
1. `jikanService.getTopAdultAnime()` returns only Rx-rated anime
2. `jikanService.isAdultRating()` returns true only for "Rx - Hentai"
3. `jikanService.isEcchi()` correctly identifies ecchi anime
4. `combineAndSortAnime()` sorts by score correctly
5. Rate limiting queues requests properly
6. Cache expiry works after 5 minutes

## Known Limitations

1. Jikan API has 1 request/second rate limit (handled by queuing)
2. Jikan data may be less comprehensive than AniList for regular anime
3. Adult anime schedule distribution is simplified (not exact airing times)
4. Cache is in-memory for Jikan, so refreshing page clears it
5. Adult content requires user action (no age verification yet)

## Troubleshooting

**Issue: No adult content appears**
- Check Settings → both toggles are enabled
- Check console for Jikan API errors
- Verify internet connection

**Issue: Page crashes when enabling adult mode**
- Check console for JavaScript errors
- Verify Jikan API is accessible
- Try clearing cache in Settings

**Issue: "18+" badge not appearing**
- Check if anime has `source: 'jikan'` property
- Verify anime card rendering logic
- Check CSS classes are applied correctly

**Issue: Too many API requests**
- Verify rate limiting is working
- Check request queue in console logs
- Ensure caching is enabled
