# 參考實作：花瓣舞（petal-dance）

目前唯一完成的進階動畫，也是新招式的範本。
檔案：`src/phaser/cinematic/petalDanceTimeline.ts`、`src/phaser/cinematic/PetalDanceScene.ts`。

## 主題判斷（依 type-themes.md）
- 屬性 grass → 粉／淺綠／白，花瓣母題，庭園與夜空背景，柔和推拉、先緩後急。
- 名稱「花瓣**舞**」→ 本體是環繞目標的花瓣刃 + 多波命中；終結是花瓣匯聚成巨大花朵後砸下（「千華繚亂 / FINAL BLOOM」）。

## Timeline（60 s）
| # | phase id | label | 秒數 | 起點 |
|---|---|---|---|---|
| 1 | intro | 開場・警報 | 5 | 0 s |
| 2 | cutin | 發招 Cut-in | 8 | 5 s |
| 3 | charge | 集中・蓄力 | 11 | 13 s |
| 4 | release | 解放 | 4 | 24 s |
| 5 | storm（本體） | 花瓣風暴 | 16 | 28 s |
| 6 | finale | 終結・千華繚亂 | 9 | 44 s |
| 7 | aftermath | 收尾 | 7 | 53 s |

## Sets（世界座標，360×640 設計空間）
- SET_A x=0：攻擊方特寫（180, 400），黃昏庭園。
- SET_B x=1000：目標特寫（1180, 330），夜空。
- SET_C x=2000：雙人鏡頭，敵方 y=170、我方 y=500（`resolveBattleLayout` 決定移動方向）。
- 背景以 `backdrop()` 烘焙為 canvas texture（每個 set 一個 quad）。

## Shot list 摘要
- **intro**：淡入、letterbox、ATTACK 警告帶、「A ▶▶ B」，推近攻擊方，白閃。
- **cutin**：`cutIn()`（我方從左／敵方從右）台詞「花之舞者，聽我號令——」「綻放吧！」；4 s 後逐字蓋章標題卡 + PETAL DANCE + 屬性徽章。
- **charge**：`converge()` 花瓣聚集、氣場、收縮光環、CHARGE 量表到 MAX、`concentrationLines()`、輕微 shake、`eyeCatch()`「喝啊——！」、白閃。
- **release**：爆發、火花、光環、花瓣射向目標；切雙人鏡頭，花瓣河由攻擊方流向防守方。
- **storm**：34 片環繞花瓣刃；命中波 2.5 / 5.5 / 10.2 / 13.2 s（slash、火花、擊退、tint、shake、dutch angle、HIT 數字）；7.5 s 切回攻擊方「還沒結束！」，9.3 s 回目標。
- **finale**：巨大花朵成形、終結技名「千華繚亂 / FINAL BLOOM」、`eyeCatch()`「散華吧！」、花朵砸下、全畫面衝擊。
- **aftermath**：落花、防守方傾倒、TOTAL DAMAGE、FINISH!、letterbox 收回、淡出。

## 可以照抄的寫法
- `direct()` 只呼叫 `directIntro()…directAftermath()`，每個 phase 一個方法，cue 都用 `this.phase(id, offset, fn)`。
- 持續效果（emitter、集中線、onFrame）回傳 stop 函式，收進 `this.stops`，在轉場時 `stopAll()`。
- 招式專屬的東西（`PETAL_TINTS`、花朵造型、HIT 計數）留在 scene；跨招式可重用的（cut-in、eye-catch、集中線、閃光…）在 `fx.ts`。
- 立繪一律 `addActorSprite()`；相對縮放用 `baseScale(sprite) * k`，自訂圖片與 emoji 都正確。
