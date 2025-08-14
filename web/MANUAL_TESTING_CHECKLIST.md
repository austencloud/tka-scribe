# Manual Testing Checklist

## 🤖 Bot Testing (Search Engine Perspective)

### Chrome DevTools Method

1. **Open DevTools** → Network tab → Settings gear → User agent dropdown
2. **Select "Googlebot"**
3. **Navigate to each SEO page:**
   - [ ] `/about` - Should load normally, no redirect
   - [ ] `/features` - Should load normally, no redirect
   - [ ] `/getting-started` - Should load normally, no redirect
   - [ ] `/browse` - Should load normally, no redirect
4. **Check meta tags in Elements tab:**
   - [ ] `<title>` tag present and descriptive
   - [ ] `<meta name="description">` present
   - [ ] OpenGraph tags (`og:title`, `og:description`) present
   - [ ] Structured data (`application/ld+json`) present

### Curl Testing (Command Line)

```bash
# Test each page with different bot user agents
curl -H "User-Agent: Googlebot/2.1" http://localhost:5173/about
curl -H "User-Agent: Bingbot/2.0" http://localhost:5173/features
curl -H "User-Agent: facebookexternalhit/1.1" http://localhost:5173/browse
```

- [ ] All return HTML content (not redirects)
- [ ] Content includes proper meta tags

## 👤 User Redirection Testing

### Test from "Search Engine" Referrer

1. **Open browser console** and run:
   ```javascript
   // Simulate Google referrer
   Object.defineProperty(document, "referrer", {
     value: "https://www.google.com/search?q=TKA",
     configurable: true,
   });
   ```
2. **Navigate to SEO pages:**
   - [ ] `/about` → Should redirect to `/?tab=about`
   - [ ] `/features` → Should redirect to `/?tab=about&section=features`
   - [ ] `/getting-started` → Should redirect to `/?tab=about&section=getting-started`
   - [ ] `/browse` → Should redirect to `/?tab=browse`

### Test Direct Navigation

1. **Type URLs directly in address bar:**
   - [ ] `localhost:5173/about` → Redirects to main app
   - [ ] `localhost:5173/features` → Redirects with section parameter
   - [ ] `localhost:5173/browse` → Redirects to browse tab
2. **Timing check:**
   - [ ] Brief delay (100-200ms) before redirect
   - [ ] Enough time for bots to see content

## 🔄 SPA Navigation Testing

### Tab Navigation

1. **Load main app** at `localhost:5173/`
2. **Click each navigation tab:**
   - [ ] About tab - smooth transition, no page reload
   - [ ] Browse tab - smooth transition, no page reload
   - [ ] Construct tab - smooth transition, no page reload
3. **Check URL:**
   - [ ] URL stays at `/` throughout navigation
   - [ ] No browser refresh/reload behavior

### Logo Click

1. **From any tab, click TKA logo**
   - [ ] Switches to About tab
   - [ ] No page reload
   - [ ] Smooth transition

### Parameter Handling

1. **Navigate to `/?tab=about`**
   - [ ] About tab becomes active
   - [ ] URL parameters get cleaned up (disappear)
2. **Navigate to `/?tab=about&section=features`**
   - [ ] About tab becomes active
   - [ ] Page scrolls to features section
   - [ ] Parameters get cleaned up

## 🔍 SEO Infrastructure Testing

### Sitemap

- [ ] `localhost:5173/sitemap.xml` loads
- [ ] Returns valid XML
- [ ] Contains all important pages
- [ ] Proper priorities set

### Robots.txt

- [ ] `localhost:5173/robots.txt` loads
- [ ] Contains sitemap reference
- [ ] Blocks testing pages
- [ ] Allows important pages

### Performance

- [ ] Tab switching is instant (<100ms)
- [ ] No unnecessary network requests during SPA navigation
- [ ] SEO pages load quickly (<2s)

## ✅ Success Criteria

**For Search Engines:**

- ✅ Static pages are crawlable and indexable
- ✅ Meta tags and structured data present
- ✅ No redirects interrupt bot crawling

**For Users:**

- ✅ Seamless redirection to modern SPA experience
- ✅ Fast, smooth tab navigation within app
- ✅ No jarring page reloads

**For SEO:**

- ✅ Each section has discoverable URL
- ✅ Rich meta data for social sharing
- ✅ Proper sitemap and robots.txt

## 🚨 Red Flags to Watch For

- ❌ Bots getting redirected (kills SEO)
- ❌ Users seeing static pages (bad UX)
- ❌ SPA navigation triggering page reloads
- ❌ Missing or broken meta tags
- ❌ Redirect loops or errors
- ❌ Slow performance
