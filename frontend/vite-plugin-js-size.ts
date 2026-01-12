import fs from "fs"
import { execSync } from "child_process"
import type { OutputBundle } from "rollup"

interface Options {
  file?: string
  watchBranches?: string[]
}

interface SizeReport {
  timestamp: string
  commit: string
  totalKb: number
}

let totalKb: number

export function jsSizeReporter(options: Options = {}) {
  const {
    file = ".js-build-size.json",
    watchBranches = [],
  } = options

  return {
    name: "js-size-reporter",
    generateBundle(
      _options: unknown,
      bundle: OutputBundle
    ) {
      let totalBytes = 0

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === "chunk") {
          totalBytes += Buffer.byteLength(chunk.code)
        }
      }

      totalKb = totalBytes / 1024
    },
    closeBundle() {
      let report: SizeReport[] = []

      if (fs.existsSync(file)) {
        try {
          const reportRaw = JSON.parse(fs.readFileSync(file, "utf8")) as SizeReport[]
          // I have no idea why this is necessary, but somehow entries without totalKb end up in the file
          report = reportRaw.filter(r => r && typeof r.totalKb === 'number')
        } catch {}
      }
      console.log(report)
      report.push(createSizeReport(totalKb))
      console.log(report)

      fs.writeFileSync(
        file,
        JSON.stringify(report, null, 2)
      )

      const branches = [...watchBranches]
      const origin = 'origin/' + getCurrentBranch()
      if (!branches.includes(origin)) {
        branches.push(origin)
      }

      console.log("\n")
      console.log('=== JS Bundle Size Report ===')
      console.log(`📦 JS size: ${totalKb.toFixed(2)} KB`)

      const branchReport = branches.map(branch => {
        const sha = getGitCommitSha(branch)
        const previousEntry = report
          .find(r => r.commit === sha)
        if (previousEntry) {
          return reportSizeChange(branch, previousEntry, totalKb)
        }
        return null
      }).filter(r => r != null)

      if (branchReport.length > 0) {
        console.log(frame('JS Bundle Size Change From', padColumns(branchReport)))
      }

      const lastRuns = report.slice(-5).map((r, index) => {
        return reportSizeChange(String(index + 1), r, totalKb)
      })

      if (lastRuns.length > 0) {
        console.log(frame(`Last ${lastRuns.length} build sizes`, padColumns(lastRuns)))
      }
    }
  }
}

function reportSizeChange(title: string, report: SizeReport, currentKb: number): string[] {
  const previousKb = report.totalKb
  const delta = currentKb - previousKb
  const sign = delta >= 0 ? "+" : ""
  return [
    title,
    `🕒 ${timeDelta(report.timestamp)}`,
    `📝 ${shortenCommitSha(report.commit)}`,
    `📅 ${report.timestamp}`,
    `📦 ${report.totalKb.toFixed(2)} KB (${sign}${delta.toFixed(2)} KB)`
  ]
}

function timeDelta(previous: string): string {
  const previousDate = new Date(previous)
  const now = new Date()
  const deltaMs = now.getTime() - previousDate.getTime()
  const deltaMinutes = Math.floor(deltaMs / 60000)
  const deltaHours = Math.floor(deltaMinutes / 60)
  const deltaDays = Math.floor(deltaHours / 24)

  if (deltaDays > 0) {
    return `${deltaDays}d ago`
  } else if (deltaHours > 0) {
    return `${deltaHours}h ago`
  } else if (deltaMinutes > 0) {
    return `${deltaMinutes}m ago`
  } else {
    return `just now`
  }
}

function padColumns(rows: string[][]): string {
  const colWidths = rows[0].map((_, colIndex) =>
    Math.max(...rows.map(row => row[colIndex].length))
  )

  return rows.map(row =>
    row.map((cell, colIndex) =>
      cell.padEnd(colWidths[colIndex])
    ).join(' │ ')
  ).join('\n')
}

function frame(title: string, body: string):string {
  const lines = body.split('\n');
  let maxLength = Math.max(title.length, ...lines.map(line => line.length));
  if ((maxLength - title.length) % 2 !== 0) {
    maxLength += 1; // Ensure even padding for title
  }
  
  const titlePadding = '─'.repeat((maxLength - title.length) / 2 + 1);
  const topBorder = '┌' + titlePadding + title + titlePadding + '┐\n';
  const bottomBorder = '└' + '─'.repeat(maxLength + 2) + '┘\n';
  const framedLines = lines.map(line => {
    const padding = ' '.repeat(maxLength - line.length);
    return `│ ${line}${padding} │\n`;
  }).join('');
  return topBorder + framedLines + bottomBorder;
}

function createSizeReport(totalKb: number): SizeReport {
  return {
    timestamp: new Date().toISOString(),
    commit: getGitCommitSha('HEAD'),
    totalKb
  }
}

function shortenCommitSha(sha: string): string {
  return getGitCommitSha(sha, '--short')
}

function getCurrentBranch(): string {
  return getGitCommitSha('HEAD', '--abbrev-ref')
}

function getGitCommitSha(branch: string, options: string = ''): string {
  try {
    const commit = execSync(`git rev-parse ${options} ${branch}`)
      .toString()
      .trim()
    return commit
  } catch {
    return "unknown"
  }
}
