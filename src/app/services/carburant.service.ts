// app/services/carburant.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carburant } from '../models/Carburant';
import { APP_CONFIG } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class CarburantService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONFIG.apiBaseUrl}/carburants`;

  // GET tous les carburants
  getAll(): Observable<Carburant[]> {
    return this.http.get<Carburant[]>(this.baseUrl);
  }

  // GET un carburant par ID
  getById(id: number): Observable<Carburant> {
    return this.http.get<Carburant>(`${this.baseUrl}/${id}`);
  }

  // POST ajouter un carburant
  create(carburant: Omit<Carburant, 'id'>): Observable<Carburant> {
    return this.http.post<Carburant>(this.baseUrl, carburant);
  }

  // PUT mettre à jour un carburant
  update(carburant: Carburant): Observable<Carburant> {
    return this.http.put<Carburant>(this.baseUrl, carburant);
  }

  // DELETE supprimer un carburant par ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
