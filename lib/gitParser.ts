import { CommitData, FileChange } from './types';

function parseGitHubUrl(url: string) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Only GitHub URLs are supported in Serverless context.');
    let repo = match[2];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);
    return { owner: match[1], repo };
}

export async function cloneAndParseRepo(repoUrl: string, branch?: string): Promise<CommitData[]> {
    const { owner, repo } = parseGitHubUrl(repoUrl);

    // Setup headers (use GITHUB_TOKEN if available)
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitChronos-App'
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Limit to 40 commits to stay within API limits and 60s execution time
    let url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=40`;
    if (branch) {
        url += `&sha=${branch}`;
    }

    const listRes = await fetch(url, { headers });
    if (!listRes.ok) {
        const errData = await listRes.text();
        throw new Error(`Failed to fetch commits: ${listRes.status} ${errData}`);
    }

    const listJson = await listRes.json();
    if (!Array.isArray(listJson)) {
        throw new Error(`GitHub API returned invalid data (expected array).`);
    }

    const commits: CommitData[] = [];

    // Fetch details for each commit concurrently with a small concurrency limit or sequentially
    // Using sequential here since it's just 40 requests, which takes ~3-5 seconds and respects secondary rate limits
    for (const item of listJson) {
        const sha = item.sha;
        const detailUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;

        try {
            const detailRes = await fetch(detailUrl, { headers });
            if (!detailRes.ok) {
                console.warn(`Failed to fetch details for commit ${sha}`);
                continue;
            }
            const detailJson = await detailRes.json();

            const filesChanged: FileChange[] = [];
            if (detailJson.files && Array.isArray(detailJson.files)) {
                for (const f of detailJson.files) {
                    filesChanged.push({
                        fileName: f.filename,
                        insertions: f.additions || 0,
                        deletions: f.deletions || 0,
                        changes: f.changes || 0
                    });
                }
            }

            commits.push({
                hash: sha,
                author_name: item.commit.author.name,
                date: item.commit.author.date,
                message: item.commit.message,
                filesChanged
            });
        } catch (err) {
            console.error(`Error processing commit ${sha}:`, err);
        }
    }

    return commits;
}
