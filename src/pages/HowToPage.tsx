export default function HowToPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-8 neon-text">HOW TO PLAY</h1>

      <div className="space-y-8">
        <Section
          step={1}
          icon="🎮"
          title="Choose a Mode"
          content="Start by selecting either Battle & Catch (full experience) or Catch Now (quick mode). Battle & Catch offers higher grade monsters and more rewards."
        />

        <Section
          step={2}
          icon="🗺️"
          title="Select an Area"
          content="Each area has a Boss monster and different difficulty levels. Higher difficulty areas (★5~★6) have better rewards but tougher battles. Areas like Starfall Summit have a chance for ★6 Superstar monsters!"
        />

        <Section
          step={3}
          icon="⚔️"
          title="Build Your Team"
          content="Pick up to 3 Tags from your collection (or use Rental monsters if you're just starting). Each monster has unique stats: ATK, DEF, SPD, and a special move with type advantage."
        />

        <Section
          step={4}
          icon="🎰"
          title="Battle: Roulette & Mash"
          content="In each of the 3 battle rounds: (1) Choose which monster attacks by tapping their ATTACK button. (2) Stop the Attack Roulette — higher numbers mean more damage! (3) MASH the button (click or press SPACE) to build extra bonus damage. Your damage fills the Catch Gauge."
        />

        <Section
          step={5}
          icon="🎯"
          title="Catch Time"
          content="After battle, choose one enemy monster to catch. The Ball Roulette determines which ball you throw — Master Ball guarantees a catch! Your Catch Gauge from battle affects success rates."
        />

        <Section
          step={6}
          icon="🌿"
          title="Bonus Catch"
          content="After the main catch, get a Bonus Catch chance! A cursor cycles through grass tiles — stop it at the right time to encounter a wild monster. You get a free Poké Ball throw."
        />

        <Section
          step={7}
          icon="📦"
          title="Collect & Grow"
          content="All caught monsters go to your Collection. View their stats, filter by grade and type, and see both front and back of each Tag. Collect ★5 Star and ★6 Superstar monsters for bragging rights!"
        />

        <div className="bg-bg-card rounded-xl p-6 border border-primary/20 mt-8">
          <h3 className="font-display text-lg mb-3 text-primary-light">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>• ★5 (Star) and ★6 (Superstar) monsters are rare — keep playing!</li>
            <li>• The <span className="text-neon-cyan">Catch Gauge</span> carries from battle to catch phase — deal more damage for higher catch rates</li>
            <li>• <span className="text-accent">Master Ball</span> = 100% catch rate, but it's rare in the Ball Roulette</li>
            <li>• Use <span className="text-primary-light">keyboard SPACE</span> for mashing — it's faster than clicking!</li>
            <li>• Your collection is saved in browser local storage — no account needed</li>
            <li>• Export your collection from Settings to keep a backup</li>
          </ul>
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
          <span className="text-text-muted text-sm">Step {step}:</span> {title}
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
