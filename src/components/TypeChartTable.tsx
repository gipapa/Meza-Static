/**
 * TypeChartTable
 * Renders an 18×18 type effectiveness grid from typeChart.ts data.
 * Rows = Attacking type, Columns = Defending type.
 */
import { ALL_TYPES, getSingleMultiplier } from '../lib/typeChart';
import { TYPE_NAMES_ZH, TYPE_EMOJI } from '../data/monsters';

function cellStyle(mult: number): { bg: string; text: string; label: string } {
  if (mult === 2)   return { bg: 'bg-red-500/80',   text: 'text-white font-bold',  label: '2' };
  if (mult === 0.5) return { bg: 'bg-blue-500/60',  text: 'text-white',            label: '½' };
  if (mult === 0)   return { bg: 'bg-gray-800',      text: 'text-gray-500',         label: '✕' };
  return              { bg: 'bg-transparent',         text: 'text-gray-600',         label: '' };
}

export default function TypeChartTable() {
  const types = ALL_TYPES;

  return (
    <div className="overflow-auto text-[10px]">
      {/* Legend */}
      <div className="flex gap-3 mb-2 px-1 flex-wrap">
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-red-500/80" /> 2× 超級有效</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-blue-500/60" /> ½ 效果不大</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-gray-800 border border-gray-600" /> 0 無效</span>
      </div>
      <table className="border-collapse">
        <thead>
          <tr>
            {/* top-left corner: ATK↓ DEF→ */}
            <th className="sticky left-0 z-10 bg-bg-card px-1 py-0.5 text-[9px] text-text-muted whitespace-pre">攻↓\守→</th>
            {types.map(t => (
              <th key={t} className="px-0.5 py-0.5 text-center min-w-[22px]" title={TYPE_NAMES_ZH[t]}>
                <span title={TYPE_NAMES_ZH[t]}>{TYPE_EMOJI[t] ?? TYPE_NAMES_ZH[t]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map(atk => (
            <tr key={atk}>
              {/* Row header: attacker type */}
              <td className="sticky left-0 z-10 bg-bg-card px-1 py-0.5 font-medium whitespace-nowrap">
                <span className="mr-0.5">{TYPE_EMOJI[atk] ?? ''}</span>
                <span className="text-[9px] text-text-muted">{TYPE_NAMES_ZH[atk]}</span>
              </td>
              {types.map(def => {
                const mult = getSingleMultiplier(atk, def);
                const { bg, text, label } = cellStyle(mult);
                return (
                  <td
                    key={def}
                    className={`text-center min-w-[22px] h-5 rounded-sm ${bg} ${text}`}
                    title={`${TYPE_NAMES_ZH[atk]} 攻 → ${TYPE_NAMES_ZH[def]} 守 : ${mult}×`}
                  >
                    {label}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
