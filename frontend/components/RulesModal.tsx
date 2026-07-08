import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  if (!isOpen) return null;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 1 : Présentation & Factions
            </h3>
            <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <div className="bg-[#1c120a]/30 border border-amber-900/20 p-3 rounded-lg">
                <span className="font-semibold text-amber-400 font-serif">Objectif :</span>
                <p className="mt-1">
                  Jeu de stratégie au tour par tour pour 2 joueurs. Chaque joueur contrôle une faction composée de plusieurs villes. La partie est remportée lorsqu'une faction a perdu <strong>toutes ses capitales</strong>.
                </p>
              </div>

              <div>
                <span className="font-semibold text-stone-200 block mb-1 font-serif">Factions :</span>
                <ul className="list-disc list-inside space-y-1 pl-2 text-stone-300">
                  <li><strong className="text-blue-400">Faction Chatou</strong> : Chatou (5 bastions/5836 soldats), Croissy (3b/3023), Houilles (4b/7551), Carrières (5b/2996), Montesson (7b/1972), Le Mesnil (3b/1933), Bezons (4b/9108), Louveciennes (5b/1598), Marly-le-Roi (7b/2393).</li>
                  <li><strong className="text-red-400">Faction Saint-Germain-en-Laye</strong> : Saint-Germain-en-Laye (52b/854), Le Vésinet (5b/3129), Le Pecq (3b/5575), Port-Marly (2b/3894), Sartrouville (8b/6054), Maisons-Laffitte (7b/3419), Mareil-Marly (2b/2070), L'Étang-la-Ville (5b/1031), Chambourcy (8b/730), Aigremont (4b/268).</li>
                </ul>
              </div>

              <div className="border-t border-stone-800 pt-3">
                <span className="font-semibold text-stone-250 font-serif">Définitions :</span>
                <p className="mt-1">
                  <strong>Ville :</strong> Territoire appartenant à une faction. Le nombre de bastions représente la taille du territoire. Les bastions initiaux d'une même ville ont le même nombre de soldats. Elle conserve son nom.
                </p>
                <p className="mt-1">
                  <strong>Bastion :</strong> Armée composée de soldats. Les soldats restent toujours attachés à leur bastion.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 2 : Échange - Conditions détaillées
            </h3>
            <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <span className="text-amber-600 font-bold font-serif uppercase block text-xs tracking-wider">Action : Échanger des bastions (Page 1)</span>
              
              <div className="space-y-3">
                <div>
                  <strong className="text-stone-200 block font-serif">• Villes voisines</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    La contiguïté territoriale est une condition absolue. Les deux villes concernées doivent partager une frontière commune ou être reliées par une voie commerciale sécurisée pour que l'échange soit logistiquement réalisable, assurant ainsi la cohérence du territoire.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-200 block font-serif">• Un seul bastion par sens</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    L'échange doit être réciproque et parfaitement équilibré. Une seule unité de bastion, avec l'intégralité de ses soldats et de son commandement, peut être envoyée de chaque ville vers l'autre. Les transferts d'unités multiples ou les échanges déséquilibrés sont proscrits.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-200 block font-serif">• Pas une capitale</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    La structure de commandement central doit être impérativement préservée. Aucun des bastions échangés ne peut être la capitale de sa ville d'origine, ni en devenir une à son arrivée, afin de protéger l'intégrité de l'État-Major.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 3 : Échange - Fonctionnement & Exemple
            </h3>
            <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <span className="text-amber-600 font-bold font-serif uppercase block text-xs tracking-wider">Action : Échanger des bastions (Suite)</span>
              
              <div>
                <strong className="text-stone-200 block font-serif">Fonctionnement :</strong>
                <p className="text-xs text-stone-400 mt-1">
                  Le processus d'échange est simple : les deux joueurs s'accordent, désignent les bastions, et ceux-ci permutent leurs positions instantanément. Les soldats sont intégrés à la nouvelle ville. Le nombre total de soldats reste inchangé pour chaque bastion. Il n'y a pas de mouvement de troupes supplémentaire.
                </p>
              </div>

              <div className="bg-[#1c120a]/30 border border-amber-950/40 p-3 rounded-lg text-xs space-y-2">
                <span className="font-semibold text-amber-500 font-serif">Exemple :</span>
                <ul className="list-disc list-inside space-y-1 text-stone-300">
                  <li><strong>Situation initiale :</strong> Ville A (5 bastions de 1000 soldats), Ville B (2 bastions de 2000 soldats).</li>
                  <li><strong>Déroulement :</strong> Les joueurs échangent le bastion 1 de la Ville A avec le bastion 2 de la Ville B.</li>
                  <li><strong>Résultat :</strong> Ville A possède 5 bastions dont un de 2000 soldats, et Ville B possède 2 bastions dont un de 1000 soldats.</li>
                </ul>
              </div>

              <div className="border-l-2 border-amber-500/30 pl-3">
                <span className="font-semibold text-stone-200 block text-xs font-serif uppercase">Note absolue :</span>
                <p className="text-[11px] text-stone-400 mt-1">
                  L'action déplace le <strong>bastion entier avec ses soldats</strong>. Le nombre de soldats dans chaque bastion reste constant. Aucun transfert de soldats <em>entre</em> les bastions n'est effectué au cours de cette action.
                </p>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 4 : Attaque - Conditions d'engagement
            </h3>
            <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <span className="text-amber-600 font-bold font-serif uppercase block text-xs tracking-wider">Action : Attaquer et attaque d'une capitale (Page 2)</span>
              
              <div className="space-y-3">
                <div>
                  <strong className="text-stone-200 block font-serif">• Ville possédant au moins 2 bastions</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    La sécurité intérieure est critique. Une ville ne peut lancer une offensive que si elle conserve au moins un bastion pour assurer sa propre défense après le départ de l'attaquant. Elle doit donc avoir 2 bastions au minimum pour que l'action soit valide.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-200 block font-serif">• Pas la capitale</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    La capitale est le cœur du commandement. Elle est trop précieuse pour être risquée dans une attaque directe. Un bastion désigné comme capitale ne peut <strong>jamais</strong> être utilisé comme bastion attaquant.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-200 block font-serif">• Au moins 10 soldats</strong>
                  <p className="text-xs text-stone-400 pl-3">
                    La puissance offensive minimale est requise. Un bastion doit disposer d'un effectif minimal de 10 soldats valides pour former une unité de combat capable de lancer un assaut significatif.
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-500 italic mt-2 border-t border-stone-850 pt-2">
                Il n'existe aucune limite au nombre d'attaques qu'un bastion peut effectuer au cours de la partie, sous réserve de remplir toutes les conditions d'engagement à chaque tentative. La puissance offensive n'est pas limitée par le temps.
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 5 : Attaque - Choix libres & Capitale
            </h3>
            <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
              <div>
                <strong className="text-stone-200 block font-serif">Le choix libre du joueur :</strong>
                <p className="text-xs text-stone-400 mt-1">
                  Le joueur dont c'est le tour a la liberté absolue et discrétionnaire de choisir tous les paramètres suivants sans contrainte extérieure :
                </p>
                <ul className="list-disc list-inside text-xs text-stone-400 pl-2 space-y-0.5 mt-1">
                  <li>La ville attaquante (celle qui lance l'offensive).</li>
                  <li>Le bastion attaquant (spécifique au sein de la ville).</li>
                  <li>Une ville ennemie voisine (cible de l'offensive).</li>
                  <li>N'importe quel bastion ennemi au sein de la ville cible (fortifié ou simple).</li>
                </ul>
              </div>

              <div className="border-t border-stone-800 pt-3">
                <strong className="text-stone-200 block font-serif">Attaque d'une capitale (Guide complet) :</strong>
                <p className="text-xs text-stone-400 mt-1">
                  Lorsque le bastion ciblé par l'attaque est désigné comme une capitale : le bastion de la capitale, une fois détruit ou capturé, perd immédiatement son statut de commandement et d'immunité.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Une nouvelle capitale <strong>ne peut plus être désignée</strong> dans cette ville pour le restant de la partie. Cela a un impact stratégique majeur, affaiblissant la ville et limitant ses options de défense et de contrôle.
                </p>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-500 border-b border-amber-500/20 pb-2 font-serif uppercase">
              Page 6 : Déroulement, Destruction & Conquête
            </h3>
            <div className="space-y-2 text-stone-300 text-xs leading-normal">
              <div>
                <strong className="text-stone-200 block font-serif">Déroulement d'un tour :</strong>
                <p className="text-stone-400">
                  Les joueurs jouent chacun à leur tour. À chaque tour, un joueur peut effectuer <strong>une seule</strong> des actions suivantes : échanger des bastions OU attaquer.
                </p>
              </div>

              <div className="bg-[#1c120a]/30 border border-amber-950/20 p-2.5 rounded-lg space-y-1.5">
                <strong className="text-stone-200 block font-serif">Destruction de capitale (Règles irrévocables) :</strong>
                <p className="text-stone-400">
                  Une capitale est détruite lorsqu'il n'existe plus aucun autre bastion dans la ville sur lequel elle pourrait être déplacée.
                </p>
                <p className="text-stone-400">
                  Autrement dit : lorsqu'une ville ne possède plus qu'un seul bastion, celui-ci est forcément la capitale. Si ce bastion est attaqué, la capitale est immédiatement détruite avant la bataille. Une ville dont la capitale a été détruite ne peut jamais recréer de capitale.
                </p>
                <p className="text-amber-500 font-semibold">
                  Après destruction de la capitale : le joueur perd définitivement le contrôle actif de cette ville. Le dernier bastion ne peut plus attaquer, ni être échangé. Il continue à défendre automatiquement. Les soldats deviennent sans commandement et ne changent jamais de camp.
                </p>
              </div>

              <div>
                <strong className="text-stone-200 block font-serif">Conquête d'une ville :</strong>
                <p className="text-stone-400">
                  Une ville est conquise lorsque son dernier bastion est détruit. Lors de la conquête : le territoire change immédiatement de propriétaire, la ville conserve son nom, le bastion ayant porté le coup final est transféré dans cette ville et devient le premier bastion du territoire conquis (conserve ses soldats et son état).
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1c1917] border-2 border-[#d97706]/40 rounded-xl max-w-xl w-full shadow-2xl relative flex flex-col glow-gold overflow-hidden">
        {/* Banner header decoration */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-4 border-b-2 border-amber-600/30 flex justify-between items-center">
          <span className="font-serif text-lg tracking-wider text-amber-400 font-bold">RÈGLES DE LA GUERRE</span>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-red-400 transition-colors p-1 hover:bg-stone-800 rounded-md border border-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body with parchment styling */}
        <div className="p-6 md:p-8 min-h-[360px] bg-gradient-to-b from-[#1c1917] to-[#12100e] overflow-y-auto">
          {renderPageContent()}
        </div>

        {/* Footer navigation */}
        <div className="bg-stone-950/60 p-4 border-t border-amber-950/20 flex justify-between items-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-semibold text-blue-400 disabled:text-stone-600 hover:disabled:text-stone-600 hover:text-blue-300 transition-colors px-3 py-1.5 rounded bg-stone-900/60 border border-stone-800 disabled:border-stone-900"
          >
            <ChevronLeft size={16} /> Précédent
          </button>

          <span className="text-xs text-stone-500 font-mono">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-blue-400 disabled:text-stone-600 hover:disabled:text-stone-600 hover:text-blue-300 transition-colors px-3 py-1.5 rounded bg-stone-900/60 border border-stone-800 disabled:border-stone-900"
          >
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
