# Meza-Static（Pokémon MEZASTAR 玩法參考）靜態網頁版規格書

> 本文件將先前整理的內容整理為單一 `spec.md`，供你實作「靜態網頁版本」時直接作為 PRD / Spec 使用。  
> 注意：本專案以「玩法節奏與互動體驗」為主，**不包含**官方素材或官方授權內容；建議以自製素材與可替換資料層實作。

---

## 目錄
- [0. 法務與素材邊界](#0-法務與素材邊界)
- [1. 產品定位與目標](#1-產品定位與目標)
- [2. 參考玩法要點整理（規格依據）](#2-參考玩法要點整理規格依據)
- [3. IA（資訊架構）與頁面清單](#3-ia資訊架構與頁面清單)
- [4. 核心使用流程（User Flow）](#4-核心使用流程user-flow)
- [5. UI 規格（每頁必備元件）](#5-ui-規格每頁必備元件)
- [6. 資料規格（JSON Schema 建議）](#6-資料規格json-schema-建議)
- [7. 戰鬥/捕捉的可實作演算法規格（靜態版）](#7-戰鬥捕捉的可實作演算法規格靜態版)
- [8. 本地儲存與靜態站限制對應](#8-本地儲存與靜態站限制對應)
- [9. 非功能需求（NFR）](#9-非功能需求nfr)
- [10. 前端技術規格（建議實作方式）](#10-前端技術規格建議實作方式)
- [11. 驗收標準（Acceptance Criteria）](#11-驗收標準acceptance-criteria)
- [12. 參考來源（References）](#12-參考來源references)

---

## 0) 法務與素材邊界

MEZASTAR 與 Pokémon 相關名稱/圖像涉及商標與版權。若你要做「靜態網頁版本」，建議採以下策略：

1. **UI/流程可借鏡，視覺素材自製**  
   - 不使用官方 Logo、官方插畫、官方介面截圖作為站內資產（可在 Spec 中註明參考來源，但實作素材要自製）。
2. **資料層可抽象化**  
   - 站內用通用名詞，例如 `Monster`、`Tag`。  
   - 或提供「使用者匯入 JSON」的機制（由使用者提供名稱與圖片）。
3. **非官方聲明**  
   - Footer 放上 Not affiliated / fan-made / no commercial use 等聲明。

---

## 1) 產品定位與目標

### 1.1 產品名稱
- 專案代號：**Meza-Static**
- 類型：**靜態網站（純前端）**，可選做成 PWA（離線、可安裝）。

### 1.2 目標
- 用網頁重現 MEZASTAR 的**核心體驗節奏**：  
  「選區域 → 戰鬥（選攻擊者 / Tag 推進）→ 轉盤/連打 → 捕捉 → 取得 Tag → 收藏管理」
- 不做：金流、真實機台定位、多人連線對戰、官方帳號系統。

### 1.3 目標使用者
- 想認識玩法的新手（教學導覽）
- 只想「收藏/圖鑑」與「抽到什麼 Tag」的收集玩家
- 想做展示或同人 UI 練習的前端開發者

---

## 2) 參考玩法要點整理（規格依據）

> 本章用來定義「需要模擬哪些互動」，內容以官方玩法描述作為參考。

### 2.1 模式
- **Battle and Catch 模式**：選區域與 Boss → 戰鬥 → 捕捉 → 取得 Tag  
- **Catch now 模式**：不戰鬥也能獲得新 Pokémon/Tag（此專案可做成「快速抽取/遭遇」）  
- （可選）**Special Tag Battle**：相鄰兩台合併大螢幕、兩人一起打；捕捉後兩人都能拿同一 Tag（靜態版可用「本地雙人」視覺模擬）

### 2.2 Tag 結構
- Tag 具有：**星等（★2~★6）**、**屬性 icon**、**強度（Pokénergy/PE）**、背面有 **HP/攻防速** 與 **招式/招式屬性** 等資訊
- ★5 是 Star、★6 是 Superstar（外觀更閃/更特殊）

### 2.3 戰鬥互動
- 戰鬥中會「選擇出招的 Pokémon」，方式是把 Tag **往前推**（靜態版可用滑動/按鈕）
- 有 **Attack Roulette**（轉盤停數字，數字越大攻擊越強）
- 有 **按鍵連打**（按越多攻擊越強）

### 2.4 捕捉互動
- **Last Catch Time**：三回合後或打倒 Boss 後觸發，可從 3 隻敵方中拿到 1 隻
- **Bonus Catch Time**：戰鬥結束後，停在草叢格、投球捕捉
- 投球有 **Ball Roulette**，有 4 種球（Poké/Great/Ultra/Master）

---

## 3) IA（資訊架構）與頁面清單

### 3.1 全站導航（Header）
- **Play**（開始遊戲/模式選擇）
- **Collection**（我的 Tag / 圖鑑）
- **Trainer**（個人資料/外觀/設定）
- **How to**（教學）
- **About**（非官方聲明/授權聲明）

### 3.2 路由（建議）
1. `/` 首頁（Hero + CTA）
2. `/play` 模式選擇（Battle & Catch / Catch Now / Special 模擬）
3. `/play/area` 區域選擇（含 Boss 預覽）
4. `/play/battle` 戰鬥主畫面
5. `/play/catch` 捕捉畫面（Last/Bonus + Ball Roulette）
6. `/result` 結果結算（獲得 Tag、可分享）
7. `/collection` 收藏總覽（卡牆）
8. `/collection/:tagId` Tag 詳情（正反面資訊）
9. `/trainer` Trainer 資料（外觀、暱稱、紀錄）
10. `/howto` 玩法教學（互動式導覽）
11. `/settings` 語言/音效/可及性/清資料

---

## 4) 核心使用流程（User Flow）

### 4.1 Battle & Catch Flow
1. Play → 選 **Battle & Catch**
2. 選 Area（顯示該區 Boss、可能掉落星等範圍）
3. 進 Battle：
   - 佈陣：選 1~3 個我方 Tag（沒 Tag 可用 Rental）
   - 每回合：選攻擊者（推進 Tag）→ Attack Roulette → 連打加成 → 計算傷害/捕捉槽
4. 進 Catch：
   - Last Catch Time（條件：三回合後或打倒 Boss）
   - Ball Roulette 決定球種 → 成功率計算 → 取得 Tag
   - Bonus Catch Time（草叢停格→投球）
5. Result → 加入收藏、若為 ★5/★6 顯示特效

### 4.2 Catch Now Flow
- 不戰鬥：選版本池/區域池 → 抽「遭遇」→ 直接進捕捉或直接給 Tag（依你想要更像哪種體驗）

### 4.3 Special Tag Battle（靜態模擬版）
- 單機雙人：兩邊各自選 Tag、各自轉 Attack Roulette  
- 規則建議：取 **兩者較高值**；Ball Roulette 取「較好球」

---

## 5) UI 規格（每頁必備元件）

### 5.1 首頁 `/`
- Hero（大標 + CTA「Start」）
- 三張卡：Battle & Catch / Catch Now / Collection
- Footer：非官方聲明、素材來源聲明

### 5.2 模式選擇 `/play`
- Mode Card × 3
- 每張卡顯示：簡介、預估耗時、可得獎勵類型（Star 機率）
- CTA：Start

### 5.3 區域選擇 `/play/area`
- Area Grid（至少 6 區）
- 每區塊顯示：
  - Boss 影像（自製或佔位圖）
  - 難度（★範圍）
  - 掉落池摘要（屬性偏好、Star 機率）
- 右側：我的隊伍（目前選的 1~3 Tag）

### 5.4 戰鬥頁 `/play/battle`（核心）

#### 版面（桌機 16:9）
- 上方：敵方三槽（左小怪 / 中 Boss / 右小怪）
- 中間：戰鬥資訊條
  - Turn 計數（最多 3 回合）
  - Catch Gauge（0~100）
  - Event 提示（例如 Everyone Attack，可做成彩蛋）
- 下方：我方三槽（Tag Lane 1~3）
  - 每槽：Tag 卡 + 「推進」互動（滑動/按鈕）
- 右側：Attack Roulette（旋轉動畫 + Stop）
- 右下：Mash Button（連打區）+ 連打計數 + 加成條

#### 互動規則
- 必須先選攻擊者（推進某 lane）才能 Stop Roulette
- Stop Roulette 後進入連打階段（2~3 秒倒數）
- 連打結束 → 顯示招式動畫（簡化）→ 更新 HP / Catch Gauge
- 回合結束條件：
  - Turn++，直到 3
  - 或 Boss HP ≤ 0（直接進 Catch）

### 5.5 捕捉頁 `/play/catch`
分成兩段（Tab 或自動流程）：

#### A. Last Catch Time
- 三張敵方卡（可選其一作為「目標」）
- Ball Roulette（4 球）+ Stop 按鈕
- 成功率顯示（可開關，避免太像作弊）
- 結果：Catch Success / Fail

#### B. Bonus Catch Time
- 草叢格子（例如 8 格）
- Cursor 自動輪巡 → Stop → 投球動畫

### 5.6 結果頁 `/result`
- 本局獲得 Tag（可翻面看資訊）
- 若為 ★5/★6，播放特效（自製）
- CTA：加入收藏、再玩一次、去收藏庫

### 5.7 收藏頁 `/collection`
- 卡牆（Grid）
- 篩選：星等（2~6）、屬性、Legendary/Mythical、版本
- 排序：最新、星等高→低、PE 高→低
- 點卡進詳情 `/collection/:id`

### 5.8 Tag 詳情 `/collection/:id`
- 正面：★、屬性 icon、PE、名稱
- 背面：HP/攻防速、招式與招式屬性
- 標籤：可 Dynamax / Mega / Z（用 icon 表示）

### 5.9 Trainer `/trainer`
- 建立 Trainer（暱稱 + Avatar）
- Avatar：40 種選項（用你自製的圖形或顏色組合）
- 統計：
  - 最高分（本地）
  - Star / Superstar 收集數（本地）

---

## 6) 資料規格（JSON Schema 建議）

### 6.1 Tag（核心）
```json
{
  "id": "tag_000123",
  "name": "Monster Name",
  "grade": 2,
  "isStar": false,
  "isSuperstar": false,
  "types": ["fire"],
  "pe": 120,
  "stats": { "hp": 120, "atk": 80, "def": 70, "spd": 60 },
  "move": { "name": "Flame Burst", "type": "fire", "power": 60 },
  "flags": {
    "legendary": false,
    "mythical": false,
    "dynamax": false,
    "mega": false,
    "zmove": false
  },
  "art": {
    "frontImage": "assets/tags/tag_000123_front.png",
    "backImage": "assets/tags/tag_000123_back.png"
  },
  "version": "v1",
  "source": "user"
}
```

### 6.2 Area / Boss
```json
{
  "areaId": "area_volcano",
  "name": "Volcano Area",
  "bossPool": ["mon_099", "mon_102"],
  "minGrade": 2,
  "maxGrade": 6,
  "dropRates": { "star": 0.06, "superstar": 0.02 }
}
```

### 6.3 Run（單局紀錄）
- `selectedTags[]`
- `turns[]`（每回合：`attackerLane`、`roulette`、`mashCount`、`damage`）
- `catchResult[]`（last/bonus）

---

## 7) 戰鬥/捕捉的可實作演算法規格（靜態版）

> 目標：做出「看起來像、玩起來順」的手感，而不是 100% 還原機台。

### 7.1 戰鬥回合
- 每局最多 3 Turn（對齊「三回合後可進 Last Catch Time」節奏）
- 每 Turn 流程：
  1) 玩家選 lane（推進 Tag）  
  2) Attack Roulette：產生 `R`（1~10）  
  3) Mash：在 2.5 秒內計次 `M`  
  4) 傷害  
     - `D = base * (1 + R/10) * (1 + clamp(M, 0, 60) / 200)`  
     - `base` 建議簡化：`atk + move.power + pe/10`
  5) 更新 Boss HP  
  6) Catch Gauge 增加：`D / bossMaxHp * 100`（上限 100）

### 7.2 Catch Chance 觸發
- 觸發條件（擇一）：
  - Boss HP ≤ 0
  - Turn == 3 結束
  - Catch Gauge == 100（可提早進入）

### 7.3 Ball Roulette 與成功率
- 球種：Poké / Great / Ultra / Master
- 建議成功率（可微調）：
  - Poké：`p = 0.35 + 0.25*(catchGauge/100)`
  - Great：`p = 0.50 + 0.30*(catchGauge/100)`
  - Ultra：`p = 0.65 + 0.30*(catchGauge/100)`
  - Master：`p = 1.0`
- 若失敗：
  - 可仍進 Bonus Catch Time（或設定保底：給 0~1 張普通 Tag，視你想不想更友善）

### 7.4 Bonus Catch Time（草叢）
- 草叢格數 `N = 8`
- Cursor 每 `150ms` 跳格，Stop 後決定落點
- 每格對應一隻「野怪池」候選
- 再投球一次（可省略 roulette、固定用 Poké）

---

## 8) 本地儲存與靜態站限制對應

### 8.1 儲存方式
- `localStorage`（簡單、好上手）
  - `trainerProfile`
  - `collectionTags[]`
  - `runHistory[]`
- 或 `IndexedDB`（收藏量大、圖片多時更穩）

### 8.2 分享/匯出（推薦做）
- 匯出收藏：下載 `collection.json`
- 匯入收藏：上傳 JSON（可選合併/覆蓋策略）

---

## 9) 非功能需求（NFR）
- **RWD**：手機直式顯示簡化版（戰鬥區改上下堆疊），桌機維持 16:9 Arcade 感
- **可及性**：全站可鍵盤操作；Roulette/連打提供替代操作（長按或空白鍵連點）
- **效能**：首屏 < 1.5MB（圖片延遲載入、webp、分包）
- **SEO**：`/howto`、`/about` 可被索引；遊戲頁可 `noindex`
- **離線**（可選）：Service Worker cache 基本資源

---

## 10) 前端技術規格（建議實作方式）
- 框架（任選）
  - **Astro / Vite + Vanilla**（最像靜態站）
  - **Next.js static export**（路由方便）
- 狀態管理：輕量（Zustand 或自寫 store）
- 動畫：CSS + requestAnimationFrame（Roulette/游標）
- 資料：`/data/*.json` + 使用者匯入覆蓋

### 建議資料夾結構
```text
/public
  /assets
  /data
/src
  /pages
  /components
  /lib (battle.ts, storage.ts, rng.ts)
  /styles
```

---

## 11) 驗收標準（Acceptance Criteria）
1. 使用者可完成一局 Battle & Catch：  
   選區域 → 3 回合內結束 → 進捕捉 → 取得 Tag → 出現在收藏庫
2. 收藏庫支援：  
   篩選星等/屬性、排序、查看 Tag 正反面資訊（★2~★6、屬性、PE、HP/攻防速、招式）
3. Trainer 可建立暱稱與 Avatar，並保存本地統計
4. 全站無後端、可部署到 GitHub Pages / Netlify / Vercel Static

---

## 12) 參考來源（References）
> 以下為先前整理時引用的參考頁面（僅作為玩法資訊依據）。

- Pokémon MEZASTAR（How to / Battle / Tag / After / Special Tag Battle 等頁面）
  - https://world.pokemonmezastar.com/my/howto/
  - https://world.pokemonmezastar.com/my/howto/battle.php
  - https://world.pokemonmezastar.com/my/howto/about_tag.php
  - https://world.pokemonmezastar.com/my/howto/after.php
  - https://world.pokemonmezastar.com/my/howto/sp_tag_battle.php
- Takara Tomy Arts MEZASTAR 專頁（系列資訊）
  - https://www.takaratomy-arts.co.jp/specials/pokemonmezastar/
- Starter / 相關 PDF（作為 UI/Avatar 數量與呈現參考）
  - https://webassets-pokemonmezastar.marv.jp/assets/img/PMMS_starter_all.pdf
