---
name: reverse-engineer
description: 逆向工程方法論：將目標專案的分析結果映射為 Prompt 架構（Agent 角色分解、Skill 邊界劃分、Workflow 設計），並提供模板生成規範與品質準則。
---

# Reverse Engineer — Prompt 架構設計方法論

此 Skill 提供將專案分析結果轉化為 Prompt 架構的方法論，包含 Agent 角色分解、Skill 邊界劃分、Workflow 設計模式與模板生成規範。

---

## Agent 角色分解

### 識別啟發式規則

從目標專案的開發流程中，依據以下信號識別需要的 Agent 角色：

| 信號 | 對應 Agent 類型 | 角色定位 |
|------|----------------|----------|
| 有設計稿（Figma / Sketch） | `builder` | 從設計稿切版 + 實作 UI |
| 有 PM 規格 / Confluence | `analysis` | 需求分析、找出遺漏 |
| 有測試規範 / 品質標準 | `qa` | 品質驗證、測試覆蓋 |
| 有 API 規格（Swagger / OpenAPI） | `api-builder` | API 層開發 |
| 有 CI/CD 流程 | `devops` | 部署、環境管理 |
| 有資料庫 Schema | `data-modeler` | 資料模型設計 |
| 有文件撰寫需求 | `docs` | 文件生成與維護 |

### 角色數量決策

| 專案複雜度 | 建議 Agent 數量 | 說明 |
|-----------|----------------|------|
| 簡單（單一 CRUD） | 1-2 | 一個 builder + 可選 qa |
| 中等（多功能模組） | 2-3 | analysis + builder + qa |
| 複雜（多團隊分工） | 3-5 | 依團隊角色拆分 |

### Agent 結構規範

每個 Agent 的 markdown 必須包含以下區塊：

```markdown
# 角色定位（一句話）

---

# 工作準則

Rules:
- [workflow-orchestration](../../workflow/common.md)
- [workspace-knowledge](../../skills/meta/{knowledge-skill}/SKILL.md)

---

# 前置參考

Skills:
- [{skill-name}](../../skills/{category}/{name}/SKILL.md) - 說明

---

# 工作流程總覽

| 階段 | 步驟 | 用途 |
|------|------|------|

---

# Phase A — ...
## 步驟 N. 步驟名稱
Skills:
- [引用的 skill]
理解後執行:
- 具體動作

---

# 注意事項
# 團隊通訊協議
```

**關鍵原則**:

- Agent 是流程編排者，不是知識持有者 — 知識放在 Skill
- Agent 的步驟描述應簡潔，細節委託給 Skill
- 每個 Agent 單檔不超過 500 行，超過則拆分 Skill

---

## Skill 邊界劃分

### 識別啟發式規則

從 Phase 1-4 的分析產出中，依據以下規則識別 Skill：

| 規則 | 條件 | 範例 |
|------|------|------|
| 重複出現 | 相同知識被 ≥ 2 個 Agent 引用 | 編碼規範、i18n 規則 |
| 獨立領域 | 具備獨立的知識體系 | 表單驗證、狀態管理 |
| 可跨 Agent 共用 | 非特定 Agent 專屬 | 測試策略、元件選型 |
| 步驟數 ≥ 5 | 一個面向有多個步驟 | API 開發流程 |
| 有參考文件 | 需要額外 reference 檔案 | 元件文件、API Schema |

### 分類對應

將識別出的 Skill 歸入以下分類：

| 目標專案模式 | Skill 類別 | 說明 |
|-------------|-----------|------|
| 檔案建立流程 / 腳手架 | `scaffolding/` | 接收規格後產出程式碼或檔案結構 |
| 編碼規範 / 審查準則 | `quality/` | 定義編碼標準、審查規則 |
| 元件選型 / 技術決策 | `reference/` | 提供決策表，不直接產出程式碼 |
| 測試生成 / 驗證 | `verification/` | 產出測試程式碼 |
| 問題修復流程 | `incident/` | Bug 診斷、修復流程 |
| 重複性任務 | `task/` | 自動化標準流程 |
| 外部工具整合 | `integration/` | 與第三方平台互動 |
| 知識管理 | `meta/` | 工作區知識、經驗回寫 |

### Skill 結構規範

```
{skill-name}/
├── SKILL.md           # 技能主檔案（必要）
│   ├── YAML frontmatter: name + description
│   └── Markdown 指令內容
└── references/        # 參考規範（選用）
    ├── {detail-1}.md
    └── {detail-2}.md
```

**SKILL.md 撰寫準則**:

- 開頭用一句話說明 Skill 用途
- 只放 Agent 執行時需要的知識，詳細參考放 references/
- 指令要明確可執行，不寫模糊的「建議」
- 優先用表格和清單，減少長段落
- 預估 SKILL.md < 300 行，超過則拆分 references

---

## Workflow 設計模式

### 結構

每個 Workflow 需包含：

1. **概述** — 一段話說明此 workflow 的目的
2. **代理人角色表** — Agent 名稱、定義檔案路徑、負責階段
3. **執行模式表** — 根據不同輸入組合，定義不同的執行流程
4. **Phase 定義** — 依序定義每個 Phase 的動作
5. **修復迴圈** — 錯誤處理與重試機制

### 設計原則

| 原則 | 說明 |
|------|------|
| 單向流水線 | Agent 間按順序傳遞，避免循環依賴 |
| 報告驅動 | Agent 間透過 markdown 報告傳遞結果，非即時通訊 |
| 可降級 | 某個 Phase 失敗時，應有降級方案（跳過 / 部分執行） |
| 可部分執行 | 支援只執行特定 Phase（例如只做分析不做開發） |
| 冪等 | 重複執行同一 Phase 應產出相同結果 |

### Common Workflow

每個專案都需要一個 `workflow/common.md`，包含所有 Agent 共用的規範：

- Plan Node Default（計畫模式）
- Subagent Strategy（子代理策略）
- Self-Improvement Loop（自我改進迴圈）
- Verification Before Done（完成前驗證）
- Task Management（任務管理）

---

## 從分析結果到 Prompt 架構的映射

### Step 1: 繪製角色 - 流程矩陣

從 Phase 2（架構分析）和 Phase 4（領域分析）中，繪製：

```
            Phase A    Phase B    Phase C    Phase D
Agent 1     ■ 收集      ■ 分析      □          □
Agent 2     □          □          ■ 實作      ■ 驗證
Agent 3     □          □          □          ■ 審查
```

- ■ = 該 Agent 在此 Phase 有工作
- □ = 無需此 Agent

### Step 2: 提取共用知識為 Skill

掃描矩陣中所有 ■ 的交集：

1. **多個 Agent 的 ■ 共用的知識** → 提取為 Skill
2. **單個 Agent 的 ■ 但步驟複雜** → 考慮提取為 Skill
3. **跨 Phase 需要的知識** → 提取為 Rules（workflow/common.md）

### Step 3: 設計傳遞契約

定義 Agent 間的輸入 / 輸出：

```
Agent A --[報告 A]--> Agent B --[報告 B]--> Agent C
                        ↑
                   [Skill X, Skill Y]
```

每份報告的格式（markdown）需在 meta/workspace-knowledge 中定義模板。

---

## 模板生成規範

### Agent 模板

生成的 Agent markdown 應遵循以下模式（詳見 [template-patterns.md](references/template-patterns.md)）：

- 角色定位開頭一句話
- Rules 引用 common workflow + 知識管理 skill
- Skills 引用按 Phase 分組
- 步驟標號連續，可跨 Phase
- 每個步驟有 Skills 引用 + 「理解後執行」區塊

### Skill 模板

生成的 SKILL.md 應遵循：

- YAML frontmatter 含 `name` + `description`
- description 要完整描述用途與觸發時機
- 內容只放執行所需的知識
- 詳細規範放 references/

### Workflow 模板

- 角色表列出所有 Agent 的定義檔路徑
- 執行模式表涵蓋所有輸入組合
- Phase 定義包含調用哪個 Agent、傳入什麼參數、期望什麼產出

---

## 品質準則

### 必要條件

- [ ] 每個 Agent 都有明確的一句話角色定位
- [ ] 每個 Agent 的 Rules 都引用了 common workflow
- [ ] 每個 Skill 的 SKILL.md 都有 YAML frontmatter
- [ ] Workflow 的 Phase 流程邏輯完整無斷裂
- [ ] 所有檔案間的相對路徑引用正確

### 品質指標

| 指標 | 目標 |
|------|------|
| Agent 角色重疊度 | 每個 Agent 的職責不與其他 Agent 重疊超過 20% |
| Skill 重用率 | 至少 50% 的 Skill 被 ≥ 2 個 Agent 引用 |
| 知識分散度 | 同一知識不在 ≥ 2 個 Skill 中重複出現 |
| 流程覆蓋率 | Workflow 覆蓋目標專案 ≥ 80% 的開發流程 |
