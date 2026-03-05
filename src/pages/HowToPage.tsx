import { useNameReveal } from '../lib/nameMask';

export default function HowToPage() {
  const { revealed, reveal } = useNameReveal();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-8 neon-text">遊戲說明</h1>

      <div className="space-y-8">
        <Section
          step={1}
          icon="🎮"
          title="選擇模式"
          content="首先選擇「對戰 & 捕獲」（完整體驗）或「快速捕獲」（快速模式）。對戰 & 捕獲模式提供更高星等的怪獸和更多獎勵。"
        />

        <Section
          step={2}
          icon="🗺️"
          title="選擇區域"
          content="每個區域都有頭目怪獸和不同的難度等級。高難度區域（★5~★6）有更好的獎勵但更強的對手。像「星隕之頂」這樣的區域有機會出現 ★6 超級星怪獸！"
        />

        <Section
          step={3}
          icon="⚔️"
          title="組建隊伍"
          content="從你的收藏中挑選最多3張卡牌（如果剛開始可以使用出租怪獸）。每隻怪獸都有獨特的能力值：ATK、DEF、SPD，以及帶有屬性優勢的特殊招式。"
        />

        <Section
          step={4}
          icon="🎰"
          title="對戰：轉盤 & 連打"
          content="在3回合對戰的每一回合中：(1) 點擊「攻擊」按鈕選擇攻擊的怪獸。(2) 停下攻擊轉盤 — 數字越大傷害越高！(3) 連打按鈕（點擊或按空白鍵）來累積額外傷害。你的傷害會填滿捕獲計量表。"
        />

        <Section
          step={5}
          icon="🎯"
          title="捕獲時間"
          content="對戰結束後，選擇一隻敵方怪獸來捕獲。球種轉盤決定你投擲哪種球 — 大師球保證捕獲！對戰中的捕獲計量表會影響成功率。"
        />

        <Section
          step={6}
          icon="🌿"
          title="額外捕獲"
          content="主要捕獲後，還有額外捕獲機會！游標會在草叢格子間循環 — 在正確的時機停下來遇見野生怪獸。你會獲得一次免費的精靈球投擲。"
        />

        <Section
          step={7}
          icon="📦"
          title="收藏 & 成長"
          content="所有捕獲的怪獸會進入你的收藏。查看牠們的能力值、依星等和屬性篩選，還能看到每張卡牌的正面和背面。收集 ★5 星級和 ★6 超級星怪獸來炫耀你的實力！"
        />

        <div className="bg-bg-card rounded-xl p-6 border border-primary/20 mt-8">
          <h3 className="font-display text-lg mb-3 text-primary-light">💡 小提示</h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>• ★5（星級）和 ★6（超級星）怪獸非常稀有 — 繼續遊玩吧！</li>
            <li>• <span className="text-neon-cyan">捕獲計量表</span>從對戰延續到捕獲階段 — 造成更多傷害可提高捕獲率</li>
            <li>• <span className="text-accent">大師球</span> = 100% 捕獲率，但在球種轉盤中很稀有</li>
            <li>• 使用<span className="text-primary-light">鍵盤空白鍵</span>來連打 — 比點擊更快！</li>
            <li>• 你的收藏存儲在瀏覽器本地儲存中 — 不需要帳號</li>
            <li>• 從設定中匯出你的收藏以保留備份</li>
          </ul>
        </div>

        <div className="bg-bg-card rounded-xl p-6 border border-accent/20 mt-8 text-center">
          <h3 className="font-display text-lg mb-3 text-accent">🔓 名稱顯示</h3>
          <p className="text-sm text-text-muted mb-4">
            為避免版權爭議，怪獸名稱預設以加密形式顯示。<br />
            按下按鈕即可查看正確名稱。
          </p>
          {revealed ? (
            <div className="text-neon-green font-display text-lg">✅ 已解鎖正確名稱</div>
          ) : (
            <button
              onClick={reveal}
              className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg transition-all text-lg"
            >
              顯示正確名字
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ step, icon, title, content }: { step: number; icon: string; title: string; content: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-lg mb-1">
          <span className="text-text-muted text-sm">步驟 {step}:</span> {title}
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
