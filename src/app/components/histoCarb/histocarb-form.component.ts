import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HistoCarbService } from '../../services/histo-carb.service';
import { StationService } from '../../services/station.service';
import { CarburantService } from '../../services/carburant.service';
import { HistoCarb } from '../../models/HistoCarb';
import { Station } from '../../models/Station';
import { Carburant } from '../../models/Carburant';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-histocarb-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-center mb-6">
          <div class="text-4xl mr-4">📊</div>
          <h1 class="text-3xl font-bold text-gray-800">Ajouter un Prix</h1>
        </div>

        <!-- Message d'erreur -->
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ errorMessage }}
        </div>

        <!-- Loading initial -->
        <div *ngIf="loadingData" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p class="mt-2 text-gray-600">Chargement des données...</p>
        </div>

        <!-- Formulaire -->
        <form *ngIf="!loadingData" (ngSubmit)="onSubmit()" #histoForm="ngForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Station -->
            <div>
              <label for="stationId" class="block text-gray-700 font-medium mb-2">Station *</label>
              <select
                id="stationId"
                name="stationId"
                [(ngModel)]="histoCarb.stationId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option [ngValue]="null">-- Sélectionnez une station --</option>
                <option *ngFor="let station of stations" [ngValue]="station.id">
                  {{ station.nom }} - {{ station.ville }}
                </option>
              </select>
            </div>

            <!-- Carburant -->
            <div>
              <label for="carburantId" class="block text-gray-700 font-medium mb-2">Carburant *</label>
              <select
                id="carburantId"
                name="carburantId"
                [(ngModel)]="histoCarb.carburantId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option [ngValue]="null">-- Sélectionnez un carburant --</option>
                <option *ngFor="let carburant of carburants" [ngValue]="carburant.id">
                  {{ carburant.nom }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Date -->
            <div>
              <label for="date" class="block text-gray-700 font-medium mb-2">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                [(ngModel)]="histoCarb.date"
                required
                [max]="today"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <p class="text-gray-500 text-sm mt-1">Date du relevé de prix</p>
            </div>

            <!-- Prix -->
            <div>
              <label for="prix" class="block text-gray-700 font-medium mb-2">Prix (DH) *</label>
              <input
                type="number"
                id="prix"
                name="prix"
                [(ngModel)]="histoCarb.prix"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 12.50">
              <p class="text-gray-500 text-sm mt-1">Prix par litre</p>
            </div>
          </div>

          <!-- Aperçu -->
          <div *ngIf="isFormValid()" class="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h3 class="text-sm font-semibold text-purple-800 mb-3">📋 Aperçu :</h3>
            <div class="bg-white p-4 rounded border-l-4 border-purple-500">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-600">Station:</span>
                  <span class="ml-2 font-semibold">{{ getStationName() }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Carburant:</span>
                  <span class="ml-2 font-semibold text-green-600">{{ getCarburantName() }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Date:</span>
                  <span class="ml-2 font-semibold">{{ formatDate(histoCarb.date) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Prix:</span>
                  <span class="ml-2 font-bold text-purple-600 text-lg">{{ histoCarb.prix }} DH</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex gap-4">
            <button
              type="submit"
              [disabled]="!histoForm.form.valid || loading"
              class="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button
              type="button"
              (click)="goBack()"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
              Annuler
            </button>
          </div>
        </form>

        <!-- Message si pas de données -->
        <div *ngIf="!loadingData && (stations.length === 0 || carburants.length === 0)"
             class="text-center py-8">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-gray-600 text-lg mb-4">
            Vous devez d'abord créer des stations et des carburants
          </p>
          <div class="flex gap-4 justify-center">
            <button
              *ngIf="stations.length === 0"
              (click)="navigateTo('/stations/create')"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200">
              Créer une Station
            </button>
            <button
              *ngIf="carburants.length === 0"
              (click)="navigateTo('/carburants/create')"
              class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200">
              Créer un Carburant
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoCarbFormComponent implements OnInit {
  private histoCarbService = inject(HistoCarbService);
  private stationService = inject(StationService);
  private carburantService = inject(CarburantService);
  private router = inject(Router);

  histoCarb: HistoCarb = {
    date: '',
    prix: 0,
    stationId: null as any,
    carburantId: null as any
  };

  stations: Station[] = [];
  carburants: Carburant[] = [];
  today: string = '';

  loading = false;
  loadingData = false;
  errorMessage = '';

  ngOnInit() {
    // Date du jour pour max date
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.histoCarb.date = this.today;

    this.loadData();
  }

  loadData() {
    this.loadingData = true;
    this.errorMessage = '';

    forkJoin({
      stations: this.stationService.getAll(),
      carburants: this.carburantService.getAll()
    }).subscribe({
      next: (data) => {
        this.stations = data.stations;
        this.carburants = data.carburants;
        this.loadingData = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des données';
        console.error('Erreur:', error);
        this.loadingData = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.histoCarbService.create(this.histoCarb).subscribe({
      next: () => {
        this.router.navigate(['/histocarb']);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'enregistrement du prix';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.histoCarb.stationId &&
      this.histoCarb.carburantId &&
      this.histoCarb.date &&
      this.histoCarb.prix > 0);
  }

  getStationName(): string {
    const station = this.stations.find(s => s.id === this.histoCarb.stationId);
    return station ? `${station.nom} (${station.ville})` : '';
  }

  getCarburantName(): string {
    const carburant = this.carburants.find(c => c.id === this.histoCarb.carburantId);
    return carburant ? carburant.nom : '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/histocarb']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
