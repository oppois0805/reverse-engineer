# MCP Server 設定 (VS Code)

此目錄包含 **Model Context Protocol (MCP)** 設定檔，用於在 VS Code 中擴展 GitHub Copilot 的功能。

---

## 📦 包含內容

| 檔案       | 說明              |
| ---------- | ----------------- |
| `mcp.json` | MCP Server 設定檔 |

---

## 🚀 使用方式

### 步驟 1：複製設定檔

將 `mcp.json` 複製到您專案的 `.vscode/` 目錄下：

```
YourProject/
├── .vscode/
│   └── mcp.json    ← 放在這裡
├── src/
└── ...
```

### 步驟 2：重新啟動 VS Code

複製完成後，重新啟動 VS Code 以載入 MCP 設定。

### 步驟 3：使用 MCP 功能

在 GitHub Copilot Chat 中，您可以使用 MCP Server 提供的工具和資源。

---

## ⚙️ 設定說明

### 目前包含的 MCP Server

#### 1. Angular CLI MCP Server

```json
{
  "angular-cli": {
    "command": "npx",
    "args": ["-y", "@angular/cli", "mcp"]
  }
}
```

**功能**:

- 提供 Angular CLI 相關的 MCP 工具
- 支援 Angular 專案結構查詢
- 輔助 Angular 開發工作流

#### 2. PrimeNG MCP Server

```json
{
  "primeng": {
    "command": "npx",
    "args": ["-y", "@primeng/mcp"]
  }
}
```

**功能**:

- 提供 PrimeNG 元件相關資訊
- 支援 PrimeNG 元件用法查詢
- 輔助 PrimeNG 開發

---

## 📝 自訂 MCP Server

如需新增其他 MCP Server，請編輯 `mcp.json`，在 `servers` 物件中加入新的 server 設定：

```jsonc
{
  "servers": {
    "existing-server": { ... },
    "new-server": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"]
    }
  }
}
```

### 設定格式

| 欄位      | 類型     | 說明                     |
| --------- | -------- | ------------------------ |
| `command` | string   | 執行命令（通常為 `npx`） |
| `args`    | string[] | 命令參數                 |

---

## 🔗 相關資源

- [Model Context Protocol 官方文件](https://modelcontextprotocol.io/)
- [Angular CLI MCP](https://www.npmjs.com/package/@angular/cli)
- [PrimeNG MCP](https://www.npmjs.com/package/@primeng/mcp)

---

## 💡 注意事項

1. **首次使用**: MCP Server 會透過 `npx -y` 自動下載，首次使用可能需要等待下載完成。

2. **網路需求**: 使用 MCP Server 需要網路連線以下載必要套件。

3. **版本更新**: 使用 `npx -y` 會自動取得最新版本，無需手動更新。
