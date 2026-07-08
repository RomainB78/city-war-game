import { Faction } from './index';

export interface InitialCityConfig {
  cityKey: string;
  name: string;
  faction: Faction;
  bastionCount: number;
  soldiersPerBastion: number;
}

export const INITIAL_CITIES_CONFIG: Record<string, InitialCityConfig> = {
  // Chatou Faction (Blue)
  chatou: {
    cityKey: 'chatou',
    name: 'Chatou',
    faction: 'CHATOU',
    bastionCount: 5,
    soldiersPerBastion: 5836,
  },
  croissy: {
    cityKey: 'croissy',
    name: 'Croissy-sur-Seine',
    faction: 'CHATOU',
    bastionCount: 3,
    soldiersPerBastion: 3023,
  },
  houilles: {
    cityKey: 'houilles',
    name: 'Houilles',
    faction: 'CHATOU',
    bastionCount: 4,
    soldiersPerBastion: 7551,
  },
  carrieres: {
    cityKey: 'carrieres',
    name: 'Carrières-sur-Seine',
    faction: 'CHATOU',
    bastionCount: 5,
    soldiersPerBastion: 2996,
  },
  montesson: {
    cityKey: 'montesson',
    name: 'Montesson',
    faction: 'CHATOU',
    bastionCount: 7,
    soldiersPerBastion: 1972,
  },
  le_mesnil: {
    cityKey: 'le_mesnil',
    name: 'Le Mesnil-le-Roi',
    faction: 'CHATOU',
    bastionCount: 3,
    soldiersPerBastion: 1933,
  },
  bezons: {
    cityKey: 'bezons',
    name: 'Bezons',
    faction: 'CHATOU',
    bastionCount: 4,
    soldiersPerBastion: 9108,
  },
  louveciennes: {
    cityKey: 'louveciennes',
    name: 'Louveciennes',
    faction: 'CHATOU',
    bastionCount: 5,
    soldiersPerBastion: 1598,
  },
  marly: {
    cityKey: 'marly',
    name: 'Marly-le-Roi',
    faction: 'CHATOU',
    bastionCount: 7,
    soldiersPerBastion: 2393,
  },

  // Ville Impériale Faction (Red)
  saint_germain: {
    cityKey: 'saint_germain',
    name: 'Saint-Germain-en-Laye',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 52,
    soldiersPerBastion: 854,
  },
  le_vesinet: {
    cityKey: 'le_vesinet',
    name: 'Le Vésinet',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 5,
    soldiersPerBastion: 3129,
  },
  le_pecq: {
    cityKey: 'le_pecq',
    name: 'Le Pecq',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 3,
    soldiersPerBastion: 5575,
  },
  port_marly: {
    cityKey: 'port_marly',
    name: 'Le Port-Marly',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 2,
    soldiersPerBastion: 3894,
  },
  sartrouville: {
    cityKey: 'sartrouville',
    name: 'Sartrouville',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 8,
    soldiersPerBastion: 6054,
  },
  maisons_laffitte: {
    cityKey: 'maisons_laffitte',
    name: 'Maisons-Laffitte',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 7,
    soldiersPerBastion: 3419,
  },
  mareil_marly: {
    cityKey: 'mareil_marly',
    name: 'Mareil-Marly',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 2,
    soldiersPerBastion: 2070,
  },
  etang: {
    cityKey: 'etang',
    name: "L'Étang-la-Ville",
    faction: 'VILLE_IMPERIALE',
    bastionCount: 5,
    soldiersPerBastion: 1031,
  },
  chambourcy: {
    cityKey: 'chambourcy',
    name: 'Chambourcy',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 8,
    soldiersPerBastion: 730,
  },
  aigremont: {
    cityKey: 'aigremont',
    name: 'Aigremont',
    faction: 'VILLE_IMPERIALE',
    bastionCount: 4,
    soldiersPerBastion: 268,
  },
};

// Adjacency Graph: lists neighboring city keys for each city key
export const ADJACENCY_MAP: Record<string, string[]> = {
  aigremont: ['chambourcy', 'saint_germain'],
  chambourcy: ['aigremont', 'saint_germain', 'etang', 'mareil_marly'],
  etang: ['chambourcy', 'saint_germain', 'mareil_marly', 'marly'],
  mareil_marly: ['chambourcy', 'etang', 'saint_germain', 'marly', 'port_marly', 'le_pecq'],
  marly: ['etang', 'mareil_marly', 'port_marly', 'louveciennes'],
  louveciennes: ['marly', 'port_marly', 'croissy'],
  port_marly: ['mareil_marly', 'marly', 'louveciennes', 'le_pecq', 'croissy'],
  le_pecq: ['saint_germain', 'mareil_marly', 'port_marly', 'croissy', 'le_vesinet', 'montesson'],
  le_vesinet: ['le_pecq', 'montesson', 'chatou', 'croissy'],
  croissy: ['louveciennes', 'port_marly', 'le_pecq', 'le_vesinet', 'chatou'],
  chatou: ['croissy', 'le_vesinet', 'montesson', 'carrieres'],
  montesson: ['le_pecq', 'le_vesinet', 'chatou', 'le_mesnil', 'sartrouville', 'houilles', 'carrieres'],
  le_mesnil: ['saint_germain', 'maisons_laffitte', 'montesson'],
  saint_germain: ['aigremont', 'chambourcy', 'etang', 'mareil_marly', 'le_pecq', 'le_mesnil', 'maisons_laffitte'],
  maisons_laffitte: ['saint_germain', 'le_mesnil', 'sartrouville'],
  sartrouville: ['maisons_laffitte', 'montesson', 'houilles', 'bezons'],
  houilles: ['sartrouville', 'montesson', 'carrieres', 'bezons'],
  bezons: ['sartrouville', 'houilles', 'carrieres'],
  carrieres: ['bezons', 'houilles', 'montesson', 'chatou'],
};
