import fs from "fs"
import type { OutputBundle } from "rollup"

type Options = {
  file?: string
  maxIncreaseKb?: number
}

let totalKb: number

export function jsSizeReporter(options: Options = {}) {
  const {
    file = ".js-build-size.json",
    maxIncreaseKb
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
      let previousKb: number | null = null

      if (fs.existsSync(file)) {
        try {
          previousKb = JSON.parse(fs.readFileSync(file, "utf8")).totalKb
        } catch {}
      }

      fs.writeFileSync(
        file,
        JSON.stringify({ totalKb }, null, 2)
      )

      if (previousKb !== null) {
        const delta = totalKb - previousKb
        const sign = delta >= 0 ? "+" : ""
        console.log(
          `📦 JS size: ${totalKb.toFixed(2)} KB (${sign}${delta.toFixed(2)} KB)`
        )

        if (
          maxIncreaseKb !== undefined &&
          delta > maxIncreaseKb
        ) {
          throw new Error(
            `❌ JS bundle grew by ${delta.toFixed(
              2
            )} KB (limit: ${maxIncreaseKb} KB)`
          )
        }
      } else {
        console.log(`📦 JS size: ${totalKb.toFixed(2)} KB (baseline)`)
      }
    }
  }
}

