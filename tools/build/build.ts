#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = process.cwd();

// ============ Build Settings ============

const CONFIG_DIR = "config";
const MCP_DIR = "mcp";
const OUTPUT_DIR = "dist";

// ============ Type Definitions ============

interface ResourceItem {
  from: string;
  to: string;
}

interface ResourceConfig {
  srcDir: string;
  outputDir: string;
  extension?: string;
  list?: ResourceItem[];
  copyAsIs?: boolean;
}

interface PathTransform {
  from: string;
  to: string;
}

interface PathsConfig {
  basePaths: PathTransform[];
}

interface PlatformConfig {
  resources: ResourceConfig[];
  paths?: PathsConfig;
  // type 和 headersDir 會自動推導，不需要在 JSON 中定義
}

interface LegacyResourceEntry {
  name: string;
  from: string;
}

interface LegacyPlatformConfig {
  agents?: LegacyResourceEntry[];
  skills?: LegacyResourceEntry[];
  workflow?: LegacyResourceEntry[];
  prompts?: LegacyResourceEntry[];
}

// ============ Helper Functions ============

/**
 * 從 srcDir 推導資源類型
 * 例如: "src/skills" → "skills", "src/agent" → "agent"
 * 這樣 outputDir 可以完全自由定義
 */
function getResourceType(resource: ResourceConfig): string {
  // 從 srcDir 取得最後一段路徑作為資源類型
  const parts = resource.srcDir.split(/[/\\]/);
  return parts[parts.length - 1];
}

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirectoryRecursive(src: string, dest: string): void {
  ensureDirectory(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getHeadersDir(platform: string): string {
  // 自動推導 headersDir: config/{platform}/headers
  return path.join(PROJECT_ROOT, CONFIG_DIR, platform, "headers");
}

function generatePathTransforms(config: PlatformConfig): PathTransform[] {
  const transforms: PathTransform[] = [];

  // 1. 添加 basePaths
  if (config.paths?.basePaths) {
    transforms.push(...config.paths.basePaths);
  }

  // 2. 從 skills 自動生成 skill 路徑轉換
  const skillsConfig = config.resources.find(
    (r) => getResourceType(r) === "skills",
  );
  if (skillsConfig?.list) {
    for (const skill of skillsConfig.list) {
      transforms.push({
        from: `${skill.from}/`,
        to: `${skill.to}/`,
      });
    }
  }

  return transforms;
}

function transformContent(
  content: string,
  transforms: PathTransform[],
): string {
  let result = content;

  for (const transform of transforms) {
    result = result.replaceAll(transform.from, transform.to);
  }

  return result;
}

function toUnixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

function stripMdExtension(p: string): string {
  return p.replace(/\.md$/i, "");
}

function normalizeLegacyItems(
  items: LegacyResourceEntry[] | undefined,
  expectedPrefix: string,
): ResourceItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  const prefix = `${toUnixPath(expectedPrefix)}/`;

  return items
    .map((item) => {
      const fromPath = toUnixPath(item.from);
      if (!fromPath.startsWith(prefix)) {
        return null;
      }

      let rel = fromPath.slice(prefix.length);
      rel = stripMdExtension(rel);
      rel = rel.replace(/\/SKILL$/i, "");

      return {
        from: rel,
        to: rel,
      };
    })
    .filter((item): item is ResourceItem => item !== null);
}

function normalizePlatformConfig(rawConfig: unknown): PlatformConfig {
  if (
    rawConfig &&
    typeof rawConfig === "object" &&
    Array.isArray((rawConfig as PlatformConfig).resources)
  ) {
    return rawConfig as PlatformConfig;
  }

  const legacy = (rawConfig || {}) as LegacyPlatformConfig;

  const resources: ResourceConfig[] = [
    {
      srcDir: "src/agents",
      outputDir: "agents",
      extension: ".md",
      list: normalizeLegacyItems(legacy.agents, "src/agents"),
    },
    {
      srcDir: "src/skills",
      outputDir: "skills",
      list: normalizeLegacyItems(legacy.skills, "src/skills"),
    },
    {
      srcDir: "src/workflow",
      outputDir: "workflow",
      extension: ".md",
      list: normalizeLegacyItems(legacy.workflow, "src/workflow"),
    },
    {
      srcDir: "src/prompts",
      outputDir: "prompts",
      extension: ".md",
      list: normalizeLegacyItems(legacy.prompts, "src/prompts"),
    },
  ].filter((resource) => (resource.list?.length ?? 0) > 0);

  return { resources };
}

// ============ Config Discovery ============

interface DiscoveredConfig {
  configPath: string;
  platform: string;
  type: string; // 從檔案名稱推導（library.json → library）
}

function discoverPlatformConfigs(): DiscoveredConfig[] {
  const configs: DiscoveredConfig[] = [];
  const configPath = path.join(PROJECT_ROOT, CONFIG_DIR);

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  找不到 config 目錄: ${configPath}`);
    return configs;
  }

  const platforms = fs.readdirSync(configPath, { withFileTypes: true });

  for (const platform of platforms) {
    if (!platform.isDirectory()) continue;

    const platformPath = path.join(configPath, platform.name);
    const files = fs.readdirSync(platformPath);

    for (const file of files) {
      if (file.endsWith(".json")) {
        // 從檔案名稱提取 type（移除 .json 副檔名）
        const type = path.basename(file, ".json");
        configs.push({
          configPath: path.join(platformPath, file),
          platform: platform.name,
          type: type,
        });
      }
    }
  }

  return configs;
}

function discoverMcpConfigs(): string[] {
  const mcpFolders: string[] = [];
  const mcpPath = path.join(PROJECT_ROOT, MCP_DIR);

  if (!fs.existsSync(mcpPath)) {
    console.warn(`⚠️  找不到 mcp 目錄: ${mcpPath}`);
    return mcpFolders;
  }

  const folders = fs.readdirSync(mcpPath, { withFileTypes: true });

  for (const folder of folders) {
    if (folder.isDirectory()) {
      mcpFolders.push(folder.name);
    }
  }

  return mcpFolders;
}

// ============ Resource Processing ============

function processSkills(
  config: PlatformConfig,
  resource: ResourceConfig,
  distBase: string,
  headersDir: string,
): number {
  if (!resource.list || resource.list.length === 0) {
    return 0;
  }

  const skillsOutputDir = path.join(distBase, resource.outputDir);
  const skillsSrcBase = path.join(PROJECT_ROOT, resource.srcDir);
  const skillsHeadersDir = path.join(headersDir, getResourceType(resource));
  const transforms = generatePathTransforms(config);

  let count = 0;

  for (const skill of resource.list) {
    const srcSkillPath = path.join(skillsSrcBase, skill.from);
    const destSkillPath = path.join(skillsOutputDir, skill.to);

    if (!fs.existsSync(srcSkillPath)) {
      console.warn(`  ⚠️  找不到 skill: ${srcSkillPath}`);
      continue;
    }

    // 複製整個 skill 目錄
    copyDirectoryRecursive(srcSkillPath, destSkillPath);

    // 處理 SKILL.md (合併 header + 轉換路徑)
    const skillMdPath = path.join(srcSkillPath, "SKILL.md");
    const destSkillMdPath = path.join(destSkillPath, "SKILL.md");
    // headers 使用 from 路徑結構（與 src 相同），檔名為最後一段
    const headerFileName = path.basename(skill.from) + ".md";
    const headerSubDir = path.dirname(skill.from);
    const headerPath = path.join(skillsHeadersDir, headerSubDir, headerFileName);

    if (fs.existsSync(skillMdPath)) {
      let content = fs.readFileSync(skillMdPath, "utf-8");

      // 移除原有的 YAML frontmatter
      content = content.replace(/^---[\s\S]*?---\s*\n?/, "");

      // 轉換路徑
      content = transformContent(content, transforms);

      // 合併 header (如果有)
      let finalContent = content;
      if (fs.existsSync(headerPath)) {
        const header = fs.readFileSync(headerPath, "utf-8");
        finalContent = header.trim() + "\n\n" + content.trim() + "\n";
      }

      fs.writeFileSync(destSkillMdPath, finalContent, "utf-8");
    }

    count++;
  }

  return count;
}

function processGenericResource(
  config: PlatformConfig,
  resource: ResourceConfig,
  distBase: string,
  headersDir: string,
  transforms: PathTransform[],
): number {
  if (!resource.list || resource.list.length === 0) {
    return 0;
  }

  const outputDir = path.join(distBase, resource.outputDir);
  const srcResourceBase = path.join(PROJECT_ROOT, resource.srcDir);
  const resourceHeadersDir = path.join(headersDir, getResourceType(resource));

  let count = 0;

  for (const item of resource.list) {
    const srcPath = path.join(srcResourceBase, `${item.from}.md`);
    const ext = resource.extension || ".md";
    const outputFileName = `${item.to}${ext}`;
    const destPath = path.join(outputDir, outputFileName);
    // headers 使用 from 路徑結構（與 src 相同），檔名為最後一段
    const headerFileName = path.basename(item.from) + ".md";
    const headerSubDir = path.dirname(item.from);
    const headerPath = path.join(resourceHeadersDir, headerSubDir, headerFileName);

    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️  找不到 ${getResourceType(resource)}: ${srcPath}`);
      continue;
    }

    let content = fs.readFileSync(srcPath, "utf-8");

    // 轉換路徑
    content = transformContent(content, transforms);

    // 合併 header (如果有)
    let finalContent = content;
    if (fs.existsSync(headerPath)) {
      const header = fs.readFileSync(headerPath, "utf-8");
      finalContent = header.trim() + "\n\n" + content.trim() + "\n";
    }

    ensureDirectory(path.dirname(destPath));
    fs.writeFileSync(destPath, finalContent, "utf-8");
    count++;
  }

  return count;
}

function processCopyAsIs(resource: ResourceConfig, distBase: string): number {
  const srcPath = path.join(PROJECT_ROOT, resource.srcDir);
  const destPath = path.join(distBase, resource.outputDir);

  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  找不到目錄: ${srcPath}`);
    return 0;
  }

  copyDirectoryRecursive(srcPath, destPath);
  return 1;
}

// ============ MCP Processing ============

function processMcpConfigs(mcpFolders: string[]): void {
  if (mcpFolders.length === 0) {
    return;
  }

  console.log(`\n┌────────────────────────────────────────┐`);
  console.log(`│  MCP Configurations                    │`);
  console.log(`└────────────────────────────────────────┘\n`);

  for (const folder of mcpFolders) {
    const srcDir = path.join(PROJECT_ROOT, MCP_DIR, folder);
    const destDir = path.join(PROJECT_ROOT, OUTPUT_DIR, MCP_DIR, folder);

    console.log(`  📦 處理 mcp/${folder}...`);

    if (!fs.existsSync(srcDir)) {
      console.warn(`     ⚠️  找不到: ${srcDir}`);
      continue;
    }

    copyDirectoryRecursive(srcDir, destDir);
    console.log(`     ✅ 完成`);
  }
}

// ============ Platform Building ============

function buildPlatform(discovered: DiscoveredConfig): void {
  const rawConfig = JSON.parse(fs.readFileSync(discovered.configPath, "utf-8"));
  const config: PlatformConfig = normalizePlatformConfig(rawConfig);

  // 自動推導 headersDir
  const headersDir = getHeadersDir(discovered.platform);

  console.log(`\n┌────────────────────────────────────────┐`);
  console.log(`│  ${discovered.platform}/${discovered.type}  `);
  console.log(`└────────────────────────────────────────┘\n`);

  // 使用資料夾名稱和檔案名稱推導路徑
  const distBase = path.join(
    PROJECT_ROOT,
    OUTPUT_DIR,
    discovered.platform,
    discovered.type,
  );
  const transforms = generatePathTransforms(config);

  let totalCount = 0;

  for (const resource of config.resources) {
    const resourceType = getResourceType(resource);
    console.log(`  📦 處理 ${resourceType}...`);
    let count = 0;

    if (resourceType === "skills") {
      count = processSkills(config, resource, distBase, headersDir);
    } else if (resource.copyAsIs) {
      count = processCopyAsIs(resource, distBase);
    } else {
      count = processGenericResource(
        config,
        resource,
        distBase,
        headersDir,
        transforms,
      );
    }

    if (resource.copyAsIs) {
      console.log(`     ✅ 完成`);
    } else {
      console.log(`     ✅ 成功: ${count} 個 ${resourceType}`);
      totalCount += count;
    }
  }

  console.log(`\n  總計: ${totalCount} 個資源已處理`);
}

// ============ Main ============

function main(): void {
  try {
    console.log("╔════════════════════════════════════════╗");
    console.log("║   Prompt 統一打包工具 v4.0 (Dynamic)   ║");
    console.log("╚════════════════════════════════════════╝");

    console.log(`\n📁 專案根目錄: ${PROJECT_ROOT}`);
    console.log(`📁 配置目錄: ${CONFIG_DIR}/`);
    console.log(`📁 MCP 目錄: ${MCP_DIR}/`);
    console.log(`📁 輸出目錄: ${OUTPUT_DIR}/`);

    // 1. 自動發現 config/{folder}/*.json
    const platformConfigs = discoverPlatformConfigs();

    if (platformConfigs.length === 0) {
      console.warn(`\n⚠️  在 ${CONFIG_DIR}/ 中未找到任何平台配置`);
    } else {
      console.log(`\n🔍 發現 ${platformConfigs.length} 個平台配置`);
      for (const config of platformConfigs) {
        console.log(`   - ${path.relative(PROJECT_ROOT, config.configPath)}`);
      }
    }

    // 2. 自動發現 mcp/{folder}
    const mcpFolders = discoverMcpConfigs();

    if (mcpFolders.length > 0) {
      console.log(`\n🔍 發現 ${mcpFolders.length} 個 MCP 配置`);
      for (const folder of mcpFolders) {
        console.log(`   - ${MCP_DIR}/${folder}`);
      }
    }

    // 3. 處理所有平台配置
    for (const config of platformConfigs) {
      buildPlatform(config);
    }

    // 4. 處理 MCP 配置
    processMcpConfigs(mcpFolders);

    // 5. 複製 src/README.md 到 dist/
    const srcReadme = path.join(PROJECT_ROOT, "src", "README.md");
    const distReadme = path.join(PROJECT_ROOT, OUTPUT_DIR, "README.md");
    if (fs.existsSync(srcReadme)) {
      fs.copyFileSync(srcReadme, distReadme);
      console.log("\n📄 已複製 README.md 到 dist/");
    }

    console.log("\n✨ 打包完成!\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : "發生未知錯誤";
    console.error(`\n❌ 錯誤: ${message}\n`);
    process.exitCode = 1;
  }
}

// Main Entry Check
const entryFile = process.argv[1];

if (
  entryFile &&
  (entryFile === __filename ||
    path.resolve(entryFile) === path.resolve(__filename))
) {
  main();
}
