# 全招式進階動畫清單

共 78 招；已實作並通過技術驗證 78 招，未製作 0 招。每招皆為獨立 60 秒 cinematic；本批依使用者指示以程式與瀏覽器技術檢查驗證，不進行截圖審閱。

「AI 製作者」指進階動畫的實作者；未製作的招式不分配 AI 作者。花瓣舞、日光束由使用者確認為 Claude Code；逆鱗由本次 Codex 對話實作與重製，其餘 75 招由本次 Codex 對話依 advanced-move-animation skill 製作。Git 使用者名稱不作為 AI 歸屬證據。

來源：`src/data/moves.ts`、`moveAnimations.ts`、`credits.ts`。更新：`npm run moves:status`；檢查是否同步：`npm run moves:status -- --check`。

| 屬性 | 招式 | 進階動畫 | AI 製作者 | 重製／修訂 | Cinematic ID |
|---|---|---|---|---|---|
| 火 | 大字爆炎 | 已完成 | Codex | — | `fire-blast` |
| 火 | 火花 | 已完成 | Codex | — | `ember` |
| 火 | 火焰牙 | 已完成 | Codex | — | `fire-fang` |
| 火 | 火焰車 | 已完成 | Codex | — | `flame-wheel` |
| 火 | 閃焰衝鋒 | 已完成 | Codex | — | `flare-blitz` |
| 火 | 噴射火焰 | 已完成 | Codex | — | `flamethrower` |
| 水 | 水之波動 | 已完成 | Codex | — | `water-pulse` |
| 水 | 水流尾 | 已完成 | Codex | — | `aqua-tail` |
| 水 | 水炮 | 已完成 | Codex | — | `hydro-pump` |
| 水 | 水槍 | 已完成 | Codex | — | `water-gun` |
| 水 | 泡沫 | 已完成 | Codex | — | `bubble` |
| 水 | 泡沫光線 | 已完成 | Codex | — | `bubble-beam` |
| 水 | 衝浪 | 已完成 | Codex | — | `surf` |
| 水 | 瀑布 | 已完成 | Codex | — | `waterfall` |
| 水 | 蟹鉗錘 | 已完成 | Codex | — | `crabhammer` |
| 草 | 日光束 | 已完成 | Claude Code | — | `solar-beam` |
| 草 | 吸取 | 已完成 | Codex | — | `absorb` |
| 草 | 花瓣舞 | 已完成 | Claude Code | Codex | `petal-dance` |
| 草 | 飛葉快刀 | 已完成 | Codex | — | `razor-leaf` |
| 草 | 強力鞭打 | 已完成 | Codex | — | `power-whip` |
| 草 | 種子炸彈 | 已完成 | Codex | — | `seed-bomb` |
| 草 | 藤鞭 | 已完成 | Codex | — | `vine-whip` |
| 電 | 十萬伏特 | 已完成 | Codex | — | `thunderbolt` |
| 電 | 打雷 | 已完成 | Codex | — | `thunder` |
| 電 | 放電 | 已完成 | Codex | — | `discharge` |
| 電 | 電擊 | 已完成 | Codex | — | `thunder-shock` |
| 超能力 | 幻象光線 | 已完成 | Codex | — | `psybeam` |
| 超能力 | 念力 | 已完成 | Codex | — | `confusion` |
| 超能力 | 精神強念 | 已完成 | Codex | — | `psychic` |
| 超能力 | 精神擊破 | 已完成 | Codex | — | `psystrike` |
| 惡 | 咬住 | 已完成 | Codex | — | `bite` |
| 龍 | 逆鱗 | 已完成 | Codex | Codex | `outrage` |
| 龍 | 龍之波動 | 已完成 | Codex | — | `dragon-pulse` |
| 龍 | 龍捲風 | 已完成 | Codex | — | `twister` |
| 妖精 | 月亮之力 | 已完成 | Codex | — | `moonblast` |
| 格鬥 | 百萬噸飛踢 | 已完成 | Codex | — | `mega-kick` |
| 格鬥 | 空手劈 | 已完成 | Codex | — | `karate-chop` |
| 格鬥 | 近身戰 | 已完成 | Codex | — | `close-combat` |
| 格鬥 | 劈瓦 | 已完成 | Codex | — | `brick-break` |
| 格鬥 | 爆裂拳 | 已完成 | Codex | — | `dynamic-punch` |
| 一般 | 三角攻擊 | 已完成 | Codex | — | `tri-attack` |
| 一般 | 必殺門牙 | 已完成 | Codex | — | `hyper-fang` |
| 一般 | 百萬噸拳擊 | 已完成 | Codex | — | `mega-punch` |
| 一般 | 角撞 | 已完成 | Codex | — | `horn-attack` |
| 一般 | 泰山壓頂 | 已完成 | Codex | — | `body-slam` |
| 一般 | 捨身撞擊 | 已完成 | Codex | — | `double-edge` |
| 一般 | 猛撞 | 已完成 | Codex | — | `take-down` |
| 一般 | 電光一閃 | 已完成 | Codex | — | `quick-attack` |
| 一般 | 劈開 | 已完成 | Codex | — | `slash` |
| 一般 | 撞擊 | 已完成 | Codex | — | `tackle` |
| 冰 | 冰凍光束 | 已完成 | Codex | — | `ice-beam` |
| 冰 | 冰錐 | 已完成 | Codex | — | `icicle-spear` |
| 冰 | 極光束 | 已完成 | Codex | — | `aurora-beam` |
| 冰 | 暴風雪 | 已完成 | Codex | — | `blizzard` |
| 幽靈 | 暗影球 | 已完成 | Codex | — | `shadow-ball` |
| 幽靈 | 舔舐 | 已完成 | Codex | — | `lick` |
| 毒 | 污泥攻擊 | 已完成 | Codex | — | `sludge` |
| 毒 | 污泥炸彈 | 已完成 | Codex | — | `sludge-bomb` |
| 毒 | 毒針 | 已完成 | Codex | — | `poison-sting` |
| 毒 | 毒擊 | 已完成 | Codex | — | `poison-jab` |
| 毒 | 溶解液 | 已完成 | Codex | — | `acid` |
| 地面 | 大地之力 | 已完成 | Codex | — | `earth-power` |
| 地面 | 地震 | 已完成 | Codex | — | `earthquake` |
| 地面 | 泥巴射擊 | 已完成 | Codex | — | `mud-shot` |
| 地面 | 挖洞 | 已完成 | Codex | — | `dig` |
| 地面 | 骨棒 | 已完成 | Codex | — | `bone-club` |
| 飛行 | 空氣利刃 | 已完成 | Codex | — | `air-slash` |
| 飛行 | 翅膀攻擊 | 已完成 | Codex | — | `wing-attack` |
| 飛行 | 啄 | 已完成 | Codex | — | `peck` |
| 飛行 | 暴風 | 已完成 | Codex | — | `hurricane` |
| 飛行 | 鑽喙 | 已完成 | Codex | — | `drill-peck` |
| 蟲 | 十字剪 | 已完成 | Codex | — | `x-scissor` |
| 蟲 | 蟲咬 | 已完成 | Codex | — | `bug-bite` |
| 蟲 | 蟲鳴 | 已完成 | Codex | — | `bug-buzz` |
| 蟲 | X剪刀 | 已完成 | Codex | — | `x-scissors` |
| 岩石 | 尖石攻擊 | 已完成 | Codex | — | `stone-edge` |
| 岩石 | 岩崩 | 已完成 | Codex | — | `rock-slide` |
| 岩石 | 落石 | 已完成 | Codex | — | `rock-throw` |

## 製作歸屬依據

- `petal-dance`：使用者於本次對話確認；原始提交 62bf062。本次 Codex 調整收尾粒子頻率，避免超出粒子預算。
- `solar-beam`：使用者於本次對話確認；原始提交 dffab68。
- `outrage`：本對話實作與光影粒子重製；原始提交 56319b7。
- `fire-blast`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `ember`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `fire-fang`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `flame-wheel`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `flare-blitz`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `flamethrower`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `water-pulse`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `aqua-tail`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `hydro-pump`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `water-gun`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bubble`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bubble-beam`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `surf`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `waterfall`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `crabhammer`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `absorb`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `razor-leaf`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `power-whip`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `seed-bomb`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `vine-whip`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `thunderbolt`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `thunder`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `discharge`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `thunder-shock`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `psybeam`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `confusion`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `psychic`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `psystrike`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bite`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `dragon-pulse`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `twister`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `moonblast`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `mega-kick`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `karate-chop`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `close-combat`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `brick-break`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `dynamic-punch`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `tri-attack`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `hyper-fang`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `mega-punch`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `horn-attack`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `body-slam`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `double-edge`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `take-down`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `quick-attack`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `slash`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `tackle`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `ice-beam`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `icicle-spear`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `aurora-beam`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `blizzard`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `shadow-ball`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `lick`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `sludge`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `sludge-bomb`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `poison-sting`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `poison-jab`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `acid`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `earth-power`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `earthquake`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `mud-shot`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `dig`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bone-club`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `air-slash`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `wing-attack`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `peck`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `hurricane`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `drill-peck`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `x-scissor`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bug-bite`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `bug-buzz`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `x-scissors`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `stone-edge`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `rock-slide`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
- `rock-throw`：本次 Codex 對話依 advanced-move-animation skill 批次實作。
