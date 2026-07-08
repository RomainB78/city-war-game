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

// Interlocking SVG Paths for the 19 cities aligning with map.jpg boundaries (viewBox="0 0 1000 800")
const CITY_PATHS: Record<string, { path: string; labelX: number; labelY: number }> = {
  maisons_laffitte: {
    path: "M 440,70 L 640,75 L 680,180 L 640,280 L 530,260 L 450,200 Z",
    labelX: 550,
    labelY: 170,
  },
  sartrouville: {
    path: "M 640,280 L 680,180 L 830,200 L 880,310 L 780,380 L 670,370 Z",
    labelX: 755,
    labelY: 280,
  },
  bezons: {
    path: "M 780,380 L 880,310 L 940,370 L 930,490 L 830,470 Z",
    labelX: 865,
    labelY: 410,
  },
  houilles: {
    path: "M 670,370 L 780,380 L 830,470 L 760,520 L 680,470 Z",
    labelX: 745,
    labelY: 440,
  },
  carrieres: {
    path: "M 680,470 L 760,520 L 830,470 L 870,550 L 800,640 L 670,600 Z",
    labelX: 760,
    labelY: 560,
  },
  chatou: {
    path: "M 590,500 L 680,470 L 670,600 L 580,630 Z",
    labelX: 630,
    labelY: 555,
  },
  montesson: {
    path: "M 490,360 L 670,370 L 680,470 L 590,500 L 490,490 Z",
    labelX: 580,
    labelY: 435,
  },
  le_mesnil: {
    path: "M 450,200 L 530,260 L 640,280 L 670,370 L 490,360 L 450,280 Z",
    labelX: 535,
    labelY: 295,
  },
  saint_germain: {
    path: "M 230,410 L 410,270 L 450,200 L 450,280 L 490,360 L 490,490 L 440,500 L 350,520 L 270,520 Z",
    labelX: 360,
    labelY: 405,
  },
  le_vesinet: {
    path: "M 490,490 L 590,500 L 580,590 L 490,590 Z",
    labelX: 540,
    labelY: 545,
  },
  le_pecq: {
    path: "M 440,500 L 490,490 L 490,590 L 430,600 L 390,570 Z",
    labelX: 450,
    labelY: 550,
  },
  croissy: {
    path: "M 490,590 L 580,590 L 580,630 L 670,600 L 630,700 L 520,680 Z",
    labelX: 575,
    labelY: 645,
  },
  port_marly: {
    path: "M 390,570 L 430,600 L 490,590 L 520,680 L 450,710 L 390,660 Z",
    labelX: 450,
    labelY: 650,
  },
  louveciennes: {
    path: "M 450,710 L 520,680 L 630,700 L 590,800 L 460,800 Z",
    labelX: 530,
    labelY: 750,
  },
  marly: {
    path: "M 330,680 L 390,660 L 450,710 L 460,800 L 340,800 Z",
    labelX: 400,
    labelY: 745,
  },
  mareil_marly: {
    path: "M 280,550 L 350,520 L 390,570 L 390,660 L 330,680 L 300,620 Z",
    labelX: 345,
    labelY: 605,
  },
  etang: {
    path: "M 220,630 L 300,620 L 330,680 L 340,800 L 230,770 Z",
    labelX: 280,
    labelY: 705,
  },
  chambourcy: {
    path: "M 150,510 L 230,410 L 270,520 L 280,550 L 220,630 L 160,590 Z",
    labelX: 215,
    labelY: 535,
  },
  aigremont: {
    path: "M 50,570 L 150,510 L 160,590 L 220,630 L 150,700 L 50,640 Z",
    labelX: 125,
    labelY: 615,
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
