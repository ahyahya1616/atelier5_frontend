import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/Station';

@Component({
  selector: 'app-station-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
          {{ isEditMode ? 'Modifier la Station' : 'Nouvelle Station' }}
        </h1>

        <!-- Message d'erreur -->
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ errorMessage }}
        </div>

        <!-- Formulaire -->
        <form (ngSubmit)="onSubmit()" #stationForm="ngForm">
          <div class="mb-4">
            <label for="nom" class="block text-gray-700 font-medium mb-2">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              [(ngModel)]="station.nom"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom de la station">
          </div>

          <div class="mb-4">
            <label for="ville" class="block text-gray-700 font-medium mb-2">Ville *</label>
            <input
              type="text"
              id="ville"
              name="ville"
              [(ngModel)]="station.ville"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ville">
          </div>

          <div class="mb-6">
            <label for="adresse" class="block text-gray-700 font-medium mb-2">Adresse *</label>
            <textarea
              id="adresse"
              name="adresse"
              [(ngModel)]="station.adresse"
              required
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adresse complète"></textarea>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              [disabled]="!stationForm.form.valid || loading"
              class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
              {{ loading ? 'En cours...' : (isEditMode ? 'Modifier' : 'Créer') }}
            </button>
            <button
              type="button"
              (click)="goBack()"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StationFormComponent implements OnInit {
  private stationService = inject(StationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  station: Station = {
    nom: '',
    ville: '',
    adresse: ''
  };

  isEditMode = false;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadStation(+id);
    }
  }

  loadStation(id: number) {
    this.loading = true;
    this.stationService.getById(id).subscribe({
      next: (data) => {
        this.station = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la station';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    const operation = this.isEditMode
      ? this.stationService.update(this.station)
      : this.stationService.create(this.station);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/stations']);
      },
      error: (error) => {
        this.errorMessage = this.isEditMode
          ? 'Erreur lors de la modification'
          : 'Erreur lors de la création';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/stations']);
  }
}
