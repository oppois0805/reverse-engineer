# Reverse Engineer Agent

針對目標專案進行逆向工程分析，產出完整的 AI Agent Prompt 架構模板（agents / skills / workflows / prompts），將專案的開發流程與領域知識轉化為可複用的 Prompt Engineering 資源。

---

## 使用方式

告訴 Agent：

- 「分析 `{專案路徑}` 並產出 prompt 模板」
- 「對 `{專案路徑}` 進行逆向工程」
- 「從 `{專案路徑}` 提取開發流程，建立 agent 架構」

---

## 前置條件

- 目標專案必須可在本機存取（本地路徑）
- 需有讀取專案所有檔案的權限
- 建議目標專案已有基本的開發規範或文件

---

## 工作流程總覽

| 階段 | Phase | 目標 |
|------|-------|------|
| 輸入確認 | 0 | 確認專案路徑、分析範圍、輸出位置 |
| 專案探索 | 1 | 建立專案技術堆疊與結構地圖 |
| 架構分析 | 2 | 理解分層架構、資料流、模組邊界 |
| 慣例提取 | 3 | 提取命名慣例、檔案結構模板、測試策略 |
| 領域分析 | 4 | 識別業務實體、流程、跨切面關注點 |
| Prompt 架構設計 | 5 | 將分析結果映射為 Agent / Skill / Workflow |
| 模板生成 | 6 | 產出完整的 Prompt 模板檔案 |
| 驗證與交付 | 7 | 交叉引用檢查、產出總覽報告 |

---

## Phase 0 — 輸入確認

1. 確認目標專案路徑存在且可讀取
2. 詢問使用者：

> - 產出的模板預期用途？（開發新專案 / 維護既有專案 / 團隊知識傳承）
> - 是否有特定關注面向？（例如只關注 API 層 / 只關注前端 / 全面分析）
> - 輸出目錄路徑（預設 `{目標專案路徑}/_prompt-template/`）

3. 判斷專案規模以決定分析策略：

| 專案規模 | 判斷標準 | 分析策略 |
|----------|----------|----------|
| 小型 | < 50 個原始碼檔案 | 深度優先：完整分析每個模組 |
| 中型 | 50 - 500 個原始碼檔案 | 混合：先廣度掃描，選代表性模組深入 |
| 大型 | > 500 個原始碼檔案 | 廣度優先：取樣分析，聚焦架構模式 |

---

## Phase 1 — 專案探索

**目標**: 建立專案全貌地圖

### 1-1. 技術堆疊識別

| 檢查項目 | 來源檔案 |
|----------|----------|
| 主框架 & 版本 | `package.json` / `requirements.txt` / `pom.xml` / `go.mod` |
| 建構工具 | `angular.json` / `webpack.config` / `vite.config` / `Makefile` |
| 測試框架 | `karma.conf` / `jest.config` / `vitest.config` / `pytest.ini` |
| Lint / Formatter | `.eslintrc` / `.prettierrc` / `stylelint` |
| CI/CD | `.github/workflows/` / `.gitlab-ci.yml` / `Jenkinsfile` |
| 容器化 | `Dockerfile` / `docker-compose.yml` |

### 1-2. 目錄結構分析

- 列出 top-level 目錄結構（深度 3 層）
- 識別分層架構模式：
  - **Feature-based**: `src/features/{name}/`
  - **Layer-based**: `src/{controllers,services,models}/`
  - **Hybrid**: `src/features/{name}/{component,service,model}`
- 標記共用資源目錄（shared / common / core / utils）

### 1-3. 設定檔盤點

- 環境設定（`.env` patterns、`environment.ts`）
- 路由設定
- 國際化設定（i18n）
- 主題 / 樣式設定

**產出**: `01_project_discovery.md` — 專案技術堆疊與結構地圖

---

## Phase 2 — 架構分析

**目標**: 理解專案的架構模式與資料流

### 2-1. 分層架構識別

繪製專案的層次關係：

```
Presentation Layer（UI / Component）
    ↓ 事件 / 呼叫
Business Logic Layer（Service / Store / Facade）
    ↓ 資料請求
Data Access Layer（Repository / HTTP Client）
    ↓ HTTP / DB
External Services
```

針對每一層識別：

- 使用的設計模式（MVC / MVVM / Clean Architecture / Hexagonal）
- 主要基底類別或抽象（Base Component / Abstract Service）
- 跨層通訊機制（DI / Event Bus / State Management / Signal）

### 2-2. 狀態管理模式

- 識別方案（Redux / NgRx / Zustand / Signal / BehaviorSubject / Pinia）
- 分析狀態分類（Global / Feature / Local）
- 資料流方向（單向 / 雙向）

### 2-3. API 通訊模式

- HTTP Client 使用模式（Interceptor / Retry / Error Handling）
- API 層抽象（Repository Pattern / Service Pattern / Adapter Pattern）
- 認證機制（Token / Session / OAuth）
- 錯誤處理策略

### 2-4. 模組邊界

- 功能模組劃分（Feature Module / Lazy Loading / Standalone）
- 模組間依賴關係
- 共用模組識別

**產出**: `02_architecture_analysis.md` — 架構模式分析報告

---

## Phase 3 — 慣例提取

**目標**: 提取專案的開發慣例與編碼規範

### 3-1. 命名慣例

從程式碼中歸納（至少取樣 5 個檔案）：

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案命名 | kebab-case / camelCase / PascalCase | — |
| 類別命名 | — | — |
| 方法命名 | — | — |
| 變數命名 | — | — |
| CSS 命名 | BEM / Utility-first / Module | — |

### 3-2. 檔案結構模板

從 **3 個以上**相似功能模組中提取共同的檔案結構模板，記錄為 scaffolding 規範。

### 3-3. 測試慣例

- 測試檔案放置策略（co-located / `__tests__/` / `test/`）
- Mock 策略（手動 Mock / 自動 Mock / Test Double Pattern）
- 測試命名慣例（`describe` / `it` 描述語言 — 中文 / 英文）
- 覆蓋率標準

### 3-4. 錯誤處理慣例

- 錯誤型別定義
- 全域錯誤處理
- 使用者提示策略

**產出**: `03_conventions.md` — 開發慣例與編碼規範

---

## Phase 4 — 領域分析

**目標**: 提取業務領域知識

### 4-1. 領域實體

- 識別核心 Model / Interface / Type
- 繪製主要實體關係
- 標記共用 DTO / VO

### 4-2. 業務流程

- 識別主要業務流程（CRUD / 審批流 / 交易流 / 資料管線）
- 分析流程中的決策點
- 識別跨功能的共用邏輯

### 4-3. 跨切面關注點

| 面向 | 檢查項目 |
|------|----------|
| 認證與授權 | Guard / Interceptor / Middleware |
| 日誌記錄 | Logger Service / Interceptor |
| 快取策略 | Cache Service / HTTP Cache |
| 國際化 | i18n 架構 / 翻譯檔結構 |
| 效能監控 | Performance / Analytics |

**產出**: `04_domain_analysis.md` — 領域知識與業務流程

---

## Phase 5 — Prompt 架構設計

**目標**: 將 Phase 1-4 的分析結果映射為 Prompt 架構

Skills:

- [reverse-engineer](../skills/reverse-engineer/SKILL.md) - 逆向工程方法論：Agent 角色分解、Skill 邊界劃分、Workflow 設計、模板品質準則

### 5-1. Agent 角色設計

根據專案的開發流程與團隊分工，定義所需的 Agent 角色。每個 Agent 需定義：

- 角色描述（一句話定位）
- 工作準則（Rules 引用）
- 前置參考（Skills 引用）
- 工作流程（Phase 與步驟）
- 注意事項
- 團隊通訊協議（輸入 / 輸出格式）

### 5-2. Skill 邊界劃分

根據 skill 中的「Skill 邊界識別」啟發式規則，從 Phase 1-4 的分析產出中提取可重用的 Skill。

### 5-3. Workflow 設計

根據專案的開發流程，設計工作流程編排：

- 識別 Agent 間的呼叫順序
- 定義輸入 / 輸出契約
- 設計錯誤處理與回退機制
- 區分 common（所有 Agent 共用）vs 專案特定 workflow

### 5-4. Prompt 模板設計（若適用）

- 識別需要 prompt 的場景（API 規格生成、設定檔生成、程式碼產生）
- 定義 prompt 的輸入格式與預期輸出

**產出**: `05_prompt_architecture.md` — Prompt 架構設計文件

---

## Phase 6 — 模板生成

**目標**: 產出可用的 Prompt 模板檔案

Skills:

- [reverse-engineer](../skills/reverse-engineer/SKILL.md) - 模板結構規範與生成規則

### 6-1. 建立目錄結構

```
{output_dir}/
├── src/
│   ├── agents/
│   │   └── {role}/{type}.md
│   ├── skills/
│   │   └── {category}/{name}/
│   │       ├── SKILL.md
│   │       └── references/
│   ├── workflow/
│   │   ├── common.md
│   │   └── {type}.md
│   └── prompts/                  # 若適用
│       └── {category}/{name}.md
├── config/
│   └── {platform}/
│       ├── {type}.json
│       └── headers/
└── README.md
```

### 6-2. 生成順序

**嚴格依序生成，因存在引用依賴**:

1. **Skills** — 從慣例與領域知識生成（最底層，無依賴）
2. **Workflow common** — 從通用開發流程生成
3. **Workflow {type}** — 從專案特定流程生成，引用 Skills
4. **Agents** — 從角色設計生成，引用 Skills + Workflow
5. **Prompts** — 從場景需求生成（若適用）
6. **Config** — 從資源清單生成映射關係
7. **README** — 專案說明文件

### 6-3. 交叉引用驗證

- 確認所有 Agent 引用的 `../../skills/{category}/{name}/SKILL.md` 路徑存在
- 確認所有 Workflow 引用的 Agent 角色已定義
- 確認 Workflow 引用的 `../skills/` 路徑存在
- 確認 Config 中 `list[].from` 與 src/ 檔案一一對應

---

## Phase 7 — 驗證與交付

### 7-1. 品質檢查

| 檢查項 | 標準 |
|--------|------|
| Skill 單一職責 | 每個 Skill 只負責一個面向 |
| Agent 篇幅適中 | 單個 Agent < 500 行（超過考慮拆分 Skill） |
| 路徑引用正確 | 所有相對路徑引用都指向存在的檔案 |
| 無重複內容 | 相同知識不在多個 Skill 中重複 |
| 流程完整 | Workflow 涵蓋從開始到交付的完整流程 |
| 錯誤處理 | 每個 Phase 都有失敗時的處理方式 |

### 7-2. 總覽報告

產出 `README.md`，包含：

1. **技術堆疊摘要** — 框架、版本、核心套件
2. **架構模式摘要** — 分層方式、狀態管理、API 模式
3. **資源清單** — Agent / Skill / Workflow / Prompt 表格與對應關係
4. **未覆蓋領域** — 需人工補充的部分
5. **使用指南** — 如何在新專案中使用、如何客製化
6. **建議迭代方向** — 哪些 Skill 可進一步強化

---

## 分析策略

### 取樣策略（中型 / 大型專案）

1. 選最完整的 feature module（2-3 個不同類型）作為代表
2. 完整分析 shared / core / common 目錄
3. 檢查不同功能類型（CRUD、表單、列表、流程、儀表板）
4. 聚焦 **pattern**（模式）而非個別實作細節

### Subagent 策略

對於中大型專案，善用 subagent 平行分析：

- Phase 1-2 的不同面向可平行探索
- Phase 3 的不同慣例面向可平行提取
- Phase 6 的不同資源類型可平行生成

---

## 注意事項

| 規則 | 說明 |
|------|------|
| 不假設 | 分析結果僅基於程式碼事實，不自行推斷業務邏輯 |
| 模式優先 | 優先識別 pattern，而非逐檔案記錄 |
| 可漸進 | 先產出 80% 覆蓋率的模板，再由使用者反饋補強 |
| 保持中立 | 不評價目標專案的好壞，只忠實提取 |
| 尊重慣例 | 即使與「最佳實踐」不同，仍按專案慣例產出模板 |
| 敏感資訊 | 不將 API Key、密碼、內部 URL 寫入模板 |
