# SEO System Live Demo
# Demonstrates the difference between bot and user behavior

Write-Host "🚀 Testing SEO System Live on localhost:5175" -ForegroundColor Green
Write-Host "=" * 60

# Function to test HTTP endpoints
function Test-SEOEndpoint {
    param(
        [string]$Path,
        [string]$UserAgent,
        [string]$BotName
    )
    
    try {
        Write-Host "`n🔍 Testing $Path as $BotName:" -ForegroundColor Cyan
        Write-Host "   User-Agent: $($UserAgent.Substring(0, [Math]::Min(60, $UserAgent.Length)))..." -ForegroundColor Gray
        
        $uri = "http://localhost:5175$Path"
        $headers = @{ 'User-Agent' = $UserAgent }
        
        $response = Invoke-WebRequest -Uri $uri -Headers $headers -UseBasicParsing
        
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   📄 Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Yellow
        Write-Host "   📏 Content Length: $($response.Content.Length) chars" -ForegroundColor Yellow
        
        # Check for key SEO elements
        if ($response.Content -match '<title>(.*?)</title>') {
            Write-Host "   🏷️  Title: `"$($matches[1])`"" -ForegroundColor Magenta
        }
        
        if ($response.Content -match '<meta name="description" content="(.*?)"') {
            $desc = $matches[1]
            if ($desc.Length -gt 80) { $desc = $desc.Substring(0, 80) + "..." }
            Write-Host "   📝 Description: `"$desc`"" -ForegroundColor Magenta
        }
        
        # Check for structured data
        if ($response.Content -match '"@type"') {
            Write-Host "   🏗️  Structured data detected" -ForegroundColor Blue
        }
        
        # Check for user redirects
        if ($response.Content -match 'window\.location\.href|tab-') {
            Write-Host "   🔄 User redirect detected" -ForegroundColor Red
        }
        
        # Check for SPA content
        if ($response.Content -match 'svelte-app|__app') {
            Write-Host "   ⚡ SPA content detected" -ForegroundColor Yellow
        }
        
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# User agents for testing
$UserAgents = @{
    'Googlebot' = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    'Bingbot' = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
    'FacebookBot' = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    'TwitterBot' = 'Twitterbot/1.0'
    'RegularUser' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Test server connectivity
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:5175" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is accessible" -ForegroundColor Green
}
catch {
    Write-Host "❌ Cannot connect to http://localhost:5175" -ForegroundColor Red
    Write-Host "Make sure the dev server is running with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test core SEO endpoints
Write-Host "`n📋 TESTING CORE SEO ENDPOINTS" -ForegroundColor Blue
Test-SEOEndpoint '/sitemap.xml' $UserAgents.Googlebot 'Googlebot'
Test-SEOEndpoint '/robots.txt' $UserAgents.Googlebot 'Googlebot'

# Test SEO pages with different bots
Write-Host "`n🤖 TESTING BOT BEHAVIOR" -ForegroundColor Blue
$TestPages = @('/about', '/learn', '/practice')

foreach ($page in $TestPages) {
    Test-SEOEndpoint $page $UserAgents.Googlebot 'Googlebot'
    Test-SEOEndpoint $page $UserAgents.FacebookBot 'Facebook Bot'
}

# Test user behavior  
Write-Host "`n👤 TESTING USER BEHAVIOR" -ForegroundColor Blue
foreach ($page in $TestPages) {
    Test-SEOEndpoint $page $UserAgents.RegularUser 'Regular User'
}

Write-Host "`n✅ SEO System Test Complete!" -ForegroundColor Green
Write-Host "`nKey Observations:" -ForegroundColor Cyan
Write-Host "- Bots should see server-rendered pages with full SEO metadata" -ForegroundColor Gray
Write-Host "- Users should be redirected to SPA with tab navigation" -ForegroundColor Gray  
Write-Host "- sitemap.xml and robots.txt should be accessible to all crawlers" -ForegroundColor Gray
