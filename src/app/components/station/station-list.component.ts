import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/Station';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Liste des Stations</h1>
        <button
          (click)="navigateToCreate()"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200">
          + Nouvelle Station
        </button>
      </div>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Liste des stations -->
      <div *ngIf="!loading && stations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let station of stations"
             class="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ station.nom }}</h3>
          <div class="text-gray-600 space-y-1 mb-4">
            <p><span class="font-medium">Ville:</span> {{ station.ville }}</p>
            <p><span class="font-medium">Adresse:</span> {{ station.adresse }}</p>
          </div>
          <div class="flex gap-2">
            <button
              (click)="navigateToEdit(station.id!)"
              class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-200">
              Modifier
            </button>
            <button
              (click)="deleteStation(station.id!)"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucune station -->
      <div *ngIf="!loading && stations.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">Aucune station trouvée</p>
        <button
          (click)="navigateToCreate()"
          class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200">
          Créer la première station
        </button>
      </div>
    </div>
  `
})
export class StationListComponent implements OnInit {
  private stationService = inject(StationService);
  private router = inject(Router);

  stations: Station[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loading = true;
    this.errorMessage = '';
    this.stationService.getAll().subscribe({
      next: (data) => {
        this.stations = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des stations';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  deleteStation(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette station ?')) {
      this.stationService.delete(id).subscribe({
        next: () => {
          this.loadStations();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  navigateToCreate() {
    this.router.navigate(['/stations/create']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/stations/edit', id]);
  }
}
