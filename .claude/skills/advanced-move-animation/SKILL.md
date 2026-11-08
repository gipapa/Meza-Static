---
name: advanced-move-animation
description: 設計與實作 Meza-Static 的「進階招式動畫」（機器人大戰風、固定 60 秒的 Phaser cinematic）。當使用者要新增、修改、檢查某個招式的進階動畫／cut-in／蓄力演出，或詢問進階動畫架構、60 秒 timeline 規格、簡易／進階切換、emoji／自訂圖片 fallback 時使用。包含依屬性與招式名稱選擇主題的規則、timeline 規格、scene 模板、註冊步驟與驗證清單。
---

# 進階招式動畫（Advanced Move Animation）

每個有進階版的招式都是**一個獨立的 Phaser scene**，長度**固定 60 秒**，遵循同一個 7 段骨架。
沒有進階版的招式一律播放簡易版（`BattleScene`）。玩家在設定頁切換簡易／進階，預設簡易。

> 參考實作：花瓣舞（`reference/petal-dance.md`）。主題對照：`reference/type-themes.md`。
> 模板：`templates/`。驗證腳本：`scripts/`。

---

## 1. 架構（分層，由下往上）

| 層 | 檔案 | 職責 | 可否放招式專屬內容 |
|---|---|---|---|
| 規格（pure） | `src/phaser/cinematic/spec.ts` | 60 s、7 段骨架、各段秒數範圍、`validateAdvancedTimeline`、`defineAdvancedTimeline` | ✗ |
| Timeline（pure） | `timeline.ts`、`<id>Timeline.ts`、`timelines.ts` | phase 排列；`CINEMATIC_TIMELINES` 是合法 id 的唯一來源（`CinematicId`） | 每招一個 `<id>Timeline.ts` |
| 招式對應（pure） | `moveAnimations.ts` | 招式名稱 → `CinematicId`；`resolveMoveAnimation(move, quality)` 決定簡易／進階 | 只放對應表 |
| 共用效果 | `fx.ts` | cut-in、eye-catch、集中線、速度線、letterbox、閃光、光環、蓋章、斬擊、聚氣、粒子工具 | ✗（兩個以上招式會用才放這裡） |
| 立繪 | `src/phaser/actorArt.ts` | `addActorSprite()`：自訂圖片或屬性 emoji；`baseScale()` | ✗ |
| 基底 scene | `CinematicScene.ts` | 2× 解析度、雙相機（世界／UI）、tween 時鐘 cue、相機 helper、`attacker/defender`、60 s 時呼叫 `onComplete` | ✗ |
| 招式 scene | `<Name>Scene.ts` | 該招的 sets、配色、母題、所有演出 | ✓ 全部放這裡 |
| 註冊 | `registry.ts` | `CinematicId` → `{ key, scene, timeline }`（型別強制每個 timeline 都有 scene） | 每招一行 |
| React 入口 | `MoveAnimationOverlay.tsx`、`AdvancedMoveOverlay.tsx` | 依設定選版本、預先解析自訂圖片（`useActorArt`，最多等 1.2 s）、lazy 載入、跳過按鈕 | ✗ 不要改 |

**禁止**：在任何共用檔案（`CinematicScene`、`fx.ts`、`AdvancedMoveOverlay`、`MoveAnimationOverlay`）裡寫 `if (moveName === '...')` 之類的招式分支。招式差異只能存在於該招的 scene 與 timeline。

### 不能破壞的既有行為
1. **簡易／進階切換**：`resolveMoveAnimation` 只在 `quality === 'advanced'` 且招式有對應時回傳 advanced；其餘全部 simple。選擇在 overlay 掛載時固定。
2. **只對應完成的招式**：`ADVANCED_MOVE_ANIMATIONS` 只能放已完成、驗證過的招式。不要為了示範加半成品或空 scene。
3. **立繪 fallback**：立繪一律用 `addActorSprite(scene, x, y, actor, fontPx, { resolution: 2 })`，`actor` 直接傳 `this.attacker`／`this.defender`／`this.d.enemy`／`this.d.ally`（含 `emoji`、`art`、`artKey`）。不要自己 `add.text(emoji)` 或載入圖片；scene 內不得做任何非同步載入。cut-in／eye-catch 用 `{ ...this.attacker, ... }`。
4. **敵我方向**：雙人鏡頭敵方在上、我方在下（`resolveBattleLayout`）；cut-in 我方從左、敵方從右（`fromLeft: this.d.isPlayerAttacking`）。不要 flip 或用負 scale。
5. **跳過**：使用者可隨時跳過，`onComplete` 只會觸發一次（由 overlay 與 `finish()` 保證）。scene 不要自行呼叫 `onComplete`。

---

## 2. 60 秒 timeline 規格

總長**必須剛好 60 000 ms**（`ADVANCED_MOVE_DURATION_MS`），7 段依序、首尾相接。第 5 段是招式本體，id 由招式自訂（kebab-case，不可與固定 id 重複），其餘 id 固定。

| # | id | 用途 | 預設 | 允許範圍 |
|---|---|---|---|---|
| 1 | `intro` | 雙人鏡頭、ATTACK 警告帶、推近攻擊方 | 5 s | 3–6 s |
| 2 | `cutin` | 攻擊方 cut-in 台詞 → 招式名稱標題卡 | 8 s | 6–10 s |
| 3 | `charge` | 攻擊方特寫：集中線、聚氣、量表、eye-catch、白閃 | 11 s | 8–13 s |
| 4 | `release` | 爆發 → 能量從攻擊方送往防守方 | 4 s | 3–6 s |
| 5 | *本體 id*（花瓣舞：`storm`） | 招式本體：≥3 波命中、HIT 計數、切回攻擊方再回目標 | 16 s | 12–20 s |
| 6 | `finale` | 終結技名稱、第二次 eye-catch、最大衝擊 | 9 s | 7–11 s |
| 7 | `aftermath` | 餘韻、TOTAL DAMAGE、FINISH、letterbox 收回、淡出 | 7 s | 5–8 s |

- 用 `defineAdvancedTimeline([...])` 定義，違規時 import 就會丟錯，`npm test` 也會檢查每個註冊的 timeline。
- **執行期容許誤差**：以 deterministic frame stepping（30 fps、假 `Date.now`）驗證時，每個 phase 起點與 `onComplete`（60 s）必須落在設計時間 **±100 ms**（`RUNTIME_TOLERANCE_MS`）內，且 `onComplete` 只觸發一次。實機即時播放時，掉幀會被 Phaser lag smoothing 拉長，這是可接受的；cue 與 tween 共用同一個 tween 時鐘，永遠不會互相錯位。
- Phase 內的 cue 最晚不要超過該 phase 結束前 200 ms，避免跨段殘留。

---

## 3. 依招式名稱與屬性決定演出

1. **讀資料**：`grep -n "name: '<招式>'" src/data/monsters.ts` 確認招式名稱（必須完全一致）、`type` 與會用這招的怪獸。
2. **屬性基底**：在 `reference/type-themes.md` §1 找出輔色、粒子母題、背景、鏡頭感、節奏、音效方向。主色固定是 `this.d.typeColor`（`TYPE_COLORS`）。
3. **名稱關鍵字**：§2 依關鍵字（舞／斬／拳／光束／雷／波／爆／龍…）決定本體與終結的演出；多個關鍵字時以最後一個字為主（「花瓣**舞**」→ 舞）。
4. **骨架語彙**：§3 機器人大戰風固定語彙必須全部出現：警告帶、cut-in 台詞、標題卡、蓄力特寫、eye-catch ×2、本體多波命中、終結技名、FINISH。
5. **節奏與鏡頭**：遵守 §4（每段至少一個 ≥2 s 的穩定鏡頭、衝擊前先收後放、文字 ≥1.5 s）。
6. **音效**：在 brief 的 cue sheet 寫出方向（§5）。目前 cinematic 靜音，**不要**在這個 skill 的流程中順便實作音效系統，除非使用者要求。
7. 把結果填進 `templates/design-brief.md`，再寫成 scene 開頭的 shot list 註解。

---

## 4. 新增一個招式（步驟）

以「火焰衝擊（fire）」為例，id `flame-burst`、本體 id `inferno`：

1. **Design brief**：複製 `templates/design-brief.md` 的內容填好（不用存檔，寫進 scene 註解）。
2. **Timeline**：複製 `templates/moveTimeline.ts.tmpl` → `src/phaser/cinematic/flameBurstTimeline.ts`，改名 `FLAME_BURST_TIMELINE`，本體 id `inferno`，秒數在範圍內且總和 60 000。
3. **登記 timeline**：`timelines.ts` 的 `CINEMATIC_TIMELINES` 加 `'flame-burst': FLAME_BURST_TIMELINE`（import 要帶 `.ts` 副檔名，給 node test 用）。
4. **Scene**：複製 `templates/MoveScene.ts.tmpl` → `src/phaser/cinematic/FlameBurstScene.ts`，改類別名、`FLAME_BURST_SCENE_KEY = 'FlameBurstScene'`、timeline import、`'move-body'` → `'inferno'`，再依 brief 改寫每個 `direct*()`。專屬造型與配色留在檔案內；確定兩招以上會共用的效果才搬進 `fx.ts`（並更新 `PetalDanceScene` 改用它）。
5. **註冊 scene**：`registry.ts` 的 `CINEMATICS` 加 `'flame-burst': { key: FLAME_BURST_SCENE_KEY, scene: FlameBurstScene, timeline: CINEMATIC_TIMELINES['flame-burst'] }`。漏了這步 `tsc` 會報錯。
6. **對應招式**：`moveAnimations.ts` 的 `ADVANCED_MOVE_ANIMATIONS` 加 `火焰衝擊: 'flame-burst'`。這是最後一步，完成驗證前不要加。
7. **驗證**：跑第 5 節全部項目。
8. **回報**：新增／修改檔案、各 phase 秒數、驗證結果、截圖路徑、已知限制。

Scene 撰寫規則：
- 時間：只用 `this.phase(id, offsetMs, fn)`（在 `direct()` 內）或 cue 內的 `this.cue(ms, fn)`（相對於當下），以及 tweens／`fx.after/every/onFrame`。**禁止** `setTimeout`、`setInterval`、`this.time.delayedCall`（會在掉幀時與 tween 錯位）。
- 相機：`this.cut / pan / zoomTo / rotateTo / shake`（zoom 以設計比例 1 = 整個 set）；`cameras.main.fadeIn/fadeOut` 的毫秒要包 `this.ms()`。
- 圖層：世界物件放各 set；螢幕空間 UI 加進 `this.uiBack / uiMid / uiTop`（UI 相機不跟著晃）。
- 相對縮放：`scale: baseScale(sprite) * 1.2`，不要寫死 `scale: 1.2`。
- 清理：持續效果的 stop 函式收進 `this.stops`，轉場時 `stopAll()`；一次性物件在 tween `onComplete` 裡 `destroy()`。
- 效能（手機）：每個 set 背景烘焙成單一 texture（見 `PetalDanceScene#backdrop`）；同時存活粒子 ≲ 300；環境粒子每 set ≲ 20；不要每幀建立 Graphics。

---

## 5. 驗證清單（全部通過才算完成）

```bash
npm test          # spec：每個 timeline 剛好 60 s、7 段、範圍內；每個招式對應都有 timeline；未對應招式走簡易版
npm run lint
npm run build     # 同時跑 tsc -b：registry 型別保證每個 timeline 都有 scene
node .claude/skills/advanced-move-animation/scripts/check-templates.mjs   # 修改 fx/CinematicScene/actorArt 後，模板仍可編譯

npm run dev       # 另開終端機，預設 http://localhost:5173/Meza-Static/
node .claude/skills/advanced-move-animation/scripts/verify-cinematic.mjs --move 火焰衝擊 --out ./cinematic-check
```

`verify-cinematic.mjs`（headless Chrome，`CHROME=` 可改路徑）會對我方攻擊與敵方攻擊各檢查：
- 進階 overlay 開啟正確的 cinematic id；
- 每個 phase 在設計時間 ±100 ms 開始、順序正確；`onComplete` 在 60 s ±100 ms 觸發且只觸發一次；
- 使用測試圖片時：攻擊方／防守方自訂圖都有用到，cut-in／eye-catch 立繪是攻擊方，沒有翻轉，雙人鏡頭敵上我下；
- 無 console error；`quality=simple` 仍播放簡易版 `BattleScene`；
- 每個 phase 中點的截圖輸出到 `--out`，**逐張檢視**畫面是否符合 brief。

`--out` 預設 `./cinematic-check`，這是驗證產物，不要 commit（輸出到 scratchpad 或刪除）。

手動確認（測試頁 `#/test/cinematic?move=<招式>&quality=advanced&side=ally|enemy&speed=1|4|10`）：
- 手機寬度（360／390px）文字不出框、跳過按鈕可點；
- 未設定圖片時是屬性 emoji，設定自訂圖片後是圖片（收藏 → 卡牌 → 角色圖片）；
- 設定頁切回「簡易」後實戰播放簡易版。

---

## 6. 修改既有招式時

- 調整秒數：只改 `<id>Timeline.ts`，cue 都是相對 phase 的 offset，不必重排；仍需在範圍內、總和 60 s。
- 改共用效果（`fx.ts`）：確認所有使用它的 scene（`grep -n "<fx名>" src/phaser/cinematic/*Scene.ts`），並對每個已註冊招式跑 `verify-cinematic.mjs`。
- 改基底（`CinematicScene` / `actorArt`）：跑 `check-templates.mjs` 與所有招式的驗證。
- `CinematicScene` 的時鐘是一個 `persist: true` 的線性 counter tween（值＝已經過的設計毫秒）。**不要移除 `persist`**：完成的 tween 會被銷毀、`getValue()` 回傳 null，時鐘停在 60 s 前，最後的 `finish()`（onComplete）就不會觸發，動畫只能靠跳過結束。`verify-cinematic.mjs` 的 onComplete 檢查會抓到這種退化。
