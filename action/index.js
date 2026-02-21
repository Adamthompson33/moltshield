const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════
// MoltCops GitHub Action — Scan PR files for agent vulnerabilities
// ═══════════════════════════════════════════════════════════════

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const SEVERITY_EMOJI = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '⚪' };

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const apiUrl = core.getInput('api-url');
    const apiKey = core.getInput('api-key');
    const filePatterns = core.getInput('file-patterns').split(',').map(p => p.trim());
    const failOn = core.getInput('fail-on').toUpperCase();

    const octokit = github.getOctokit(token);
    const context = github.context;

    // Only run on PRs
    if (!context.payload.pull_request) {
      core.info('Not a pull request — skipping scan.');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // Get changed files in PR
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner, repo, pull_number: prNumber, per_page: 100,
    });

    // Filter to skill-like files
    const extensions = ['.ts', '.js', '.py', '.md'];
    const changedFiles = files.filter(f => {
      if (f.status === 'removed') return false;
      return extensions.some(ext => f.filename.endsWith(ext));
    });

    if (changedFiles.length === 0) {
      core.info('No skill files changed in this PR — skipping scan.');
      return;
    }

    core.info(`Found ${changedFiles.length} files to scan.`);

    // Scan each file
    const allResults = [];
    let totalFindings = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    for (const file of changedFiles) {
      // Get file content
      let content;
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner, repo, path: file.filename,
          ref: context.payload.pull_request.head.sha,
        });
        content = Buffer.from(data.content, 'base64').toString('utf-8');
      } catch (e) {
        core.warning(`Could not read ${file.filename}: ${e.message}`);
        continue;
      }

      // Skip very small files (likely not skills)
      if (content.trim().length < 10) continue;

      // Call MoltCops API
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-MoltCops-Key'] = apiKey;

      let result;
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ code: content }),
        });

        if (!res.ok) {
          core.warning(`API returned ${res.status} for ${file.filename}`);
          continue;
        }

        result = await res.json();
      } catch (e) {
        core.warning(`API call failed for ${file.filename}: ${e.message}`);
        continue;
      }

      if (!result.success) continue;

      if (result.findings && result.findings.length > 0) {
        allResults.push({ file: file.filename, result });
        for (const f of result.findings) {
          totalFindings[f.severity] = (totalFindings[f.severity] || 0) + 1;
        }
      }
    }

    // Build PR comment
    const totalIssues = Object.values(totalFindings).reduce((a, b) => a + b, 0);
    const tier = apiKey ? 'Pro' : 'Free';
    const rulesChecked = allResults[0]?.result?.stats?.rulesChecked || (apiKey ? 20 : 10);
    const totalRules = allResults[0]?.result?.stats?.totalRulesAvailable || 20;

    let comment = '';

    if (totalIssues === 0) {
      comment = `## 🛡️ MoltCops Security Scan — Clean\n\n`;
      comment += `✅ **No security findings** across ${changedFiles.length} files (${rulesChecked} rules checked)\n\n`;
    } else {
      comment = `## 🛡️ MoltCops Security Scan\n\n`;
      comment += `| Severity | Count |\n|----------|-------|\n`;
      for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
        if (totalFindings[sev] > 0) {
          comment += `| ${SEVERITY_EMOJI[sev]} **${sev}** | ${totalFindings[sev]} |\n`;
        }
      }
      comment += `\n`;

      // Detail each file's findings
      for (const { file, result } of allResults) {
        comment += `### 📄 \`${file}\`\n`;
        comment += `Score: **${result.score}/100** · Trust: **${result.trustTier}**\n\n`;

        for (const finding of result.findings) {
          const emoji = SEVERITY_EMOJI[finding.severity];
          comment += `${emoji} **${finding.severity}**: ${finding.category}\n`;
          comment += `> ${finding.description}\n`;
          comment += `> Line ${finding.line}: \`${finding.lineContent.slice(0, 80)}\`\n`;
          comment += `> 💡 **Fix:** ${finding.fix}\n\n`;
        }
      }
    }

    // Upgrade hint for free tier
    if (!apiKey) {
      const upgrade = allResults[0]?.result?.upgrade;
      if (upgrade) {
        const missed = upgrade.missedCategories || [];
        comment += `---\n`;
        comment += `🔒 **${rulesChecked} of ${totalRules} rules checked** (Free tier)\n`;
        comment += `Upgrade to Pro for full coverage: ${missed.slice(0, 5).join(', ')}${missed.length > 5 ? `, +${missed.length - 5} more` : ''}\n`;
        comment += `→ [Get Pro](https://moltcops.com/pricing) · `;
      } else {
        comment += `---\n`;
        comment += `🔒 **${rulesChecked} of ${totalRules} rules checked** (Free tier) · `;
      }
    } else {
      comment += `---\n`;
      comment += `🛡️ **${rulesChecked} rules checked** (Pro tier) · `;
    }

    comment += `[MoltCops](https://moltcops.com) · Securing what your agent runs`;

    // Post or update PR comment
    const { data: comments } = await octokit.rest.issues.listComments({
      owner, repo, issue_number: prNumber,
    });
    const existing = comments.find(c => c.body?.includes('MoltCops Security Scan'));

    if (existing) {
      await octokit.rest.issues.updateComment({
        owner, repo, comment_id: existing.id, body: comment,
      });
      core.info(`Updated existing PR comment.`);
    } else {
      await octokit.rest.issues.createComment({
        owner, repo, issue_number: prNumber, body: comment,
      });
      core.info(`Posted new PR comment.`);
    }

    // Set outputs
    core.setOutput('findings', totalIssues);
    core.setOutput('critical', totalFindings.CRITICAL);
    core.setOutput('score', allResults[0]?.result?.score ?? 100);

    // Fail if configured
    if (failOn !== 'NONE' && SEVERITY_ORDER[failOn] !== undefined) {
      const shouldFail = Object.entries(totalFindings).some(([sev, count]) =>
        count > 0 && SEVERITY_ORDER[sev] <= SEVERITY_ORDER[failOn]
      );
      if (shouldFail) {
        core.setFailed(`MoltCops found ${totalIssues} findings (fail-on: ${failOn})`);
      }
    }

    core.info(`Scan complete: ${totalIssues} findings across ${changedFiles.length} files.`);

  } catch (error) {
    core.setFailed(`MoltCops Action failed: ${error.message}`);
  }
}

run();
