# Design brief — <招式名稱>（<cinematic-id>）

> 複製這份檔案，在實作前填好。依 `reference/type-themes.md` 挑選主題。
> 填完後的 brief 放在 scene 檔案開頭的註解（shot list），不需要另外存檔。

## 基本資料
- 招式名稱（與 `src/data/monsters.ts` 完全一致）：
- 屬性（`move.type`）：　主色：`TYPE_COLORS[type]`
- cinematic id（kebab-case）：　Scene 類別：`<Name>Scene`　Scene key：`'<Name>Scene'`
- 本體 phase id（kebab-case，不可用固定 id）：
- 使用此招式的怪獸（`grep "name: '<招式>'" src/data/monsters.ts`）：

## 主題
- 母題（粒子／造型）：
- 輔色 tints：
- 三個 set 的背景：A 攻擊方特寫＝　B 目標特寫＝　C 雙人鏡頭＝
- 台詞（cut-in 2–3 行）：
- 終結技名稱（finale 標題）：
- 英文副標（標題卡下方）：

## Timeline（總長 60 000 ms，範圍見 spec.ts）
| # | phase id | label | 秒數 | 範圍 | 內容（鏡頭／特效） |
|---|---|---|---|---|---|
| 1 | intro | | 5 | 3–6 | |
| 2 | cutin | | 8 | 6–10 | |
| 3 | charge | | 11 | 8–13 | |
| 4 | release | | 4 | 3–6 | |
| 5 | <body-id> | | 16 | 12–20 | |
| 6 | finale | | 9 | 7–11 | |
| 7 | aftermath | | 7 | 5–8 | |
| | **合計** | | **60** | | |

## Cue sheet（phase + offset ms）
| phase | offset | 畫面 | 鏡頭 | 音效方向 |
|---|---|---|---|---|
| intro | 0 | | cut 雙人 | |

## 專屬效果（不放進 fx.ts 的部分）
- 

## 需要新增到 fx.ts 的共用效果（至少兩個招式會用到才放）
- 

## 效能預算
- 同時存活粒子上限：
- 每個 set 的背景是否烘焙成 canvas texture：是／否
