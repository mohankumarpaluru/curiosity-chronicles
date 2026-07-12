#!/usr/bin/env node
// Script to regenerate .quartz/plugins/index.ts without needing the full quartz config
// Run with: node --experimental-vm-modules gen-plugin-index.mjs
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLUGINS_CACHE_DIR = path.join(__dirname, ".quartz", "plugins")

const PLUGIN_TYPE_PATTERN =
  /Quartz(?:Emitter|Transformer|Filter|PageType)Plugin|QuartzComponentConstructor|\(.*\)\s*=>\s*QuartzComponent\b/

function resolveOriginalName(exportName, dtsContent) {
  const aliasPattern = new RegExp(`(\\w+)\\s+as\\s+${exportName}\\b`)
  const match = dtsContent.match(aliasPattern)
  return match ? match[1] : exportName
}

function isOverridableExport(name, dtsContent) {
  const declName = resolveOriginalName(name, dtsContent)
  const declPattern = new RegExp(`declare\\s+const\\s+${declName}\\s*:\\s*(.+?)(?:;|$)`, "m")
  const match = dtsContent.match(declPattern)
  if (!match) return false
  return PLUGIN_TYPE_PATTERN.test(match[1])
}

const INTERNAL_EXPORTS = new Set(["manifest", "default"])

function parseExportsFromDts(content) {
  const exports = []
  const exportMatches = content.matchAll(/export\s*{\s*([^}]+)\s*}(?:\s*from\s*['"]([^'"]+)['"])?/g)
  for (const match of exportMatches) {
    const fromModule = match[2]
    if (fromModule?.startsWith("@")) continue

    const names = match[1]
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
    for (const name of names) {
      const cleanName = name.split(" as ").pop()?.trim() || name.trim()
      if (cleanName && !cleanName.startsWith("_") && !INTERNAL_EXPORTS.has(cleanName)) {
        const finalName = cleanName.replace(/^type\s+/, "")
        if (name.includes("type ")) {
          exports.push(`type ${finalName}`)
        } else {
          exports.push(finalName)
        }
      }
    }
  }
  return exports
}

async function regeneratePluginIndex() {
  if (!fs.existsSync(PLUGINS_CACHE_DIR)) {
    console.log("No plugins cache dir found:", PLUGINS_CACHE_DIR)
    return
  }

  const pluginDirs = fs.readdirSync(PLUGINS_CACHE_DIR).filter((name) => {
    const pluginPath = path.join(PLUGINS_CACHE_DIR, name)
    return fs.statSync(pluginPath).isDirectory()
  })

  console.log(`Found ${pluginDirs.length} plugin directories`)

  const pluginExports = new Map()
  const nameCount = new Map()

  for (const pluginName of pluginDirs) {
    const pluginDir = path.join(PLUGINS_CACHE_DIR, pluginName)
    const distIndex = path.join(pluginDir, "dist", "index.d.ts")

    if (!fs.existsSync(distIndex)) {
      console.log(`⚠ Skipping ${pluginName}: no dist/index.d.ts found`)
      continue
    }

    const dtsContent = fs.readFileSync(distIndex, "utf-8")
    const exportedNames = parseExportsFromDts(dtsContent)
    const named = exportedNames.filter((e) => !e.startsWith("type "))
    const types = exportedNames.filter((e) => e.startsWith("type ")).map((e) => e.slice(5))

    const overridable = named.filter((n) => isOverridableExport(n, dtsContent))
    const passthrough = named.filter((n) => !isOverridableExport(n, dtsContent))

    if (overridable.length > 0 || passthrough.length > 0 || types.length > 0) {
      pluginExports.set(pluginName, { overridable, passthrough, types })
      for (const n of [...overridable, ...passthrough]) {
        nameCount.set(n, (nameCount.get(n) ?? 0) + 1)
      }
    }
    console.log(`✓ ${pluginName}: ${overridable.length} overridable, ${passthrough.length} passthrough, ${types.length} types`)
  }

  const lines = []
  lines.push(`import { componentRegistry } from "../../quartz/components/registry"`)
  lines.push("")

  for (const [pluginName, { types }] of pluginExports) {
    if (types.length > 0) {
      lines.push(`export type { ${types.join(", ")} } from "./${pluginName}"`)
    }
  }

  for (const [pluginName, { passthrough }] of pluginExports) {
    if (passthrough.length === 0) continue
    const unique = passthrough.filter((n) => (nameCount.get(n) ?? 0) === 1)
    if (unique.length > 0) {
      lines.push(`export { ${unique.join(", ")} } from "./${pluginName}"`)
    }
  }
  lines.push("")

  lines.push(`export const plugins: Record<string, Record<string, (...args: unknown[]) => void>> = {`)
  for (const [pluginName, { overridable }] of pluginExports) {
    if (overridable.length === 0) continue
    const escapedName = pluginName.replace(/"/g, '\\"')
    lines.push(`  "${escapedName}": {`)
    for (const n of overridable) {
      lines.push(
        `    ${n}: (...args: unknown[]) => { componentRegistry.setOptionOverrides("${escapedName}", args[0] as Record<string, unknown>); },`
      )
    }
    lines.push(`  },`)
  }
  lines.push(`}`)
  lines.push("")

  for (const [pluginName, { overridable }] of pluginExports) {
    if (overridable.length === 0) continue
    const unique = overridable.filter((n) => (nameCount.get(n) ?? 0) === 1)
    if (unique.length > 0) {
      const escapedName = pluginName.replace(/"/g, '\\"')
      for (const n of unique) {
        lines.push(`export const ${n} = plugins["${escapedName}"].${n}`)
      }
    }
  }
  lines.push("")

  const indexContent = lines.join("\n")
  const indexPath = path.join(PLUGINS_CACHE_DIR, "index.ts")
  fs.writeFileSync(indexPath, indexContent)
  console.log(`✓ Generated plugin index at ${indexPath}`)
  console.log(`  Total plugins exported: ${pluginExports.size}`)
}

regeneratePluginIndex().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
