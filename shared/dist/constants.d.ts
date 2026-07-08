import { Faction } from './index';
export interface InitialCityConfig {
    cityKey: string;
    name: string;
    faction: Faction;
    bastionCount: number;
    soldiersPerBastion: number;
}
export declare const INITIAL_CITIES_CONFIG: Record<string, InitialCityConfig>;
export declare const ADJACENCY_MAP: Record<string, string[]>;
