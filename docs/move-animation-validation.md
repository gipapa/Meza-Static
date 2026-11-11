# 進階招式批次驗證

驗證日期：2026-11-11。本次新增 75 招，完整目錄 78 招皆有獨立 scene、獨立 timeline 與作者紀錄。每招固定 60,000 ms、7 個階段；目錄與歸屬見 [招式清單](move-animation-status.md)。

依使用者指示，採用程式與瀏覽器技術檢查，未產生截圖。

| 檢查 | 結果 |
|---|---|
| 單元測試 | 28／28 通過，包含全目錄覆蓋、各招獨立 ID、60 秒規格、簡易模式與作者紀錄 |
| TypeScript／正式建置 | 通過 |
| ESLint | 0 errors；`BattleProjectile.tsx` 保留既有 Fast Refresh warning |
| 清單同步 | 78／78 招，`moves:status -- --check` 通過 |
| Skill 模板 | timeline、scene 編譯與 lint 通過 |
| 瀏覽器逐招驗證 | 78 招 × 敵我雙方 × 自訂圖片／emoji，共 312 情境、8,424 項檢查通過 |
| 跳過與設定切換 | 41／41 項通過 |

瀏覽器測試以 30 fps 手動步進完整 60 秒，檢查階段順序與時間邊界（設計時間 ±100 ms）、完成回呼恰好一次、角色圖片、cut-in／eye-catch、敵上我下、無翻轉、有限數值、粒子取樣、手機跳過按鈕與簡易版。自訂圖片使用 390px 視窗；emoji 使用 360px 並啟用 reduced motion。釋放、本體與終結會實際繪製取樣幀。

互動測試在七個階段分別跳過，確認關閉 overlay、取消待執行 cue、抑制重複完成與銷毀 scene；另確認設定變更會在下一次攻擊生效，播放中的版本保持穩定。

花瓣舞收尾粒子生成間隔由 40 ms 調整為 60 ms，四情境取樣峰值由 325–328 降為 241–244。原作者 Claude Code 保留，Codex 列為修訂者。驗證器亦改為等待 React 提交階段文字；等待期間引擎時計保持凍結，維持原本的時間邊界檢查。

建置仍有 Phaser 套件體積的 Vite 提醒；進階動畫維持 lazy loading。

重跑方式（瀏覽器檢查需先啟動 `npm run dev`）：

```sh
npm test
npm run lint
npm run build
npm run moves:status -- --check
node .claude/skills/advanced-move-animation/scripts/check-templates.mjs
node .claude/skills/advanced-move-animation/scripts/verify-cinematic.mjs --all --art both --no-screenshots --render-samples-only
node .claude/skills/advanced-move-animation/scripts/verify-interactions.mjs
```

`check-templates.mjs` 會暫建／清除測試 scene，請在瀏覽器驗證開始前執行。瀏覽器測試期間保持原始碼不變，以免 Vite 熱更新重載測試頁。
