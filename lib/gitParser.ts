import simpleGit from 'simple-git';
import { CommitData, FileChange } from './types';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function cloneAndParseRepo(repoUrl: string, branch?: string): Promise<CommitData[]> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitchronos-'));
    try {
        const git = simpleGit();
        if (branch) {
            await git.clone(repoUrl, tempDir, ['--branch', branch, '--single-branch']);
        } else {
            await git.clone(repoUrl, tempDir);
        }
        return await parseLocalRepo(tempDir);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}

export async function parseLocalRepo(dirPath: string): Promise<CommitData[]> {
    const git = simpleGit(dirPath);

    const rawLog = await git.raw([
        'log',
        '--first-parent',
        '--numstat',
        '--pretty=format:---COMMIT---%n%H%n%an%n%aI%n%B%n---ENDMESSAGE---'
    ]);

    return parseRawGitLog(rawLog);
}

function parseRawGitLog(raw: string): CommitData[] {
    const commits: CommitData[] = [];
    const parts = raw.split('---COMMIT---\n').filter(Boolean);

    for (const part of parts) {
        const endMsgIndex = part.indexOf('---ENDMESSAGE---');
        if (endMsgIndex === -1) continue;

        const headerAndMsg = part.substring(0, endMsgIndex).trim();
        const statPart = part.substring(endMsgIndex + '---ENDMESSAGE---'.length).trim();

        const lines = headerAndMsg.split('\n');
        const hash = lines[0];
        const author_name = lines[1];
        const date = lines[2];
        const message = lines.slice(3).join('\n');

        const filesChanged: FileChange[] = [];
        if (statPart) {
            const statLines = statPart.split('\n');
            for (const line of statLines) {
                const match = line.split('\t');
                if (match.length === 3) {
                    const insStr = match[0].trim();
                    const delStr = match[1].trim();
                    const fileName = match[2].trim();

                    const insertions = insStr === '-' ? 0 : parseInt(insStr, 10);
                    const deletions = delStr === '-' ? 0 : parseInt(delStr, 10);

                    if (!isNaN(insertions) && !isNaN(deletions)) {
                        filesChanged.push({
                            fileName,
                            insertions,
                            deletions,
                            changes: insertions + deletions
                        });
                    }
                }
            }
        }

        // Sort commits descending in the array based on date (they come this way usually from git log but let's just keep them ordered)
        // Actually git log outputs newest first. We might want oldest first for playback?
        // We can reverse it in the frontend or here. Let's keep raw format for now.
        commits.push({
            hash,
            author_name,
            date,
            message,
            filesChanged
        });
    }

    return commits;
}
