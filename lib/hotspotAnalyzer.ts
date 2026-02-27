import { CommitData, Hotspot, ContributorGraphData, ContributorNode, ContributorLink } from './types';

export function analyzeHotspots(commits: CommitData[]): Hotspot[] {
    const fileChurnMap = new Map<string, { changes: number, contributors: Set<string> }>();

    for (const commit of commits) {
        for (const file of commit.filesChanged) {
            // Exclude generic non-code files from hotspot heavy weighting if needed
            if (!fileChurnMap.has(file.fileName)) {
                fileChurnMap.set(file.fileName, { changes: 0, contributors: new Set() });
            }

            const stat = fileChurnMap.get(file.fileName)!;
            stat.changes += file.changes;
            stat.contributors.add(commit.author_name);
        }
    }

    const hotspots: Hotspot[] = [];
    for (const [fileName, stat] of fileChurnMap.entries()) {
        const contributorCount = stat.contributors.size;
        const score = stat.changes * contributorCount;

        hotspots.push({
            fileName,
            totalChanges: stat.changes,
            contributors: Array.from(stat.contributors),
            contributorCount,
            score
        });
    }

    return hotspots.sort((a, b) => b.score - a.score);
}

export function generateContributorGraph(commits: CommitData[]): ContributorGraphData {
    const nodeMap = new Map<string, ContributorNode>();
    const linkMap = new Map<string, ContributorLink>();

    const fileContributors = new Map<string, Set<string>>();

    for (const commit of commits) {
        if (!nodeMap.has(commit.author_name)) {
            nodeMap.set(commit.author_name, { id: commit.author_name, commitCount: 0 });
        }
        nodeMap.get(commit.author_name)!.commitCount += 1;

        for (const file of commit.filesChanged) {
            if (!fileContributors.has(file.fileName)) {
                fileContributors.set(file.fileName, new Set());
            }
            fileContributors.get(file.fileName)!.add(commit.author_name);
        }
    }

    for (const contributors of fileContributors.values()) {
        const arr = Array.from<string>(contributors);
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                const c1 = arr[i] as string;
                const c2 = arr[j] as string;
                // Ensure deterministic link keys
                const key = [c1, c2].sort().join('|');
                const [source, target] = [c1, c2].sort();

                if (!linkMap.has(key)) {
                    linkMap.set(key, { source, target, weight: 0 });
                }
                linkMap.get(key)!.weight += 1;
            }
        }
    }

    return {
        nodes: Array.from(nodeMap.values()),
        links: Array.from(linkMap.values())
    };
}
