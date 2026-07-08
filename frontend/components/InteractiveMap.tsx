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

// Interlocking SVG Paths for the 19 cities (viewBox="0 0 1000 800")
const CITY_PATHS: Record<string, { path: string; labelX: number; labelY: number }> = {
  aigremont: {
    path: "M 50,600 L 150,550 L 180,620 L 120,680 L 50,650 Z",
    labelX: 110,
    labelY: 620,
  },
  chambourcy: {
    path: "M 150,550 L 250,500 L 290,580 L 220,670 L 180,620 Z",
    labelX: 210,
    labelY: 590,
  },
  etang: {
    path: "M 220,670 L 290,580 L 330,640 L 320,740 L 220,730 Z",
    labelX: 275,
    labelY: 680,
  },
  mareil_marly: {
    path: "M 290,580 L 350,560 L 400,640 L 350,710 L 330,640 Z",
    labelX: 345,
    labelY: 630,
  },
  marly: {
    path: "M 320,740 L 350,710 L 400,750 L 470,760 L 440,820 L 330,810 Z",
    labelX: 390,
    labelY: 775,
  },
  louveciennes: {
    path: "M 470,760 L 520,710 L 580,740 L 560,820 L 440,820 Z",
    labelX: 510,
    labelY: 775,
  },
  port_marly: {
    path: "M 400,640 L 460,630 L 520,710 L 470,760 L 400,750 Z",
    labelX: 460,
    labelY: 700,
  },
  le_pecq: {
    path: "M 450,530 L 500,530 L 520,635 L 460,630 L 400,640 Z",
    labelX: 470,
    labelY: 580,
  },
  le_vesinet: {
    path: "M 500,530 L 610,545 L 610,630 L 520,635 Z",
    labelX: 560,
    labelY: 580,
  },
  croissy: {
    path: "M 520,635 L 610,630 L 630,690 L 580,740 L 520,710 Z",
    labelX: 575,
    labelY: 680,
  },
  chatou: {
    path: "M 610,545 L 710,535 L 685,620 L 630,690 L 610,630 Z",
    labelX: 660,
    labelY: 605,
  },
  montesson: {
    path: "M 490,440 L 600,430 L 665,480 L 610,545 L 500,530 Z",
    labelX: 570,
    labelY: 485,
  },
  le_mesnil: {
    path: "M 450,330 L 530,320 L 560,400 L 490,440 Z",
    labelX: 505,
    labelY: 375,
  },
  saint_germain: {
    path: "M 250,500 L 420,380 L 450,330 L 490,440 L 500,530 L 450,530 L 350,560 L 290,580 Z",
    labelX: 360,
    labelY: 460,
  },
  maisons_laffitte: {
    path: "M 420,380 L 550,230 L 680,260 L 630,340 L 530,320 L 450,330 Z",
    labelX: 550,
    labelY: 300,
  },
  sartrouville: {
    path: "M 560,400 L 630,340 L 730,320 L 790,405 L 665,480 L 600,430 Z",
    labelX: 670,
    labelY: 400,
  },
  houilles: {
    path: "M 665,480 L 790,405 L 830,460 L 775,520 L 710,535 Z",
    labelX: 755,
    labelY: 475,
  },
  bezons: {
    path: "M 790,405 L 900,410 L 890,500 L 830,460 Z",
    labelX: 855,
    labelY: 440,
  },
  carrieres: {
    path: "M 710,535 L 775,520 L 830,460 L 890,500 L 840,580 L 685,620 Z",
    labelX: 780,
    labelY: 560,
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

  // Return background color based on Faction Owner
  const getCityColorClass = (cityKey: string, city: City) => {
    const isSelected = selectedCityId === cityKey;
    const isTarget = validTargets.includes(cityKey);
    const isUncontrolled = city.capitalId === null;

    if (selectionMode !== 'NONE' && !isTarget && !isSelected) {
      return 'fill-[#1e1c1a]/40 stroke-stone-800 pointer-events-none';
    }

    let fill = 'fill-stone-850';
    let stroke = 'stroke-amber-900/30';
    let cursor = 'cursor-pointer';

    if (isUncontrolled) {
      fill = isSelected ? 'fill-stone-600' : 'fill-stone-700/80';
      stroke = isSelected ? 'stroke-amber-400' : 'stroke-stone-600';
    } else if (city.faction === 'CHATOU') {
      fill = isSelected 
        ? 'fill-blue-900/60' 
        : isTarget 
        ? 'fill-blue-950/40 hover:fill-blue-900/40' 
        : 'fill-blue-950/20 hover:fill-blue-900/10';
      stroke = isSelected ? 'stroke-blue-400' : isTarget ? 'stroke-blue-600 animate-pulse' : 'stroke-blue-900/40';
    } else if (city.faction === 'VILLE_IMPERIALE') {
      fill = isSelected 
        ? 'fill-red-900/60' 
        : isTarget 
        ? 'fill-red-950/40 hover:fill-red-900/40' 
        : 'fill-red-950/20 hover:fill-red-900/10';
      stroke = isSelected ? 'stroke-red-400' : isTarget ? 'stroke-red-600 animate-pulse' : 'stroke-red-900/40';
    }

    if (isTarget) {
      stroke += ' stroke-[3px]';
    } else if (isSelected) {
      stroke += ' stroke-[2.5px]';
    } else {
      stroke += ' stroke-[1px] hover:stroke-[1.5px]';
    }

    return `${fill} ${stroke} ${cursor} transition-all duration-300`;
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
        className="w-full h-full bg-[#0d0c0b] border border-amber-900/20 rounded-xl shadow-2xl relative"
      >
        {/* Graticule lines (Map grid) */}
        <g className="opacity-10 pointer-events-none">
          <line x1="100" y1="0" x2="100" y2="800" stroke="#d97706" strokeWidth="0.5" />
          <line x1="300" y1="0" x2="300" y2="800" stroke="#d97706" strokeWidth="0.5" />
          <line x1="500" y1="0" x2="500" y2="800" stroke="#d97706" strokeWidth="0.5" />
          <line x1="700" y1="0" x2="700" y2="800" stroke="#d97706" strokeWidth="0.5" />
          <line x1="900" y1="0" x2="900" y2="800" stroke="#d97706" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="1000" y2="100" stroke="#d97706" strokeWidth="0.5" />
          <line x1="0" y1="300" x2="1000" y2="300" stroke="#d97706" strokeWidth="0.5" />
          <line x1="0" y1="500" x2="1000" y2="500" stroke="#d97706" strokeWidth="0.5" />
          <line x1="0" y1="700" x2="1000" y2="700" stroke="#d97706" strokeWidth="0.5" />
        </g>

        {/* Winding Seine River Path (La Seine) */}
        <path
          d="M 920,440 C 850,470 780,500 710,545 C 620,600 580,720 460,720 C 360,720 320,620 450,530 C 500,490 560,400 530,320 C 510,270 420,380 340,320 C 260,260 220,100 200,0"
          className="fill-none stroke-blue-700/30 stroke-[32px] stroke-linecap-round pointer-events-none"
        />
        <path
          d="M 920,440 C 850,470 780,500 710,545 C 620,600 580,720 460,720 C 360,720 320,620 450,530 C 500,490 560,400 530,320 C 510,270 420,380 340,320 C 260,260 220,100 200,0"
          className="fill-none stroke-blue-500/10 stroke-[40px] stroke-linecap-round filter blur-[4px] pointer-events-none"
        />

        {/* Compass Rose Decoration */}
        <g transform="translate(100, 100)" className="opacity-15 pointer-events-none">
          <circle r="45" fill="none" stroke="#d97706" strokeWidth="1" />
          <circle r="3" fill="#d97706" />
          {/* Points */}
          <path d="M 0,0 L -5,-35 L 0,-42 L 5,-35 Z" fill="#d97706" />
          <path d="M 0,0 L 5,35 L 0,42 L -5,35 Z" fill="#d97706" />
          <path d="M 0,0 L -35,5 L -42,0 L -35,-5 Z" fill="#d97706" />
          <path d="M 0,0 L 35,-5 L 42,0 L 35,5 Z" fill="#d97706" />
          <text x="-4" y="-46" fill="#d97706" className="text-[10px] font-bold font-mono">N</text>
        </g>

        {/* City Territories */}
        {Object.entries(CITY_PATHS).map(([key, item]) => {
          const city = cities[key];
          if (!city) return null;

          return (
            <g key={key} onClick={() => onSelectCity(key)}>
              <path
                d={item.path}
                className={getCityColorClass(key, city)}
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
