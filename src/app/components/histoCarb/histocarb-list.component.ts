import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HistoCarbService } from '../../services/histo-carb.service';
import { StationService } from '../../services/station.service';
import { CarburantService } from '../../services/carburant.service';
import { HistoCarb, HistoCarbDisplay } from '../../models/HistoCarb';
import { Station } from '../../models/Station';
import { Carburant } from '../../models/Carburant';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-histocarb-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">📊 Historique des Prix</h1>
        <button
          (click)="navigateToCreate()"
          class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition duration-200">
          + Nouveau Prix
        </button>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Filtres</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Station</label>
            <select
              [(ngModel)]="filterStationId"
              (change)="applyFilters()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option [ngValue]="null">Toutes les stations</option>
              <option *ngFor="let station of stations" [ngValue]="station.id">
                {{ station.nom }} - {{ station.ville }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">Carburant</label>
            <select
              [(ngModel)]="filterCarburantId"
              (change)="applyFilters()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option [ngValue]="null">Tous les carburants</option>
              <option *ngFor="let carburant of carburants" [ngValue]="carburant.id">
                {{ carburant.nom }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="resetFilters()"
              class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Table des historiques -->
      <div *ngIf="!loading && displayHistos.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-purple-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Station</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Carburant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Prix</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let histo of displayHistos" class="hover:bg-gray-50 transition duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatDate(histo.date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ histo.stationNom }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {{ histo.carburantNom }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-purple-600">{{ histo.prix }} DH</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button
                  (click)="deleteHisto(histo.id!)"
                  class="text-red-600 hover:text-red-900 transition duration-150">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Message si aucun historique -->
      <div *ngIf="!loading && displayHistos.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-gray-500 text-lg mb-2">Aucun historique de prix trouvé</p>
        <p class="text-gray-400 mb-4">
          {{ filterStationId || filterCarburantId ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter un prix' }}
        </p>
        <button
          (click)="navigateToCreate()"
          class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition duration-200">
          Ajouter un prix
        </button>
      </div>

      <!-- Statistiques -->
      <div *ngIf="!loading && displayHistos.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="text-gray-500 text-sm">Total d'entrées</div>
          <div class="text-2xl font-bold text-gray-800">{{ displayHistos.length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="text-gray-500 text-sm">Prix moyen</div>
          <div class="text-2xl font-bold text-purple-600">{{ calculateAverage() }} DH</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="text-gray-500 text-sm">Prix min - max</div>
          <div class="text-2xl font-bold text-gray-800">{{ getMinMax() }}</div>
        </div>
      </div>
    </div>
  `
})
export class HistoCarbListComponent implements OnInit {
  private histoCarbService = inject(HistoCarbService);
  private stationService = inject(StationService);
  private carburantService = inject(CarburantService);
  private router = inject(Router);

  displayHistos: HistoCarbDisplay[] = [];
  allHistos: HistoCarb[] = [];
  stations: Station[] = [];
  carburants: Carburant[] = [];

  filterStationId: number | null = null;
  filterCarburantId: number | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      stations: this.stationService.getAll(),
      carburants: this.carburantService.getAll()
    }).subscribe({
      next: (data) => {
        this.stations = data.stations;
        this.carburants = data.carburants;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des données';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loading = true;
    this.errorMessage = '';

    if (this.filterStationId && this.filterCarburantId) {
      // Filtrer par station ET carburant
      this.histoCarbService.getByStationAndCarburant(this.filterStationId, this.filterCarburantId).subscribe({
        next: (data) => this.processHistos(data),
        error: (error) => this.handleError(error)
      });
    } else if (this.filterStationId) {
      // Filtrer par station uniquement
      this.histoCarbService.getByStation(this.filterStationId).subscribe({
        next: (data) => this.processHistos(data),
        error: (error) => this.handleError(error)
      });
    } else {
      // Charger toutes les stations et leurs historiques
      const requests = this.stations.map(s => this.histoCarbService.getByStation(s.id!));

      if (requests.length === 0) {
        this.displayHistos = [];
        this.loading = false;
        return;
      }

      forkJoin(requests).subscribe({
        next: (results) => {
          const allData = results.flat();
          this.processHistos(allData);
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  processHistos(histos: HistoCarb[]) {
    this.allHistos = histos;
    this.displayHistos = histos.map(h => ({
      ...h,
      stationNom: this.stations.find(s => s.id === h.stationId)?.nom || 'Inconnue',
      carburantNom: this.carburants.find(c => c.id === h.carburantId)?.nom || 'Inconnu'
    }));

    // Trier par date décroissante
    this.displayHistos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.loading = false;
  }

  handleError(error: any) {
    this.errorMessage = 'Erreur lors du chargement des historiques';
    console.error('Erreur:', error);
    this.loading = false;
  }

  resetFilters() {
    this.filterStationId = null;
    this.filterCarburantId = null;
    this.applyFilters();
  }

  deleteHisto(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet historique ?')) {
      this.histoCarbService.delete(id).subscribe({
        next: () => {
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAverage(): string {
    if (this.displayHistos.length === 0) return '0.00';
    const sum = this.displayHistos.reduce((acc, h) => acc + h.prix, 0);
    return (sum / this.displayHistos.length).toFixed(2);
  }

  getMinMax(): string {
    if (this.displayHistos.length === 0) return '0 - 0';
    const prices = this.displayHistos.map(h => h.prix);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return `${min.toFixed(2)} - ${max.toFixed(2)} DH`;
  }

  navigateToCreate() {
    this.router.navigate(['/histocarb/create']);
  }
}
