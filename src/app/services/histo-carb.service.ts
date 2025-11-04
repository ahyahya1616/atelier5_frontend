import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoCarb } from '../models/HistoCarb';
import { APP_CONFIG } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class HistoCarbService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONFIG.apiBaseUrl}/histocarb`;

  // POST ajouter un HistoCarb
  create(histo: Omit<HistoCarb, 'id'>): Observable<HistoCarb> {
    return this.http.post<HistoCarb>(this.baseUrl, histo);
  }

  // GET HistoCarb par station
  getByStation(stationId: number): Observable<HistoCarb[]> {
    return this.http.get<HistoCarb[]>(`${this.baseUrl}/station/${stationId}`);
  }

  // GET HistoCarb par station et carburant
  getByStationAndCarburant(stationId: number, carburantId: number): Observable<HistoCarb[]> {
    return this.http.get<HistoCarb[]>(`${this.baseUrl}/station/${stationId}/carburant/${carburantId}`);
  }

  // DELETE un HistoCarb
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
