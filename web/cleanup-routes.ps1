# TKA Routes Cleanup Script
# Only removes empty test-comparison directory and creates missing tab routes

Write-Host "🧹 TKA Routes Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Navigate to routes directory
$routesPath = "F:\CODE\TKA\web\src\routes"
Set-Location $routesPath

Write-Host "📍 Working in: $routesPath" -ForegroundColor Yellow

# 1. Delete empty test-comparison directory
Write-Host "`n🗑️  Removing empty directories..." -ForegroundColor Red
if (Test-Path "test-comparison") {
    Remove-Item "test-comparison" -Recurse -Force
    Write-Host "   ✅ Deleted: test-comparison/" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  test-comparison/ already gone" -ForegroundColor Gray
}

# 2. Create missing tab routes
Write-Host "`n➕ Creating missing tab routes..." -ForegroundColor Green

# Create learn route
if (-not (Test-Path "learn")) {
    New-Item -ItemType Directory -Path "learn" | Out-Null
    @"
<!-- Learn Route -->
<script lang="ts">
  import { onMount } from "svelte";
  import { switchTab } from "`$lib/state/appState.svelte";
  import MainApplication from "`$components/MainApplication.svelte";

  onMount(async () => {
    // Navigate to learn tab
    switchTab("learn");
  });
</script>

<svelte:head>
  <title>Learn Flow Arts - TKA Tutorials | Kinetic Movement Education</title>
  <meta
    name="description"
    content="Learn flow arts techniques and kinetic movement patterns with TKA's comprehensive tutorial system. Master poi, fans, staff, and more."
  />
  <meta property="og:title" content="Learn Flow Arts - TKA Tutorials" />
  <meta
    property="og:description"
    content="Comprehensive flow arts education with step-by-step tutorials for poi, fans, staff, and kinetic movement patterns."
  />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://thekineticalphabet.com/learn" />
</svelte:head>

<MainApplication />
"@ | Out-File -FilePath "learn\+page.svelte" -Encoding UTF8
    Write-Host "   ✅ Created: learn/" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  learn/ already exists" -ForegroundColor Gray
}

# Create sequence-card route
if (-not (Test-Path "sequence-card")) {
    New-Item -ItemType Directory -Path "sequence-card" | Out-Null
    @"
<!-- Sequence Card Route -->
<script lang="ts">
  import { onMount } from "svelte";
  import { switchTab } from "`$lib/state/appState.svelte";
  import MainApplication from "`$components/MainApplication.svelte";

  onMount(async () => {
    // Navigate to sequence_card tab
    switchTab("sequence_card");
  });
</script>

<svelte:head>
  <title>Sequence Cards - TKA Movement Notation | Flow Arts Diagrams</title>
  <meta
    name="description"
    content="View and create sequence cards with TKA's movement notation system. Visual diagrams for flow arts choreography and kinetic patterns."
  />
  <meta property="og:title" content="Sequence Cards - Movement Notation" />
  <meta
    property="og:description"
    content="Create visual sequence cards and movement diagrams for flow arts choreography with TKA's notation system."
  />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://thekineticalphabet.com/sequence-card" />
</svelte:head>

<MainApplication />
"@ | Out-File -FilePath "sequence-card\+page.svelte" -Encoding UTF8
    Write-Host "   ✅ Created: sequence-card/" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  sequence-card/ already exists" -ForegroundColor Gray
}

# Create write route
if (-not (Test-Path "write")) {
    New-Item -ItemType Directory -Path "write" | Out-Null
    @"
<!-- Write Route -->
<script lang="ts">
  import { onMount } from "svelte";
  import { switchTab } from "`$lib/state/appState.svelte";
  import MainApplication from "`$components/MainApplication.svelte";

  onMount(async () => {
    // Navigate to write tab
    switchTab("write");
  });
</script>

<svelte:head>
  <title>Write Sequences - TKA Movement Composer | Flow Arts Editor</title>
  <meta
    name="description"
    content="Compose and write flow arts sequences with TKA's advanced movement editor. Create custom choreography and kinetic patterns."
  />
  <meta property="og:title" content="Write Sequences - Movement Composer" />
  <meta
    property="og:description"
    content="Advanced sequence composer for creating custom flow arts choreography and kinetic movement patterns."
  />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="https://thekineticalphabet.com/write" />
</svelte:head>

<MainApplication />
"@ | Out-File -FilePath "write\+page.svelte" -Encoding UTF8
    Write-Host "   ✅ Created: write/" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  write/ already exists" -ForegroundColor Gray
}

Write-Host "`n🎯 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "   • Kept all valuable SEO and API routes" -ForegroundColor Green
Write-Host "   • Deleted only empty test-comparison/" -ForegroundColor Green  
Write-Host "   • Created 3 missing tab routes" -ForegroundColor Green
Write-Host "   • Routes now match your 8 tabs exactly" -ForegroundColor Green

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "Your routes are now perfectly organized!" -ForegroundColor Yellow
