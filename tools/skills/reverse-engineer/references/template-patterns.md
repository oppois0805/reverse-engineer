# Template Patterns — 模板範例

此文件提供各類資源的模板範例，供 Phase 6 生成時參考。

---

## Agent 模板範例

```markdown
你是 {role-name}，{一句話角色定位}。

---

# 工作準則

**開工前必須完整讀取並內化以下核心規範，這是所有行為的基礎：**

Rules:

- [workflow-orchestration](../../workflow/common.md) - 工作流程編排規範
- [workspace-knowledge](../../skills/meta/{knowledge-skill}/SKILL.md) - 知識管理

> ⚠️ 以上兩份規範非僅供參考——是必須內化的執行規則。

- 非簡單任務先進入 plan 模式
- 完成前必須驗證正確性

---

# 前置參考

Skills:

- [{skill-1}](../../skills/{category}/{name}/SKILL.md) - 說明
- [{skill-2}](../../skills/{category}/{name}/SKILL.md) - 說明

---

# 工作流程總覽

| 階段 | 步驟 | 用途 |
|------|------|------|
| Phase A — 準備 | 1-3 | ... |
| Phase B — 實作 | 4-8 | ... |
| Phase C — 完成 | 9-10 | ... |

---

# Phase A — 準備

## 1. 步驟名稱

Skills:

- [{skill}](../../skills/{category}/{name}/SKILL.md) - 說明

**理解後執行**:

- 具體動作 1
- 具體動作 2

---

# 注意事項

| 規則 | 說明 |
|------|------|
| 禁止假設 | 不確定時停止並詢問使用者 |

---

# 團隊通訊協議

## 接收輸入

- **來源:** workflow 或使用者
- **輸入格式:** ...

## 產出輸出

- **產出物:** 報告 / 程式碼
- **交付方式:** 寫入 `_workspace/{FEATURE_KEY}/` 或直接回報
```

---

## Skill 模板範例

```markdown
---
name: {skill-name}
description: {完整描述用途與觸發時機，這是 AI 判斷是否載入此 Skill 的唯一依據}
---

# {Skill 標題}

{一段話說明此 Skill 的用途}

---

## 適用時機

- 時機 1
- 時機 2

---

## 執行步驟

### Step 1: 步驟名稱

{具體指令}

### Step 2: 步驟名稱

{具體指令}

---

## 規範

| 規則 | 說明 |
|------|------|
| ... | ... |

---

## 範例

{程式碼或文件範例}
```

---

## Workflow 模板範例

```markdown
# Workflow — {專案類型} 開發流程

## 概述

{一段話描述此 workflow 的整體流程}

---

## 代理人角色

| 角色 | Agent 定義 | 負責階段 |
|------|-----------|----------|
| {role-1} | agents/{role-1}.md | Phase 1 |
| {role-2} | agents/{role-2}.md | Phase 2 |
| {role-3} | agents/{role-3}.md | Phase 3 |

---

## 執行模式

| 輸入組合 | 模式 | 執行流程 |
|----------|------|----------|
| 完整輸入 | Full | Phase 1 → 2 → 3 |
| 部分輸入 A | Mode A | Phase 2 → 3 |
| 部分輸入 B | Mode B | Phase 1 → 3 |

---

## Phase 0：環境確認

1. 確認專案類型與可用代理人
2. 讀取既有知識

---

## Phase 1：{名稱}

使用 Agent 工具呼叫 {role-1} 代理人：

- **agent 定義:** `agents/{role-1}.md`
- **prompt 內容:** {傳入參數}
- **產出:** {期望產出}
- **完成條件:** {判斷標準}

---

## Phase 2：{名稱}

使用 Agent 工具呼叫 {role-2} 代理人：

- **agent 定義:** `agents/{role-2}.md`
- **prompt 內容:** {傳入參數，含上一 Phase 產出}
- **產出:** {期望產出}

---

## 修復迴圈

- 最多重試 3 次
- 記錄失敗原因
- 超過重試次數則停止並回報
```

---

## Config JSON 模板範例

```json
{
  "resources": [
    {
      "srcDir": "src/skills",
      "outputDir": "skills",
      "list": [
        {
          "from": "{category}/{name}",
          "to": "{category}-{name}"
        }
      ]
    },
    {
      "srcDir": "src/agents",
      "outputDir": "agents",
      "list": [
        {
          "from": "{role}/{type}",
          "to": "{role}-{type}"
        }
      ]
    },
    {
      "srcDir": "src/workflow",
      "outputDir": "workflow",
      "list": [
        {
          "from": "common",
          "to": "common"
        },
        {
          "from": "{type}",
          "to": "{type}"
        }
      ]
    }
  ]
}
```

---

## Header 模板範例

### Agent Header

```markdown
---
name: "{role}_{type}"
description: "{角色中文描述}"
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
---
```

### Skill Header

```markdown
---
name: "{category}-{name}"
description: "{Skill 中文描述}"
---
```

### Prompt Header

```markdown
---
name: "{category}-{name}"
description: "{Prompt 中文描述}"
mode: "agent"
tools: ['vscode', 'execute', 'read', 'edit', 'search']
---
```

---

## 目錄結構模板

完整模板專案的目錄結構：

```
prompt-template/
├── README.md                          # 專案說明
├── src/
│   ├── agents/
│   │   ├── {role-a}/
│   │   │   └── {type}.md              # Agent 定義
│   │   └── {role-b}/
│   │       └── {type}.md
│   ├── skills/
│   │   ├── README.md                  # Skill 分類清單
│   │   ├── scaffolding/
│   │   │   └── {name}/
│   │   │       ├── SKILL.md
│   │   │       └── references/
│   │   ├── quality/
│   │   │   └── {name}/
│   │   │       └── SKILL.md
│   │   ├── reference/
│   │   │   └── {name}/
│   │   │       └── SKILL.md
│   │   ├── verification/
│   │   │   └── {name}/
│   │   │       └── SKILL.md
│   │   └── meta/
│   │       └── {name}/
│   │           ├── SKILL.md
│   │           └── references/
│   ├── workflow/
│   │   ├── common.md                  # 通用編排規範
│   │   └── {type}.md                  # 專案特定流程
│   └── prompts/                       # 若適用
│       └── {category}/
│           └── {name}.md
├── config/
│   └── {platform}/
│       ├── {type}.json                # 資源映射
│       └── headers/
│           ├── agents/{role}/{type}.md
│           ├── skills/{category}/{name}.md
│           └── prompts/{category}/{name}.md
└── tools/                             # 輔助工具（選用）
    └── build/
```
