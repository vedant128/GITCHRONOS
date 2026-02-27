import { CommitData, ProductivityResult } from './types';

export function analyzeProductivity(commits: CommitData[]): ProductivityResult {
    const dailyCommits = new Map<string, number>();
    const hourlyCommits = new Map<number, number>();

    let weekendCommits = 0;
    const totalCommits = commits.length;

    // Initialize hourly map to ensure all 24 hours exist
    for (let i = 0; i < 24; i++) {
        hourlyCommits.set(i, 0);
    }

    commits.forEach(commit => {
        const dateObj = new Date(commit.date);

        // 1. Commits per Day
        // Format YYYY-MM-DD
        const dayStr = dateObj.toISOString().split('T')[0];
        dailyCommits.set(dayStr, (dailyCommits.get(dayStr) || 0) + 1);

        // 2. Commits per Hour
        const hour = dateObj.getHours();
        hourlyCommits.set(hour, hourlyCommits.get(hour)! + 1);

        // 3. Weekend Activity
        const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendCommits++;
        }
    });

    // Formatting for Recharts
    // Only take the last 30 days of daily commits to keep the chart readable
    const sortedDays = Array.from(dailyCommits.keys()).sort();
    const recentDays = sortedDays.slice(-30);
    const commitsPerDay = recentDays.map(date => ({
        date,
        count: dailyCommits.get(date)!
    }));

    const commitsPerHour = Array.from(hourlyCommits.entries()).map(([h, count]) => {
        // format 0:00 -> "12 AM", 13:00 -> "1 PM"
        const hourLabel = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
        return {
            hour: hourLabel,
            count
        };
    });

    const weekendActivityPercentage = totalCommits > 0 ? (weekendCommits / totalCommits) * 100 : 0;

    return {
        commitsPerDay,
        commitsPerHour: commitsPerHour, // Array of {hour, count}
        weekendActivityPercentage: Math.round(weekendActivityPercentage)
    };
}
