export function isMobile(): boolean {
    if (typeof navigator !== 'undefined') {
        return /Mobi|Android/i.test(navigator.userAgent);
    }
    return false;
    // return true; // For testing purposes, always return true
}

export function isPortrait(): boolean {
    if (typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined') {
        return window.matchMedia('(orientation: portrait)').matches;
    }
    return false;
}
