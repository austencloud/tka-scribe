# Comprehensive HMR Testing Plan

This document outlines a systematic approach to verify Hot Module Replacement (HMR) is working correctly in your SvelteKit application.

## Prerequisites
✅ Dev server running on port 5173 (PID: 54424)
✅ Browser open at http://localhost:5173
✅ HMR test component added (red box in top-right corner)
✅ Browser DevTools Console open

## Test Configuration Applied
- **File watching**: Enabled polling mode (`usePolling: true`) for Windows compatibility
- **Polling interval**: 100ms for source files, 300ms for binary files
- **Build cache**: Cleared `.svelte-kit` and `node_modules/.vite`
- **JSON error logging**: Suppressed 404 errors for missing placement files

---

## Test Suite

### Test 1: Component Text Change (Basic HMR)
**What it tests**: Basic Svelte component hot reloading

**Steps**:
1. Open `src/lib/shared/dev/HMRTest.svelte`
2. Change line 7: `let testMessage = $state("HMR Test v1.0");`
   - To: `let testMessage = $state("HMR Test v2.0");`
3. Save the file
4. Check browser **without refreshing**

**Expected Result**:
- ✅ Red box text updates to "HMR Test v2.0"
- ✅ Counter value is PRESERVED (state maintained)
- ✅ No full page reload
- ✅ Console shows: `[⚡ HMR] HMRTest.svelte`

**If it fails**:
- ❌ Full page reload occurred (check Vite config)
- ❌ No update (file watching not working)

---

### Test 2: CSS Change (Style HMR)
**What it tests**: CSS hot reloading without state loss

**Steps**:
1. In `HMRTest.svelte`, find the `.hmr-test` style (around line 20)
2. Change `background: red;` to `background: blue;`
3. Update line 10: `<p class="test-indicator">Background: Red</p>`
   - To: `<p class="test-indicator">Background: Blue</p>`
4. Save the file

**Expected Result**:
- ✅ Box background changes to blue instantly
- ✅ Text updates to "Background: Blue"
- ✅ Counter value PRESERVED
- ✅ No flash or full reload

---

### Test 3: JavaScript Logic Change
**What it tests**: TypeScript/JavaScript hot reloading

**Steps**:
1. In `HMRTest.svelte`, change the `increment` function (around line 9):
   ```ts
   function increment() {
     count += 5; // Changed from count++
   }
   ```
2. Save the file
3. Click the increment button

**Expected Result**:
- ✅ Button now adds 5 instead of 1
- ✅ Previous count value preserved
- ✅ Instant update, no reload

---

### Test 4: Service File Change (Non-Component)
**What it tests**: HMR for TypeScript service files

**Steps**:
1. Open `src/lib/modules/build/shared/services/implementations/UndoService.ts`
2. Add a simple console.log at the top of a method (e.g., line 50):
   ```ts
   console.log('[HMR-TEST] UndoService called');
   ```
3. Save the file
4. Trigger an undo action in the app

**Expected Result**:
- ✅ New console.log appears in output
- ✅ Console shows: `[⚡ HMR] UndoService.ts`
- ⚠️ May trigger full reload (depending on usage context)

---

### Test 5: State File Change (Full Reload Expected)
**What it tests**: Force reload for critical state files

**Steps**:
1. Open `src/lib/shared/application/state/app-state.svelte.ts`
2. Add a comment at the top: `// HMR test comment`
3. Save the file

**Expected Result**:
- ✅ Console shows: `[🔄 Full Reload - Critical File] app-state.svelte.ts`
- ✅ Page reloads completely
- ⚠️ This is INTENTIONAL for state files (per vite.config.ts)

---

### Test 6: Nested Component Change
**What it tests**: HMR propagation through component tree

**Steps**:
1. Click increment button in HMR test component 5 times (count = 5 or 25)
2. Open any child component in the app (e.g., a build module component)
3. Add a comment: `<!-- HMR test -->`
4. Save

**Expected Result**:
- ✅ Component updates
- ✅ HMR test counter still shows same value
- ✅ Parent components unaffected

---

### Test 7: WebSocket Connection Health
**What it tests**: HMR WebSocket is connected and active

**Steps**:
1. Open Browser DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `ws://localhost:5173`
4. Make a change to HMRTest.svelte
5. Watch WebSocket messages

**Expected Result**:
- ✅ WebSocket shows "101 Switching Protocols" (connected)
- ✅ Messages flow when files change
- ✅ No "failed" or "disconnected" status

---

### Test 8: Multiple Rapid Changes
**What it tests**: File watcher throttling and HMR queue

**Steps**:
1. Open HMRTest.svelte
2. Make 3 quick changes (within 2 seconds):
   - Change text to "v3.0"
   - Save
   - Change to "v4.0"
   - Save
   - Change to "v5.0"
   - Save

**Expected Result**:
- ✅ Component updates to final state (v5.0)
- ✅ No errors in console
- ✅ May skip intermediate states (v3.0, v4.0) - this is normal

---

### Test 9: Error Recovery
**What it tests**: HMR handles syntax errors gracefully

**Steps**:
1. In HMRTest.svelte, introduce a syntax error:
   ```svelte
   <p>Count: {count</p>  <!-- Missing closing brace -->
   ```
2. Save the file
3. Fix the error:
   ```svelte
   <p>Count: {count}</p>
   ```
4. Save again

**Expected Result**:
- ✅ Error overlay appears (red screen with error details)
- ✅ After fix, overlay disappears
- ✅ Component recovers without full reload
- ✅ State preserved

---

### Test 10: File Watcher Deep Path Test
**What it tests**: File watching in nested directories with spaces

**Steps**:
1. Navigate to a deeply nested file:
   `src/lib/modules/build/animate/services/implementations/EndpointCalculator.ts`
2. Add a comment: `// HMR deep path test`
3. Save
4. Check terminal output

**Expected Result**:
- ✅ Terminal shows: `[⚡ HMR] EndpointCalculator.ts`
- ✅ File change detected within 1-2 seconds
- ✅ No "file not found" or watcher errors

---

## Diagnostic Checks

### Check 1: Vite Configuration
```bash
# Verify polling is enabled
grep -A 5 "watch:" vite.config.ts
```

**Expected**:
```ts
watch: {
  usePolling: true,
  interval: 100,
  ...
}
```

### Check 2: WebSocket in Console
Open console and check for:
```
[vite] connected.
```

If you see:
```
[vite] server connection lost. polling for restart...
```
This means HMR WebSocket is broken.

### Check 3: File Watcher Count
```bash
# Check how many files Vite is watching
# In browser console:
# Should not show "ENOSPC" errors (too many files)
```

---

## Common Issues & Solutions

### Issue: Changes not detected at all
**Solution**:
- Restart dev server with polling enabled
- Check file path has no special characters breaking watcher
- Verify file is not in `ignored` list in vite.config.ts

### Issue: Full reload on every change
**Solution**:
- Check if file matches force-reload patterns in `forceReloadPlugin()`
- State files SHOULD trigger full reload
- Regular components should NOT

### Issue: HMR works for some files but not others
**Solution**:
- Check if problematic files are imported in unusual ways
- Verify file extensions are recognized (.svelte, .ts, .js)
- Check for circular dependencies

### Issue: WebSocket connection fails
**Solution**:
- Check firewall isn't blocking WebSocket on port 5173
- Verify `hmr.overlay: true` in vite.config.ts
- Check browser console for CORS errors

### Issue: Error overlay doesn't clear after fix
**Solution**:
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Restart dev server

---

## Performance Benchmarks

Good HMR performance indicators:
- ⚡ **Change detection**: < 200ms
- ⚡ **Update applied**: < 500ms
- ⚡ **Total time to see change**: < 1 second

If updates take > 3 seconds, investigate:
- Too many files being watched
- Slow file system (network drive, antivirus scanning)
- Large dependencies being re-bundled

---

## Cleanup

After testing, remove the HMR test component:
1. Remove `<HMRTest />` from `MainApplication.svelte`
2. Remove the import: `import HMRTest from "../../dev/HMRTest.svelte";`
3. Optionally delete `src/lib/shared/dev/HMRTest.svelte`
4. Delete this test plan file

---

## Test Results Template

Copy and fill in your results:

```
✅/❌ Test 1: Component Text Change - _______
✅/❌ Test 2: CSS Change - _______
✅/❌ Test 3: JavaScript Logic - _______
✅/❌ Test 4: Service File - _______
✅/❌ Test 5: State File (Full Reload) - _______
✅/❌ Test 6: Nested Component - _______
✅/❌ Test 7: WebSocket Health - _______
✅/❌ Test 8: Rapid Changes - _______
✅/❌ Test 9: Error Recovery - _______
✅/❌ Test 10: Deep Path - _______

Notes:
_____________________________________________
```

---

**Last Updated**: Based on research from Vite HMR API and SvelteKit HMR best practices (2025)
