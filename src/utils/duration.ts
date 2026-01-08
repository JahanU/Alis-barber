export function formatDuration(durationMinutes: number): string {
    if (!durationMinutes || Number.isNaN(durationMinutes)) {
        return '';
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    const parts: string[] = [];

    if (hours) {
        parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }

    if (minutes) {
        parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
    }

    return parts.join(' ') || '0 mins';
}
