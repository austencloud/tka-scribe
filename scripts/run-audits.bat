@echo off
cd /d "F:\_THE KINETIC ALPHABET\_TKA-SCRIBE"

echo Starting 8 audit Claude instances...
echo.

start "Audit: Architecture" cmd /k claude -p "You are auditing this Svelte 5 + TypeScript codebase for ARCHITECTURE and PATTERNS. Focus on: (1) Service naming convention violations - should use *Detector, *Manager, *Loader etc NOT *Service suffix, (2) Barrel export violations - no index.ts re-exports, (3) Single responsibility violations - files doing too much, (4) DI container misuse, (5) State management anti-patterns - legacy stores vs runes. Scan the codebase systematically using grep and glob. Document ALL violations with file:line references. Create a prioritized remediation plan. Save your complete findings to docs/audits/ARCHITECTURE_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Type Safety" cmd /k claude -p "You are auditing this Svelte 5 + TypeScript codebase for TYPE SAFETY. Focus on: (1) 'any' usage and type assertions (as any, as unknown), (2) Missing return types on functions, (3) Implicit any in parameters, (4) Loose generic usage, (5) Non-strict null handling. Use grep to find violations systematically. Document all findings with file:line references and code snippets. Create a prioritized fix plan. Save findings to docs/audits/TYPE_SAFETY_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Security" cmd /k claude -p "You are auditing this Svelte 5 + Firebase codebase for SECURITY vulnerabilities. Focus on: (1) Firebase rules coverage - check deployment/firestore.rules and deployment/storage.rules for gaps, (2) XSS vectors - innerHTML, @html, unsanitized user input, (3) Auth state handling issues, (4) Secrets or API keys hardcoded in source, (5) Input validation at system boundaries, (6) CORS configuration. Rate each finding by severity (Critical/High/Medium/Low). Save to docs/audits/SECURITY_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Performance" cmd /k claude -p "You are auditing this Svelte 5 codebase for PERFORMANCE issues. Focus on: (1) Bundle size issues and tree-shaking blockers, (2) Unnecessary re-renders from $effect misuse - should use $derived when computing values, (3) Memory leaks - unsubscribed listeners, uncleaned effects, (4) N+1 Firebase queries, (5) Missing lazy loading opportunities, (6) Large synchronous operations blocking UI thread. Check vite.config.ts for build optimization issues. Save findings to docs/audits/PERFORMANCE_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Accessibility" cmd /k claude -p "You are auditing this Svelte 5 codebase for ACCESSIBILITY (WCAG 2.1 AA compliance). Focus on: (1) Touch target sizes - must be 48px minimum for interactive elements, (2) Color contrast violations, (3) Missing keyboard navigation on interactive elements, (4) Missing or incorrect ARIA attributes, (5) Focus management issues, (6) Motion safety - prefers-reduced-motion support, (7) Font sizes below 12px minimum. Check src/app.css for typography system. Save findings to docs/audits/ACCESSIBILITY_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: CSS Styling" cmd /k claude -p "You are auditing this Svelte 5 codebase for CSS and STYLING consistency. Focus on: (1) Hardcoded colors instead of --theme-* CSS variables, (2) Typography violations - not using --font-size-* tokens from design system, (3) Dead CSS that is never used, (4) Blur/glassmorphism overuse - should only be on modal backdrops per CLAUDE.md, (5) Inconsistent spacing - should use design tokens, (6) Legacy --*-current variables that should migrate to --theme-*. Check src/app.css and settings-tokens.css. Save findings to docs/audits/CSS_STYLING_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Error Handling" cmd /k claude -p "You are auditing this Svelte 5 + Firebase codebase for ERROR HANDLING. Focus on: (1) Unhandled promise rejections - missing .catch() or try/catch, (2) Firebase operations without error handling, (3) Silent failures with no user notification, (4) console.error without user-facing feedback, (5) Network failure handling, (6) Graceful degradation for offline scenarios. Document severity and user impact for each finding. Save to docs/audits/ERROR_HANDLING_AUDIT.md"

timeout /t 2 /nobreak > nul

start "Audit: Dependencies" cmd /k claude -p "You are auditing this codebase for DEPENDENCY health. Run npm audit and npm outdated first. Check for: (1) Security vulnerabilities in dependencies, (2) Severely outdated packages, (3) Unused dependencies still in package.json, (4) Duplicate dependencies, (5) License compliance issues, (6) Heavy dependencies that could be replaced with lighter alternatives. Analyze bundle size impact. Save findings to docs/audits/DEPENDENCIES_AUDIT.md"

echo.
echo All 8 audit instances launched!
echo Check each terminal window for progress.
echo Results will be saved to docs/audits/
pause
