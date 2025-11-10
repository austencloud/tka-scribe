import { readFileSync } from 'fs';

const report = JSON.parse(readFileSync('./lighthouse-report.report.json', 'utf8'));

console.log('\n=== LIGHTHOUSE PERFORMANCE REPORT ===\n');

// Overall Scores (0-1 scale, multiply by 100 for percentage)
console.log('📊 OVERALL SCORES:');
console.log(`  Performance:      ${Math.round(report.categories.performance.score * 100)}/100`);
console.log(`  Accessibility:    ${Math.round(report.categories.accessibility.score * 100)}/100`);
console.log(`  Best Practices:   ${Math.round(report.categories['best-practices'].score * 100)}/100`);
console.log(`  SEO:              ${Math.round(report.categories.seo.score * 100)}/100`);
console.log(`  PWA:              ${Math.round((report.categories.pwa?.score || 0) * 100)}/100`);

console.log('\n⚡ CORE WEB VITALS:');
console.log(`  First Contentful Paint (FCP):    ${report.audits['first-contentful-paint'].displayValue}`);
console.log(`  Largest Contentful Paint (LCP):  ${report.audits['largest-contentful-paint'].displayValue}`);
console.log(`  Total Blocking Time (TBT):       ${report.audits['total-blocking-time'].displayValue}`);
console.log(`  Cumulative Layout Shift (CLS):   ${report.audits['cumulative-layout-shift'].displayValue}`);
console.log(`  Speed Index:                     ${report.audits['speed-index'].displayValue}`);
console.log(`  Time to Interactive (TTI):       ${report.audits['interactive'].displayValue}`);

console.log('\n📦 BUNDLE SIZE METRICS:');
console.log(`  Total Size:          ${(report.audits['total-byte-weight'].numericValue / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Main Thread Time:    ${report.audits['mainthread-work-breakdown'].displayValue}`);
if (report.audits['dom-size']) {
  console.log(`  DOM Size:            ${report.audits['dom-size'].displayValue}`);
}

console.log('\n🚨 OPPORTUNITIES (Potential Savings):');
const opportunities = Object.entries(report.audits)
  .filter(([key, audit]) => audit.details?.type === 'opportunity' && audit.numericValue > 0)
  .sort((a, b) => b[1].numericValue - a[1].numericValue)
  .slice(0, 5);

opportunities.forEach(([key, audit]) => {
  const savings = audit.numericValue / 1000;
  console.log(`  • ${audit.title}: ${savings.toFixed(2)}s potential savings`);
});

console.log('\n⚠️  DIAGNOSTICS (Issues Found):');
const diagnostics = Object.entries(report.audits)
  .filter(([key, audit]) => audit.details?.type === 'debugdata' || (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode === 'binary'))
  .slice(0, 5);

diagnostics.forEach(([key, audit]) => {
  if (audit.score !== null && audit.score < 0.9) {
    console.log(`  • ${audit.title}`);
  }
});

console.log('\n📈 RESOURCE SUMMARY:');
const resourceSummary = report.audits['resource-summary'];
if (resourceSummary?.details?.items) {
  resourceSummary.details.items.forEach(item => {
    const size = (item.size / 1024).toFixed(0);
    console.log(`  ${item.label}: ${item.requestCount} requests, ${size} KB`);
  });
}

console.log('\n');
