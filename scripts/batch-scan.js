#!/usr/bin/env node
// MoltCops Batch Scanner — pulls public skills and scans them
// Usage: node batch-scan.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Import scan engine (transpiled inline since it's TS) ──
// We'll load the rules and scanner from the TS source directly via a simple approach:
// Just require the compiled version or re-implement the scanner in JS

const { execSync } = require('child_process');

// ── Config ──
const RESULTS_DIR = path.join(__dirname, '..', 'scans');
const TODAY = new Date().toISOString().slice(0, 10);
const RESULTS_FILE = path.join(RESULTS_DIR, `results-${TODAY}.json`);

// ── Scan Rules (ported from scan-engine.ts) ──
const SCAN_RULES = [
  { id: "PL-001", pattern: /(?:export|reveal|show|print|display|give)\s+(?:the\s+)?(?:private\s*key|seed\s*phrase|mnemonic|secret)/i, category: "Key Export", severity: "CRITICAL", description: "Attempts to extract or expose private key material", fix: "Never reference private keys in agent code. Use a keyring proxy (SIWA) for signing." },
  { id: "PL-040", pattern: /(?:transfer|send|drain|withdraw)\s+(?:all|entire|max|everything|remaining)/i, category: "Drain Pattern", severity: "CRITICAL", description: "Transfers entire balance — common in wallet drain attacks", fix: "Use specific, bounded amounts." },
  { id: "PL-041", pattern: /(?:set\s+)?(?:approval|allowance)\s+(?:to\s+)?(?:max|unlimited|infinity|MAX_UINT)/i, category: "Unlimited Approval", severity: "CRITICAL", description: "Grants unlimited token spending approval", fix: "Approve only the exact amount needed." },
  { id: "PL-045", pattern: /(?:after|when|once|if)\s*\(?\s*(?:\w+(?:count|Count|num|Num|total|Total|counter|Counter))\s*(?:>=?|===?|>)\s*\d+/i, category: "Sleeper Trigger", severity: "CRITICAL", description: "Conditional logic activates after N operations", fix: "Remove transaction-count-based conditionals." },
  { id: "PL-060", pattern: /(?:ignore|disregard|override)\s+(?:previous|prior|all)\s+(?:instructions|rules|policies|guidelines)/i, category: "Prompt Injection", severity: "HIGH", description: "Instruction override pattern", fix: "Sanitize all user input." },
  { id: "PL-075", pattern: /(?:revoke|remove|disable)\s+(?:all\s+)?(?:limits|restrictions|guards|safeguards|protections)/i, category: "Safety Removal", severity: "HIGH", description: "Attempts to disable safety mechanisms", fix: "Safety mechanisms should be immutable at runtime." },
  { id: "PL-081", pattern: /(?:send|post|transmit|exfiltrate|forward)\s+(?:to|toward)\s+(?:https?:\/\/|external|my\s+server)/i, category: "Data Exfiltration", severity: "MEDIUM", description: "Attempts to send data to an external endpoint", fix: "Whitelist allowed external endpoints." },
  { id: "PL-084", pattern: /(?:don'?t\s+(?:tell|inform|alert|notify|log|report))\s+(?:the\s+)?(?:user|owner|admin|anyone)/i, category: "Stealth Operation", severity: "MEDIUM", description: "Instructs agent to hide actions from user", fix: "All agent actions should be logged and auditable." },
  { id: "PL-085", pattern: /eval\s*\(|Function\s*\(|new\s+Function|setTimeout\s*\(\s*['"`]/i, category: "Code Injection", severity: "MEDIUM", description: "Dynamic code execution", fix: "Never use eval() or new Function()." },
  { id: "PL-087", pattern: /(?:0x[a-fA-F0-9]{40})/, category: "Hardcoded Address", severity: "LOW", description: "Hardcoded Ethereum address detected", fix: "Use named constants or config for addresses." },
  { id: "PL-042", pattern: /(?:0x)?f{64}/i, category: "MAX_UINT256 Constant", severity: "CRITICAL", description: "MAX_UINT256 value detected", fix: "Replace with specific bounded amounts." },
  { id: "PL-061", pattern: /(?:you\s+(?:are|must)\s+(?:now|actually)\s+(?:a|an)\s+(?:admin|root|system|owner))/i, category: "Identity Spoof", severity: "HIGH", description: "Attempts to reassign agent identity", fix: "Implement RBAC." },
  { id: "PL-062", pattern: /(?:emergency|urgent)\s+(?:override|bypass|skip\s+(?:check|confirm|verify|auth))/i, category: "Authority Bypass", severity: "HIGH", description: "Social engineering via urgency", fix: "Never bypass security checks." },
  { id: "PL-063", pattern: /(?:pretend|imagine|roleplay|act\s+as\s+if)\s+(?:you|there)\s+(?:are|is)\s+no\s+(?:rules|limits|policy|restrictions)/i, category: "Jailbreak Attempt", severity: "HIGH", description: "Jailbreak via roleplay", fix: "Maintain safety constraints regardless of framing." },
  { id: "PL-065", pattern: /(?:base64|hex|rot13|encode|decode)\s+(?:the\s+)?(?:key|secret|password|phrase|mnemonic)/i, category: "Encoding Trick", severity: "HIGH", description: "Extract secrets through encoding", fix: "Block encoding operations on sensitive data." },
  { id: "PL-070", pattern: /(?:admin|owner|deployer|system)\s+(?:has\s+)?(?:approved|authorized|confirmed|granted)/i, category: "False Authority", severity: "HIGH", description: "Claims authorization from non-present authority", fix: "Verify via cryptographic signatures." },
  { id: "PL-080", pattern: /(?:from\s+now\s+on|going\s+forward|remember\s+that|new\s+rule)\s+(?:you|the\s+system|your\s+instructions)/i, category: "Context Poisoning", severity: "MEDIUM", description: "Permanently alter agent behavior", fix: "Reset context between sessions." },
  { id: "PL-082", pattern: /(?:in\s+a\s+(?:hypothetical|test|sandbox|simulated)\s+(?:scenario|mode|environment|world))/i, category: "Sandbox Escape", severity: "MEDIUM", description: "Frames requests as hypothetical", fix: "Apply same safety rules regardless of framing." },
  { id: "PL-083", pattern: /(?:after|when|once)\s+\d+\s+(?:requests?|calls?|executions?|transactions?|swaps?|minutes?|hours?)/i, category: "Time/Count Trigger", severity: "MEDIUM", description: "Delayed execution based on time/count", fix: "Avoid time-based conditional logic." },
  { id: "PL-086", pattern: /process\.env|\.env\s+file|environment\s+variable|config\s*\[\s*['"](?:key|secret|password|token)/i, category: "Config Exposure", severity: "MEDIUM", description: "References environment variables or config secrets", fix: "Use a dedicated secrets manager." },
  { id: "MC-021", pattern: /(?:require|import|from)\s*\(?\s*['"](?:react-codeshift|left-pad2|event-stream2|colors\.js2|node-ipc2|ua-parser-jsx|lodash-es2|crossenv|mongose|electorn)\b/i, category: "Hallucinated Package", severity: "CRITICAL", description: "References a hallucinated/typosquat package", fix: "Verify every package exists before importing." },
  { id: "MC-022", pattern: /(?:require|import|from)\s*\(?\s*['"](?:axois|requets|bnabelcore|webpackk|babael|expresss|momnet|lodasg|chalke|inquierer)\b/i, category: "Typosquat Package", severity: "CRITICAL", description: "Package name resembles popular package", fix: "Double-check package spelling." },
  { id: "MC-023", pattern: /(?:--registry\s+https?:\/\/(?!registry\.npmjs\.org|registry\.yarnpkg\.com))|(?:publishConfig.*registry.*https?:\/\/(?!registry\.npmjs\.org))/i, category: "Dependency Confusion", severity: "CRITICAL", description: "Custom npm registry URL detected", fix: "Only use official registries." },
  { id: "MC-024", pattern: /(?:cat|read|load|open|include|source|import)\s+(?:.*\/)?\.(?:instruction|hidden|secret|system[-_]?prompt|agent[-_]?config|rules)\b/i, category: "Hidden Instruction File", severity: "HIGH", description: "References hidden instruction file", fix: "Only load config from documented paths." },
  { id: "MC-025", pattern: /(?:npm\s+install|pip\s+install|yarn\s+add|pnpm\s+add|gem\s+install|cargo\s+add)\s+(?:--global\s+|--save\s+|-g\s+)?[a-z]/i, category: "Unsafe Package Install", severity: "HIGH", description: "Dynamic package installation at runtime", fix: "Pre-install all dependencies at build time." },
  { id: "MC-026", pattern: /(?:show|print|display|output|reveal|repeat|echo)\s+(?:your\s+)?(?:system\s+prompt|instructions|initial\s+(?:prompt|instructions)|configuration|system\s+message|rules)/i, category: "System Prompt Extraction", severity: "HIGH", description: "Attempts to extract system prompt", fix: "Never expose system prompts." },
  { id: "MC-027", pattern: /```(?:system|instruction|prompt)\b|<\/?(?:system|instruction|prompt)>|={3,}\s*(?:SYSTEM|INSTRUCTION)|---\s*(?:BEGIN|START)\s+(?:SYSTEM|INSTRUCTION)/i, category: "Prompt Boundary Violation", severity: "HIGH", description: "Injection via prompt delimiters", fix: "Sanitize input for boundary markers." },
  { id: "MC-028", pattern: /(?:forget|discard|clear|wipe|reset)\s+(?:all\s+)?(?:previous|prior|earlier|above|existing)\s+(?:context|instructions|rules|messages|conversation|history)/i, category: "Instruction Override", severity: "HIGH", description: "Clears prior instructions", fix: "System instructions should be immutable." },
  { id: "MC-029", pattern: /(?:append|inject|insert|add|include)\s+(?:to|into|in)\s+(?:the\s+)?(?:system\s+prompt|instructions|context|memory|conversation\s+history)/i, category: "Context Injection", severity: "HIGH", description: "Injects content into system context", fix: "User input should never modify system context." },
  { id: "MC-030", pattern: /(?:send|post|forward|transmit|relay)\s+(?:your\s+)?(?:system\s+prompt|instructions|configuration|rules|initial\s+message)\s+(?:to|toward|at)\s/i, category: "Prompt Reflection", severity: "CRITICAL", description: "Exfiltrates system prompt externally", fix: "Never transmit system prompts externally." },
  { id: "MC-031", pattern: /(?:dns(?:lookup|resolve|query)|nslookup|dig)\s+.*\.|(?:burpcollaborator|oastify|interactsh|requestbin|webhook\.site|hookbin)\b/i, category: "DNS Exfiltration", severity: "CRITICAL", description: "DNS-based data exfiltration", fix: "Block DNS lookups from agent code." },
  { id: "MC-032", pattern: /(?:steganograph|stego|hide\s+(?:data|payload|message)\s+(?:in|inside|within)\s+(?:image|png|jpg|jpeg|audio|video))/i, category: "Covert Channel", severity: "HIGH", description: "Steganography or covert data channel", fix: "Strip metadata from outbound files." },
  { id: "MC-033", pattern: /(?:collect|gather|aggregate|accumulate|stage|buffer|batch)\s+(?:all\s+)?(?:data|files|credentials|tokens|keys|secrets|info)\s+(?:before|then|and\s+then|prior\s+to)\s+(?:send|exfil|transmit|upload|post)/i, category: "Data Staging", severity: "HIGH", description: "Stages data before bulk exfiltration", fix: "Monitor for data aggregation patterns." },
  { id: "MC-034", pattern: /(?:btoa|atob|Buffer\.from|base64(?:encode|decode|\.b64encode)|encodeURI(?:Component)?)\s*\(.*(?:key|secret|token|password|credential|private|mnemonic|seed)/i, category: "Encoded Exfiltration", severity: "HIGH", description: "Encoding sensitive data for exfiltration", fix: "Block encoding operations on sensitive data." },
  { id: "MC-035", pattern: /(?:webhook|callback|notify|ping|beacon)[-_]?(?:url|endpoint|hook)\s*(?:=|:)\s*['"]?https?:\/\/(?!(?:api\.github\.com|hooks\.slack\.com|discord\.com\/api))/i, category: "Webhook Abuse", severity: "MEDIUM", description: "Outbound webhook to unrecognized endpoint", fix: "Whitelist allowed webhook domains." },
];

function runScan(code, skillName) {
  const findings = [];
  const lines = code.split('\n');

  for (const rule of SCAN_RULES) {
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(rule.pattern);
      if (match) {
        findings.push({
          rule_id: rule.id,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          fix: rule.fix,
          line: i + 1,
          lineContent: lines[i].trim().slice(0, 200),
          match: match[0],
        });
        found = true;
        break;
      }
    }
    if (!found) {
      const fullMatch = code.match(rule.pattern);
      if (fullMatch) {
        const lineNum = code.substring(0, fullMatch.index).split('\n').length;
        findings.push({
          rule_id: rule.id,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          fix: rule.fix,
          line: lineNum,
          lineContent: lines[lineNum - 1]?.trim().slice(0, 200) || '',
          match: fullMatch[0],
        });
      }
    }
  }

  let score = 100;
  const costs = { CRITICAL: 20, HIGH: 10, MEDIUM: 5, LOW: 2 };
  for (const f of findings) score -= costs[f.severity] || 0;
  score = Math.max(0, score);

  return {
    skill_name: skillName,
    score,
    trust_tier: score > 80 ? 'TRUSTED' : score > 40 ? 'CAUTION' : score > 20 ? 'WARNING' : 'DANGER',
    findings: findings.sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.severity] - order[b.severity];
    }),
    stats: {
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
      total: findings.length,
      rules_checked: SCAN_RULES.length,
    },
  };
}

// ── GitHub Search ──
function githubSearch(query, page = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=30&page=${page}`;
    const opts = {
      headers: {
        'User-Agent': 'MoltCops-Scanner/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    // Add token if available
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
      opts.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`;
    }
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function fetchRaw(rawUrl) {
  return new Promise((resolve, reject) => {
    const mod = rawUrl.startsWith('https') ? https : http;
    mod.get(rawUrl, { headers: { 'User-Agent': 'MoltCops-Scanner/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchRaw(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchRepoFiles(owner, repo, skillPath) {
  // Get the directory listing for the skill
  const dir = path.dirname(skillPath);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`;
  
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'MoltCops-Scanner/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
      opts.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`;
    }
    https.get(apiUrl, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const items = JSON.parse(data);
          if (!Array.isArray(items)) { resolve([]); return; }
          // Filter to scannable files
          const files = items.filter(f => 
            f.type === 'file' && 
            /\.(ts|js|py|sh|md|yaml|yml|json|toml)$/i.test(f.name) &&
            f.size < 100000 // skip huge files
          );
          resolve(files.map(f => ({
            name: f.name,
            download_url: f.download_url,
            size: f.size,
          })));
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  console.log('🦀 MoltCops Batch Scanner');
  console.log('========================\n');
  
  // Ensure output dir
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const results = [];
  const seen = new Set();

  // ── Source 1: GitHub search ──
  console.log('📡 Searching GitHub for OpenClaw skills...');
  
  const queries = [
    'filename:SKILL.md openclaw',
    'filename:SKILL.md "agent" skill',
    'filename:SKILL.md clawhub',
  ];

  const repos = [];
  for (const q of queries) {
    try {
      const res = await githubSearch(q);
      if (res.items) {
        for (const item of res.items) {
          const key = `${item.repository.full_name}/${item.path}`;
          if (!seen.has(key)) {
            seen.add(key);
            repos.push({
              owner: item.repository.owner.login,
              repo: item.repository.name,
              full_name: item.repository.full_name,
              skill_path: item.path,
              html_url: item.html_url,
            });
          }
        }
      }
      // Rate limit pause
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
      console.log(`  ⚠️ Search failed for "${q}": ${e.message}`);
    }
  }

  console.log(`  Found ${repos.length} skill repos\n`);

  // ── Scan each skill ──
  const limit = 30;
  const toScan = repos.slice(0, limit);
  
  for (let i = 0; i < toScan.length; i++) {
    const skill = toScan[i];
    console.log(`[${i+1}/${toScan.length}] Scanning ${skill.full_name}...`);
    
    try {
      // Fetch all files in the skill directory
      const files = await fetchRepoFiles(skill.owner, skill.repo, skill.skill_path);
      
      if (files.length === 0) {
        console.log('  ⚠️ No scannable files found, skipping');
        continue;
      }
      
      // Fetch and concatenate all file contents
      let allCode = '';
      const fileNames = [];
      
      for (const file of files.slice(0, 20)) { // max 20 files per skill
        try {
          const content = await fetchRaw(file.download_url);
          allCode += `\n// === FILE: ${file.name} ===\n${content}\n`;
          fileNames.push(file.name);
          await new Promise(r => setTimeout(r, 500)); // rate limit
        } catch(e) {
          console.log(`  ⚠️ Failed to fetch ${file.name}`);
        }
      }
      
      if (!allCode.trim()) {
        console.log('  ⚠️ No content fetched, skipping');
        continue;
      }
      
      // Run scan
      const result = runScan(allCode, skill.full_name);
      result.source = 'github';
      result.url = `https://github.com/${skill.full_name}`;
      result.skill_path = skill.skill_path;
      result.files_scanned = fileNames;
      result.scan_date = new Date().toISOString();
      
      results.push(result);
      
      const icon = result.stats.critical > 0 ? '🔴' : result.stats.high > 0 ? '🟠' : result.stats.total > 0 ? '🟡' : '🟢';
      console.log(`  ${icon} Score: ${result.score}/100 | Findings: ${result.stats.total} (${result.stats.critical}C/${result.stats.high}H/${result.stats.medium}M/${result.stats.low}L)`);
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
      
    } catch(e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }

  // ── Summary ──
  console.log('\n═══════════════════════════════');
  console.log('SCAN COMPLETE');
  console.log('═══════════════════════════════');
  console.log(`Skills scanned: ${results.length}`);
  console.log(`Critical findings: ${results.reduce((s, r) => s + r.stats.critical, 0)}`);
  console.log(`High findings: ${results.reduce((s, r) => s + r.stats.high, 0)}`);
  console.log(`Medium findings: ${results.reduce((s, r) => s + r.stats.medium, 0)}`);
  console.log(`Low findings: ${results.reduce((s, r) => s + r.stats.low, 0)}`);
  console.log(`\nDanger: ${results.filter(r => r.trust_tier === 'DANGER').length}`);
  console.log(`Warning: ${results.filter(r => r.trust_tier === 'WARNING').length}`);
  console.log(`Caution: ${results.filter(r => r.trust_tier === 'CAUTION').length}`);
  console.log(`Trusted: ${results.filter(r => r.trust_tier === 'TRUSTED').length}`);

  // ── Save results ──
  const output = {
    scan_date: new Date().toISOString(),
    scanner: 'MoltCops Batch Scanner v1.0',
    rules_count: SCAN_RULES.length,
    skills_scanned: results.length,
    summary: {
      danger: results.filter(r => r.trust_tier === 'DANGER').length,
      warning: results.filter(r => r.trust_tier === 'WARNING').length,
      caution: results.filter(r => r.trust_tier === 'CAUTION').length,
      trusted: results.filter(r => r.trust_tier === 'TRUSTED').length,
      total_findings: results.reduce((s, r) => s + r.stats.total, 0),
    },
    results,
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${RESULTS_FILE}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
