# Reverse Engineer — AI Agent Prompt 逆向工程工具包

將任意目標專案進行逆向工程分析，自動產出完整的 AI Agent Prompt 架構模板（Agents / Skills / Workflows / Prompts），把專案的開發流程與領域知識轉化為可複用的 Prompt Engineering 資源。

---

## 專案用途

- **逆向工程現有專案** — 分析目標專案的技術堆疊、架構模式、開發慣例與業務領域，產出結構化的 Prompt 模板
- **建立 AI Agent 開發框架** — 將分析結果映射為 Agent 角色、Skill 知識模組、Workflow 流程編排
- **團隊知識傳承** — 把散落在程式碼中的隱性知識提取為可讀、可維護的 Prompt 資源

---

## 核心資源

| 類型 | 路徑 | 說明 |
|------|------|------|
| Agent | `tools/agents/reverse-engineer.md` | 逆向工程主 Agent，7 個 Phase 完整流程 |
| Agent | `tools/agents/prompt-sync-checker.md` | Prompt 資源同步檢查 Agent |
| Skill | `tools/skills/reverse-engineer/` | 逆向工程方法論（角色分解、Skill 劃分、Workflow 設計） |
| Skill | `tools/skills/skill-creator/` | Skill 建立指南 |
| Build | `tools/build/build.ts` | 建構工具，將 src 資源編譯至各平台產出格式 |
| MCP | `mcp/vscode/mcp.json` | VS Code MCP Server 設定 |

---

## 快速開始

### 1. 使用 Reverse Engineer Agent

在 VS Code 中透過 GitHub Copilot Chat 的 `reverse-engineer` 模式，對目標專案執行逆向工程：

```
分析 D:\Projects\my-app 並產出 prompt 模板
```

Agent 會依序執行 7 個 Phase：

1. **輸入確認** — 確認路徑、範圍、輸出位置
2. **專案探索** — 技術堆疊與目錄結構掃描
3. **架構分析** — 分層架構、狀態管理、API 模式
4. **慣例提取** — 命名規範、檔案結構、測試策略
5. **領域分析** — 業務實體、流程、跨切面關注點
6. **Prompt 架構設計** — 映射為 Agent / Skill / Workflow
7. **模板生成與驗證** — 產出檔案並交叉引用檢查

分析結果直接產出在目標專案根目錄。

### 2. 建構產出

```bash
npm run build
```

---

## 產出結構

逆向工程完成後，目標專案根目錄會產生以下結構：

```
{目標專案根目錄}/
├── src/
│   ├── agents/          # Agent 角色定義
│   ├── skills/          # 可重用知識模組
│   ├── workflow/        # 流程編排
│   └── prompts/         # Prompt 模板（若適用）
├── config/              # 平台設定
└── README.md            # 資源總覽
```

---

## 開發

```bash
# 安裝相依套件
npm install

# 建構
npm run build
```
