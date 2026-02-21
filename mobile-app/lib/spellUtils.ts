export function schoolAndLevelLabel({ level, schoolIndex }: { level: number; schoolIndex: string }): string {
    const school = schoolIndex.replace(/\b\w/g, (match) => match.toUpperCase());

    if (level === 0) return `${school} Cantrip`;

    const suffixes: Record<number, string> = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };
    const suffix = suffixes[level] ?? 'th';

    return `${level}${suffix} level ${school}`;
}
