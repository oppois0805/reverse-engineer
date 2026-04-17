# Prompt Sync Checker Agent

當 `iwa-web-prompt` 專案中的任何 prompt 資源（agents / skills / prompts / workflow / claude-md）被新增、修改、刪除或更名時，使用此 Agent 產出一份完整的 **同步檢查清單**，確保所有相關檔案保持一致。

---

## 使用方式

告訴 Agent：「我剛修改了 `{檔案路徑}`」或「我想新增一個 `{資源名稱}`」，Agent 會根據變更類型自動產出對應的檢查清單。

---

## 專案架構速覽

```
src/                     ← 原始內容（唯一真實來源）
  agents/{role}/{type}.md
  workflow/{common|library|project}.md
  skills/{category}/{name}/SKILL.md
  prompts/{category}/{name}.md
  claude-md/{library|project}.md

config/{platform}/       ← 平台配置（github / claude / antigravity）
  {library|project}.json ← 資源映射 + 路徑轉換
  headers/               ← 平台專屬 YAML frontmatter
    agents/{role}/{type}.md
    skills/{category}/{name}.md
    prompts/{category}/{name}.md

tools/build/build.ts     ← 讀取 config → 合併 header + src → 輸出 dist/
```

### 關鍵規則

- **3 個平台** × **2 種專案類型** = 最多 6 個 config JSON 需同步
- **library 與 project 的 skill 集合不同**（library 有 `scaffolding/library`；project 有 `scaffolding/api`、`scaffolding/project`、`scaffolding/state-management`、`integration/confluence`）
- **prompts 只存在於 project 組**（library 無 prompts）
- **claude-md 只存在於 claude 平台**
- **antigravity 的 agents outputDir 是 `workflows`**（非 `agents`）
- 路徑轉換規則：`../../skills/` → `../skills/`（build 後目錄扁平化）

---

## 變更類型判定

根據被修改的檔案路徑，判定所屬變更類型：

| 檔案路徑模式 | 變更類型 |
|---|---|
| `src/skills/{category}/{name}/**` | SKILL 變更 |
| `src/agents/{role}/{type}.md` | AGENT 變更 |
| `src/workflow/*.md` | WORKFLOW 變更 |
| `src/prompts/{category}/{name}.md` | PROMPT 變更 |
| `src/claude-md/*.md` | CLAUDE-MD 變更 |
| `config/{platform}/*.json` | CONFIG 變更 |
| `config/{platform}/headers/**` | HEADER 變更 |

---

## 各類型同步檢查清單

### SKILL 變更

當 `src/skills/{category}/{name}/` 下的檔案有任何異動：

#### 內容修改（SKILL.md 更新）

1. **檢查 3 個平台 header 是否需更新**
   - `config/github/headers/skills/{category}/{name}.md`
   - `config/claude/headers/skills/{category}/{name}.md`
   - `config/antigravity/headers/skills/{category}/{name}.md`
   - 確認 `name` 和 `description` 是否仍然準確

2. **檢查引用此 skill 的 agents 是否需調整**
   - 搜尋 `src/agents/` 中所有包含此 skill 路徑的引用
   - 指令：`grep -r "{category}/{name}" src/agents/`

3. **檢查引用此 skill 的 workflows 是否需調整**
   - 搜尋 `src/workflow/` 中所有包含此 skill 路徑的引用

#### 新增 Skill

1. **建立 src 檔案**
   - `src/skills/{category}/{name}/SKILL.md`（必要）
   - `src/skills/{category}/{name}/references/`（選用）

2. **建立 3 個平台 header**
   - `config/{github,claude,antigravity}/headers/skills/{category}/{name}.md`
   - 格式：YAML frontmatter 含 `name` + `description`

3. **更新 config JSON（依適用範圍）**
   - 若適用 library：更新 3 個 `config/{platform}/library.json` 的 `resources[srcDir=src/skills].list[]`
   - 若適用 project：更新 3 個 `config/{platform}/project.json` 的 `resources[srcDir=src/skills].list[]`
   - 新增 `{ "from": "{category}/{name}", "to": "{category}-{name}" }`

4. **在 agents 中加入引用**（若需要）
   - 對應的 `src/agents/{role}/{type}.md` 加入 `../../skills/{category}/{name}/SKILL.md` 引用

#### 更名 / 刪除 Skill

1. **搜尋舊名稱殘留**
   - `grep -r "{舊名稱}" src/ config/`
   - 更新所有 agents、workflows 中的引用路徑
2. **更新或刪除 3 個平台 header**
3. **更新 6 個 config JSON**（移除舊映射、加入新映射）
4. **確認 `src/skills/README.md` 分類表**

---

### AGENT 變更

當 `src/agents/{role}/{type}.md` 有異動：

#### 內容修改

1. **檢查 3 個平台 header 是否需更新**
   - `config/{github,claude,antigravity}/headers/agents/{role}/{type}.md`
   - 確認 `name`、`description`、`tools` 清單是否仍然準確

2. **檢查 skill 引用一致性**
   - 確認 agent 中引用的所有 `../../skills/{category}/{name}/SKILL.md` 路徑都存在
   - 確認引用的 skill 都有在對應的 config JSON 中註冊

3. **檢查 claude-md 代理人團隊表**
   - `src/claude-md/{library|project}.md` 中的代理人角色表是否需更新

4. **檢查 workflow 代理人角色表**
   - `src/workflow/{library|project}.md` 中的代理人角色表是否需更新

#### 新增 Agent

1. **建立 src 檔案** — `src/agents/{role}/{type}.md`
2. **建立 3 個平台 header** — `config/{platform}/headers/agents/{role}/{type}.md`
3. **更新 config JSON** — 對應的 `resources[srcDir=src/agents].list[]`
4. **更新 claude-md** — `src/claude-md/{type}.md` 代理人團隊表
5. **更新 workflow** — `src/workflow/{type}.md` 代理人角色與流程編排

---

### WORKFLOW 變更

當 `src/workflow/{name}.md` 有異動：

#### 內容修改

1. **檢查 skill 引用一致性**
   - 確認引用的 `../skills/` 路徑在 build 後仍有效

2. **檢查 claude-md 工作流程連結**
   - `src/claude-md/{library|project}.md` 中引用 `workflow/{name}.md` 是否正確

3. **檢查 config JSON 映射**
   - 確認 `resources[srcDir=src/workflow].list[]` 中的 from/to 映射正確

#### 新增 Workflow

1. **建立 src 檔案** — `src/workflow/{name}.md`
2. **更新 config JSON** — 所有需要此 workflow 的 config JSON
3. **更新 claude-md** — 加入新 workflow 的引用連結

---

### PROMPT 變更

當 `src/prompts/{category}/{name}.md` 有異動：

#### 內容修改

1. **檢查 3 個平台 header 是否需更新**
   - `config/{github,claude,antigravity}/headers/prompts/{category}/{name}.md`

2. **檢查 prompt 間交叉引用**
   - 搜尋 `src/prompts/` 中是否有其他 prompt 引用此檔案
   - 特別注意：`core_service` ↔ `core_config`、`middleware_service` ↔ `middleware_config` 的關聯

#### 新增 Prompt

1. **建立 src 檔案** — `src/prompts/{category}/{name}.md`
2. **建立 3 個平台 header** — `config/{platform}/headers/prompts/{category}/{name}.md`
3. **更新 project 組 config JSON**（僅 project，library 無 prompts）
   - 3 個 `config/{platform}/project.json` 的 `resources[srcDir=src/prompts].list[]`
   - 新增 `{ "from": "{category}/{name}", "to": "{category}-{name}" }`

---

### CLAUDE-MD 變更

當 `src/claude-md/{type}.md` 有異動：

1. **確認 agent 引用路徑正確**
   - 檔案中的 `agents/{name}.md` 對應 config JSON 中 agent 的 `to` 值
2. **確認 workflow 引用路徑正確**
   - 檔案中的 `workflow/{name}.md` 對應 config JSON 中 workflow 的 `to` 值
3. **僅影響 claude 平台** — 確認 `config/claude/{type}.json` 中有 `claude-md` 資源區塊

---

### CONFIG 變更

當 `config/{platform}/{type}.json` 有異動：

1. **確認所有 `list[]` 中的 `from` 路徑在 src 中存在**
2. **確認所有 `list[]` 項目在 headers 中有對應檔案**
   - 路徑格式：`config/{platform}/headers/{resourceType}/{from 路徑結構}/{basename}.md`
3. **確認 `paths.basePaths` 與其他平台一致**（通常三個平台應相同）
4. **若改了某平台，考慮其他平台是否需同步**（除平台特定差異外，三個平台的資源清單應對齊）

---

## 驗證指令

完成所有同步調整後，執行以下驗證：

```bash
# 1. 建構全部平台，確認無錯誤
npm run build

# 2. 搜尋可能的斷鏈引用（被移除或更名的資源）
grep -rn "../../skills/" src/agents/ src/workflow/ | sort
grep -rn "../skills/" src/workflow/ | sort

# 3. 驗證 config JSON 與 header 檔案的對應
# 每個 config JSON 中 list[].from 都應有對應的 header 檔案

# 4. 驗證所有 config JSON 的 skill 清單是否跨平台一致
# （同類型的 library.json 之間、project.json 之間，skill list 應相同）
```

---

## 高影響變更警告

以下資源被大量引用，修改時需格外謹慎：

| 資源 | 被引用次數 | 影響範圍 |
|------|-----------|---------|
| `meta/workspace-knowledge` | 8 | 所有 agent + 所有 workflow |
| `workflow/common` | 6 | 所有 agent（作為 Rules） |
| `reference/component-strategy` | 6 | 所有 agent |
| `integration/figma-check` | 5 | 大多數 agent |
| `quality/performance` | 4 | builder + qa |
| `quality/i18n` | 4 | builder + qa |
| `quality/responsive` | 4 | builder + qa |
| `scaffolding/test-id` | 4 | builder + qa |
| `verification/test-component` | 4 | builder + qa |
| `verification/test-service` | 4 | builder + qa |
