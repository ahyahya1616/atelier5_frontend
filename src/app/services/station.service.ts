import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station } from '../models/Station';
import { APP_CONFIG } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONFIG.apiBaseUrl}/stations`;

  // GET toutes les stations
  getAll(): Observable<Station[]> {
    return this.http.get<Station[]>(this.baseUrl);
  }

  // GET une station par ID
  getById(id: number): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/${id}`);
  }

  // POST créer une nouvelle station
  create(station: Station): Observable<Station> {
    return this.http.post<Station>(this.baseUrl, station);
  }

  // PUT mettre à jour une station
  update(station: Station): Observable<Station> {
    return this.http.put<Station>(this.baseUrl, station);
  }

  // DELETE supprimer une station par ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
