import React from 'react';
import { City, Faction } from 'shared';
import { Crown, AlertTriangle } from 'lucide-react';

interface InteractiveMapProps {
  cities: Record<string, City>;
  activeFaction: Faction;
  playerFaction: Faction | null;
  selectedCityId: string | null;
  onSelectCity: (cityId: string) => void;
  validTargets: string[];
  selectionMode: 'NONE' | 'EXCHANGE' | 'ATTACK';
}

const CITY_PATHS: Record<string, { path: string; labelX: number; labelY: number }> = {
  maisons_laffitte: {
    path: "M 631,158 L 743,161 L 711,223 L 602,306 L 563,269 L 595,181 Z",
    labelX: 729,
    labelY: 199,
  },
  sartrouville: {
    path: "M 607,318 L 733,218 L 825,241 L 831,267 L 740,303 L 674,385 Z",
    labelX: 792,
    labelY: 287,
  },
  bezons: {
    path: "M 809,317 L 833,283 L 918,351 L 827,435 L 813,398 Z",
    labelX: 886,
    labelY: 382,
  },
  houilles: {
    path: "M 766,307 L 807,316 L 823,388 L 732,406 L 701,356 Z",
    labelX: 726,
    labelY: 335,
  },
  carrieres: {
    path: "M 693,368 L 727,412 L 801,403 L 808,446 L 720,506 L 668,424 Z",
    labelX: 761,
    labelY: 483,
  },
  chatou: {
    path: "M 590,500 L 668,454 L 708,511 L 663,601 Z",
    labelX: 630,
    labelY: 555,
  },
  montesson: {
    path: "M 604,320 L 646,365 L 674,452 L 629,445 L 520,443 Z",
    labelX: 633,
    labelY: 452,
  },
  le_mesnil: {
    path: "M 563,270 L 600,312 L 574,335 L 499,469 L 476,458 L 537,309 Z",
    labelX: 535,
    labelY: 295,
  },
  saint_germain: {
    path: "M 245,406 L 324,326 L 317,293 L 422,52 L 654,57 L 441,480 L 260,635 L 233,619 L 309,483 Z",
    labelX: 360,
    labelY: 405,
  },
  le_vesinet: {
    path: "M 504,481 L 573,457 L 610,579 L 543,610 Z",
    labelX: 540,
    labelY: 545,
  },
  le_pecq: {
    path: "M 479,463 L 496,473 L 483,562 L 437,609 L 417,595 Z",
    labelX: 450,
    labelY: 550,
  },
  croissy: {
    path: "M 519,582 L 556,627 L 587,586 L 670,600 L 595,670 L 511,607 Z",
    labelX: 575,
    labelY: 645,
  },
  port_marly: {
    path: "M 450,603 L 467,576 L 488,567 L 512,623 L 493,638 L 469,615 Z",
    labelX: 464,
    labelY: 624,
  },
  louveciennes: {
    path: "M 476,697 L 503,627 L 570,670 L 575,714 L 505,777 Z",
    labelX: 530,
    labelY: 750,
  },
  marly: {
    path: "M 366,722 L 419,613 L 483,650 L 469,751 L 407,758 Z",
    labelX: 400,
    labelY: 745,
  },
  mareil_marly: {
    path: "M 333,607 L 356,572 L 422,571 L 418,609 L 379,633 L 343,623 Z",
    labelX: 345,
    labelY: 605,
  },
  etang: {
    path: "M 230,668 L 281,613 L 380,651 L 339,743 L 277,708 Z",
    labelX: 280,
    labelY: 705,
  },
  chambourcy: {
    path: "M 198,524 L 230,410 L 285,456 L 292,506 L 232,611 L 112,547 Z",
    labelX: 215,
    labelY: 535,
  },
  aigremont: {
    path: "M 75,520 L 187,433 L 199,484 L 191,524 L 143,524 L 106,546 Z",
    labelX: 150,
    labelY: 456,
  },
};

export default function InteractiveMap({
  cities,
  activeFaction,
  playerFaction,
  selectedCityId,
  onSelectCity,
  validTargets,
  selectionMode
}: InteractiveMapProps) {

  // Explicit SVG styling to avoid Tailwind fill opacity bugs that render solid black
  const getPathStyle = (cityKey: string, city: City): React.CSSProperties => {
    const isSelected = selectedCityId === cityKey;
    const isTarget = validTargets.includes(cityKey);
    const isUncontrolled = city.capitalId === null;

    if (selectionMode !== 'NONE' && !isTarget && !isSelected) {
      return {
        fill: '#000000',
        fillOpacity: 0.45,
        stroke: '#44403c',
        strokeWidth: 1,
        pointerEvents: 'none',
        transition: 'all 0.25s ease',
      };
    }

    let fillColor = '#a8a29e';
    let strokeColor = '#78716c';
    let fillOpacity = 0.06;
    let strokeWidth = 1.3;

    if (isUncontrolled) {
      fillColor = '#78716c';
      strokeColor = isSelected ? '#f59e0b' : '#a8a29e';
      fillOpacity = isSelected ? 0.35 : 0.12;
    } else if (city.faction === 'CHATOU') {
      fillColor = '#3b82f6';
      strokeColor = isSelected ? '#60a5fa' : isTarget ? '#3b82f6' : 'rgba(59, 130, 246, 0.45)';
      fillOpacity = isSelected ? 0.38 : isTarget ? 0.28 : 0.08;
    } else if (city.faction === 'VILLE_IMPERIALE') {
      fillColor = '#ef4444';
      strokeColor = isSelected ? '#f87171' : isTarget ? '#ef4444' : 'rgba(239, 68, 68, 0.45)';
      fillOpacity = isSelected ? 0.38 : isTarget ? 0.28 : 0.08;
    }

    if (isTarget) {
      strokeWidth = 3.5;
    } else if (isSelected) {
      strokeWidth = 2.5;
    }

    return {
      fill: fillColor,
      fillOpacity,
      stroke: strokeColor,
      strokeWidth,
      cursor: 'pointer',
      transition: 'all 0.25s ease',
    };
  };

  // Helper to count total soldiers in a city
  const getCityStats = (city: City) => {
    const totalBastions = city.bastions.length;
    const totalSoldiers = city.bastions.reduce((acc, b) => acc + b.soldiers, 0);
    return { totalBastions, totalSoldiers };
  };

  return (
    <div className="w-full h-full relative select-none">
      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-full bg-[#0d0c0b] border border-amber-900/25 rounded-xl shadow-2xl relative"
      >
        {/* Background Map Image */}
        <image href="/map.jpg" x="0" y="0" width="1000" height="800" />

        {/* City Territories */}
        {Object.entries(CITY_PATHS).map(([key, item]) => {
          const city = cities[key];
          if (!city) return null;

          return (
            <g key={key} onClick={() => onSelectCity(key)}>
              <path
                d={item.path}
                style={getPathStyle(key, city)}
              />
            </g>
          );
        })}

        {/* Labels overlay */}
        {Object.entries(CITY_PATHS).map(([key, item]) => {
          const city = cities[key];
          if (!city) return null;

          const { totalBastions, totalSoldiers } = getCityStats(city);
          const isSelected = selectedCityId === key;
          const isUncontrolled = city.capitalId === null;

          return (
            <g key={`lbl-${key}`} className="pointer-events-none select-none">
              {/* City badge center card */}
              <foreignObject
                x={item.labelX - 45}
                y={item.labelY - 20}
                width="90"
                height="45"
                className="overflow-visible"
              >
                <div className={`flex flex-col items-center justify-center p-1 rounded border shadow-md font-serif ${
                  isSelected 
                    ? 'bg-stone-900 border-amber-500/80 shadow-[0_0_8px_rgba(217,119,6,0.3)]' 
                    : 'bg-stone-950/90 border-stone-800'
                }`}>
                  {/* City Name */}
                  <span className={`text-[9px] font-bold truncate max-w-full leading-tight ${
                    isUncontrolled
                      ? 'text-stone-400 font-sans'
                      : city.faction === 'CHATOU' 
                      ? 'text-blue-300' 
                      : 'text-red-300'
                  }`}>
                    {city.name}
                  </span>

                  {/* Bastions & Soldiers Stats line */}
                  {totalBastions > 0 ? (
                    <div className="flex items-center gap-1 mt-0.5 text-[8px] font-mono leading-none">
                      <span className="text-stone-400">{totalBastions}B</span>
                      <span className="text-stone-500">|</span>
                      <span className="text-amber-500 font-bold">{totalSoldiers}</span>
                    </div>
                  ) : (
                    <span className="text-[7px] font-mono text-red-500 mt-0.5">DÉTRUITE</span>
                  )}

                  {/* Icon badge overlay */}
                  <div className="flex gap-1 mt-0.5">
                    {city.capitalId && (
                      <Crown size={8} className="text-amber-500 fill-amber-500" />
                    )}
                    {isUncontrolled && (
                      <AlertTriangle size={8} className="text-stone-500" />
                    )}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
