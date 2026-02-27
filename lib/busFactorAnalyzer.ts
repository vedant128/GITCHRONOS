import { CommitData, BusFactorResult } from './types';

export function analyzeBusFactor(commits: CommitData[]): BusFactorResult {
    const fileOwnership = new Map<string, Map<string, number>>(); // file -> (author -> changes)
    const authorTotalFiles = new Map<string, Set<string>>();

    commits.forEach(c => {
        if (!authorTotalFiles.has(c.author_name)) {
            authorTotalFiles.set(c.author_name, new Set());
        }

        c.filesChanged.forEach(fc => {
            authorTotalFiles.get(c.author_name)!.add(fc.fileName);

            if (!fileOwnership.has(fc.fileName)) {
                fileOwnership.set(fc.fileName, new Map());
            }

            const authorStats = fileOwnership.get(fc.fileName)!;
            authorStats.set(c.author_name, (authorStats.get(c.author_name) || 0) + fc.changes);
        });
    });

    // Determine primary owner of each file (owns > 50% of the changes to that file)
    let totalFiles = 0;
    const authorDominatedFiles = new Map<string, number>();

    fileOwnership.forEach((authorsMap, file) => {
        totalFiles++;
        let maxChanges = 0;
        let topAuthor = '';
        let totalFileChanges = 0;

        authorsMap.forEach((changes, author) => {
            totalFileChanges += changes;
            if (changes > maxChanges) {
                maxChanges = changes;
                topAuthor = author;
            }
        });

        // If top author made > 50% of changes, they "own" the file
        if (totalFileChanges > 0 && (maxChanges / totalFileChanges) >= 0.5) {
            authorDominatedFiles.set(topAuthor, (authorDominatedFiles.get(topAuthor) || 0) + 1);
        }
    });

    const ownershipData: { author: string; percentage: number; fileCount: number }[] = [];
    let highRiskAuthors = 0;

    authorDominatedFiles.forEach((fileCount, author) => {
        const percentage = (fileCount / totalFiles) * 100;
        ownershipData.push({ author, percentage, fileCount });
        if (percentage > 50) { // Owns > 50% of critical project files
            highRiskAuthors++;
        }
    });

    ownershipData.sort((a, b) => b.percentage - a.percentage);

    // Calculate Bus Factor (simplistic: array of top contributors owning at least 50% collectively)
    let busFactor = 0;
    let accumulatedOwnership = 0;
    for (const data of ownershipData) {
        busFactor++;
        accumulatedOwnership += data.percentage;
        if (accumulatedOwnership >= 50) {
            break;
        }
    }

    if (totalFiles === 0 || ownershipData.length === 0) {
        return { busFactor: 0, riskLevel: 'Low', singlePointOfFailureFiles: [], ownershipData: [] };
    }

    // Determine risk level based on Bus Factor
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (busFactor <= 1) riskLevel = 'High';
    else if (busFactor <= 2) riskLevel = 'Medium';

    // Collect some files that are highly owned by the #1 author as examples of single point of failures
    const spofFiles: string[] = [];
    if (ownershipData.length > 0 && riskLevel !== 'Low') {
        const topAuthor = ownershipData[0].author;
        fileOwnership.forEach((authorsMap, file) => {
            if (spofFiles.length >= 5) return;
            const changesByTopAuthor = authorsMap.get(topAuthor) || 0;
            const total = Array.from(authorsMap.values()).reduce((a, b) => a + b, 0);
            if (total > 0 && (changesByTopAuthor / total) > 0.8) {
                spofFiles.push(file);
            }
        });
    }

    return {
        busFactor,
        riskLevel,
        singlePointOfFailureFiles: spofFiles,
        ownershipData
    };
}
