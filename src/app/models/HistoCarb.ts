export interface HistoCarb {
  id?: number;
  date: string; // ou Date si tu transformes
  prix: number;
  stationId: number;
  carburantId: number;
}


// Interface étendue pour l'affichage (avec noms)
export interface HistoCarbDisplay extends HistoCarb {
  stationNom?: string;
  carburantNom?: string;
}
