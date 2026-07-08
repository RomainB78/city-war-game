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
      return 'fill-[#1a120b]/60 stroke-stone-900/40 pointer-events-none transition-all';
    }

    let fill = 'fill-stone-500/10';
    let stroke = 'stroke-stone-500/20';
    let cursor = 'cursor-pointer';

    if (isUncontrolled) {
      fill = isSelected ? 'fill-stone-600/45' : 'fill-stone-600/15 hover:fill-stone-600/25';
      stroke = isSelected ? 'stroke-amber-500' : 'stroke-stone-500/30';
    } else if (city.faction === 'CHATOU') {
      fill = isSelected 
        ? 'fill-blue-500/40' 
        : isTarget 
        ? 'fill-blue-500/25 hover:fill-blue-500/35' 
        : 'fill-blue-500/12 hover:fill-blue-500/22';
      stroke = isSelected ? 'stroke-blue-400' : isTarget ? 'stroke-blue-500 animate-pulse' : 'stroke-blue-500/30';
    } else if (city.faction === 'VILLE_IMPERIALE') {
      fill = isSelected 
        ? 'fill-red-500/40' 
        : isTarget 
        ? 'fill-red-500/25 hover:fill-red-500/35' 
        : 'fill-red-500/12 hover:fill-red-500/22';
      stroke = isSelected ? 'stroke-red-400' : isTarget ? 'stroke-red-500 animate-pulse' : 'stroke-red-500/30';
    }

    if (isTarget) {
      stroke += ' stroke-[3.5px]';
    } else if (isSelected) {
      stroke += ' stroke-[2.5px]';
    } else {
      stroke += ' stroke-[1.2px] hover:stroke-[1.8px]';
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
