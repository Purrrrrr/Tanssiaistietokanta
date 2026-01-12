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
  total: number
  biggestChunk: number
  chunks: Chunk[]
}

interface Chunk {
  name: string
  size: number
}

let totalKb: number
let report: SizeReport

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
      report = createSizeReport(bundle)
    },
    closeBundle() {
      let reports: SizeReport[] = []

      if (fs.existsSync(file)) {
        try {
          reports = JSON.parse(fs.readFileSync(file, "utf8")) as SizeReport[]
        } catch {}
      }
      if (report) {
        reports.push(report)
      }

      fs.writeFileSync(
        file,
        JSON.stringify(reports, null, 2)
      )

      const branches = [...watchBranches]
      const origin = 'origin/' + getCurrentBranch()
      if (!branches.includes(origin)) {
        branches.push(origin)
      }

      console.log("\n")
      console.log('=== JS Bundle Size Report ===')
      console.log(`📦 JS size: ${formatSize(report.total)}`)

      const branchReport = branches.map(branch => {
        const sha = getGitCommitSha(branch)
        const previousEntry = reports
          .find(r => r.commit === sha)
        if (previousEntry) {
          return formatReport(branch, previousEntry, report)
        }
        return null
      }).filter(r => r != null)

      if (branchReport.length > 0) {
        console.log(frame('JS Bundle Size Change From', padColumns(branchReport)))
      }

      const lastRuns = reports.slice(-5).map((r, index) => {
        return formatReport(String(index + 1), r, report)
      })

      if (lastRuns.length > 0) {
        console.log(frame(`Last ${lastRuns.length} build sizes`, padColumns(lastRuns)))
      }
    }
  }
}

function formatDelta(bytes: number): string {
  const sign = bytes >= 0 ? "+" : ""
  return sign + formatSize(bytes)
}

function formatSize(bytes: number): string {
  return (bytes / 1024).toFixed(2) + " KB"
}

function formatReport(title: string, previousReport: SizeReport, currentReport: SizeReport): string[] {
  const sign = currentReport.total - previousReport.total >= 0 ? "+" : ""
  return [
    title,
    `🕒 ${timeDelta(previousReport.timestamp)}`,
    `📝 ${shortenCommitSha(previousReport.commit)}`,
    `📅 ${previousReport.timestamp}`,
    `📦 ${formatSize(previousReport.total)} (${sign}${formatSize((currentReport.total - previousReport.total))})`,
    `Biggest chunk ${formatSize(previousReport.biggestChunk)} (${formatDelta((currentReport.biggestChunk - previousReport.biggestChunk))})`,
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

function createSizeReport(bundle: OutputBundle): SizeReport {
  let totalBytes = 0
  let biggestChunk = 0
  const chunks: Chunk[] = []

  for (const chunk of Object.values(bundle)) {
    if (chunk.type === "chunk") {
      const size = Buffer.byteLength(chunk.code)
      biggestChunk = Math.max(biggestChunk, size)
      totalBytes += size
      chunks.push({ name: chunk.fileName, size })
    }
  }

  return {
    timestamp: new Date().toISOString(),
    commit: getGitCommitSha('HEAD'),
    total: totalBytes,
    biggestChunk: biggestChunk,
    chunks,
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
