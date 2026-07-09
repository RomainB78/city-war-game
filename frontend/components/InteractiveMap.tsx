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
    path: "M 744,163 L 730,198 L 692,244 L 603,306 L 565,263 L 565,266 L 593,183 L 611,178 L 632,156 Z",
    labelX: 665,
    labelY: 179,
  },
  sartrouville: {
    path: "M 677,382 L 668,393 L 649,376 L 651,360 L 606,316 L 703,244 L 735,211 L 767,224 L 827,235 L 827,277 L 823,291 L 809,312 L 773,305 L 745,304 L 721,318 L 706,337 L 692,356 L 683,372 Z",
    labelX: 768,
    labelY: 250,
  },
  bezons: {
    path: "M 824,383 L 806,314 L 816,301 L 818,292 L 818,293 L 832,278 L 853,295 L 868,297 L 874,311 L 887,325 L 905,337 L 919,351 L 896,376 L 869,405 L 811,448 L 800,439 L 820,420 L 804,400 L 824,385 Z",
    labelX: 864,
    labelY: 388,
  },
  houilles: {
    path: "M 767,405 L 758,398 L 732,413 L 715,386 L 695,359 L 713,336 L 737,307 L 760,304 L 779,308 L 779,308 L 805,309 L 822,383 L 787,410 L 783,400 Z",
    labelX: 741,
    labelY: 328,
  },
  carrieres: {
    path: "M 664,394 L 672,388 L 696,358 L 730,413 L 747,405 L 757,398 L 765,406 L 781,403 L 788,412 L 800,400 L 816,422 L 800,434 L 804,452 L 776,468 L 745,491 L 715,503 L 696,487 L 683,475 L 669,458 L 674,444 L 663,423 L 669,404 Z",
    labelX: 735,
    labelY: 418,
  },
  chatou: {
    path: "M 609,589 L 620,562 L 608,557 L 609,545 L 631,545 L 631,540 L 616,536 L 606,522 L 596,502 L 572,446 L 562,465 L 542,459 L 567,433 L 574,437 L 576,437 L 592,443 L 607,484 L 638,468 L 638,468 L 670,458 L 715,505 L 700,527 L 687,550 L 663,606 L 641,598 L 646,596 L 651,600 L 642,597 Z",
    labelX: 657,
    labelY: 497,
  },
  montesson: {
    path: "M 508,473 L 520,435 L 542,398 L 542,397 L 567,361 L 606,314 L 648,365 L 646,374 L 666,393 L 672,410 L 664,426 L 674,452 L 660,463 L 639,476 L 627,476 L 605,486 L 592,444 L 563,433 L 546,457 L 546,457 L 521,483 L 506,478 Z",
    labelX: 607,
    labelY: 427,
  },
  le_mesnil: {
    path: "M 482,408 L 501,358 L 525,339 L 531,322 L 533,281 L 563,266 L 598,308 L 539,379 L 499,466 L 480,458 Z",
    labelX: 540,
    labelY: 360,
  },
  saint_germain: {
    path: "M 281,618 L 260,633 L 237,623 L 245,577 L 255,560 L 285,524 L 285,522 L 295,511 L 290,477 L 286,457 L 247,415 L 279,370 L 328,318 L 314,293 L 344,262 L 367,220 L 365,156 L 414,107 L 413,49 L 480,65 L 512,48 L 567,46 L 617,52 L 643,64 L 643,64 L 674,80 L 674,80 L 699,112 L 712,155 L 661,157 L 628,155 L 605,180 L 589,181 L 563,263 L 529,283 L 530,327 L 499,363 L 482,405 L 478,415 L 475,465 L 461,497 L 445,557 L 411,571 L 356,571 L 335,611 Z",
    labelX: 360,
    labelY: 405,
  },
  le_vesinet: {
    path: "M 512,519 L 503,497 L 522,485 L 543,461 L 560,464 L 568,454 L 573,448 L 575,451 L 582,476 L 597,507 L 609,526 L 623,535 L 630,548 L 602,540 L 608,558 L 620,564 L 611,592 L 576,580 L 558,625 L 519,577 Z",
    labelX: 549,
    labelY: 523,
  },
  le_pecq: {
    path: "M 425,566 L 445,555 L 454,530 L 454,525 L 470,470 L 484,464 L 525,482 L 517,493 L 504,490 L 504,511 L 512,526 L 516,555 L 458,579 L 450,610 L 450,610 L 437,620 L 420,608 L 418,591 L 421,576 Z",
    labelX: 450,
    labelY: 550,
  },
  croissy: {
    path: "M 578,654 L 545,639 L 559,647 L 530,629 L 520,618 L 509,598 L 502,591 L 498,576 L 498,559 L 498,559 L 512,555 L 512,555 L 530,587 L 559,629 L 578,581 L 618,592 L 659,607 L 654,622 L 644,636 L 630,647 L 617,657 L 597,661 Z",
    labelX: 605,
    labelY: 602,
  },
  port_marly: {
    path: "M 465,573 L 479,571 L 489,570 L 496,601 L 517,629 L 487,642 L 471,641 L 475,613 L 453,608 L 455,581 Z",
    labelX: 454,
    labelY: 623,
  },
  louveciennes: {
    path: "M 492,638 L 511,632 L 530,640 L 553,655 L 566,673 L 567,675 L 575,704 L 575,707 L 575,707 L 557,722 L 557,722 L 547,743 L 537,768 L 519,779 L 519,779 L 506,774 L 480,760 L 475,735 L 471,699 L 481,678 Z",
    labelX: 530,
    labelY: 750,
  },
  marly: {
    path: "M 396,767 L 387,748 L 358,729 L 359,704 L 359,704 L 383,675 L 381,647 L 389,629 L 418,607 L 438,620 L 454,607 L 469,621 L 470,643 L 487,644 L 484,670 L 477,684 L 473,701 L 476,729 L 476,753 L 462,755 L 462,755 L 451,768 L 451,768 L 443,786 L 413,785 L 395,769 Z",
    labelX: 430,
    labelY: 667,
  },
  mareil_marly: {
    path: "M 392,571 L 422,567 L 416,588 L 418,606 L 407,615 L 399,619 L 378,638 L 358,640 L 354,641 L 328,647 L 339,627 L 337,610 L 353,573 Z",
    labelX: 345,
    labelY: 605,
  },
  etang: {
    path: "M 279,617 L 335,610 L 339,625 L 330,646 L 353,641 L 374,635 L 388,661 L 375,682 L 356,703 L 363,738 L 347,749 L 308,731 L 285,712 L 248,686 L 248,686 L 228,665 L 243,643 Z",
    labelX: 302,
    labelY: 709,
  },
  chambourcy: {
    path: "M 121,534 L 121,534 L 142,515 L 164,537 L 196,526 L 204,481 L 204,481 L 194,461 L 193,433 L 193,433 L 244,408 L 289,465 L 285,487 L 294,513 L 294,513 L 246,568 L 234,616 L 203,601 L 103,552 Z",
    labelX: 215,
    labelY: 535,
  },
  aigremont: {
    path: "M 166,437 L 189,433 L 193,462 L 204,477 L 202,492 L 198,518 L 179,530 L 182,530 L 163,534 L 145,521 L 133,526 L 116,537 L 96,545 L 85,540 L 76,520 L 94,505 L 103,495 L 119,476 L 144,467 Z",
    labelX: 131,
    labelY: 468,
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
