import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CarburantService } from '../../services/carburant.service';
import { Carburant } from '../../models/Carburant';

@Component({
  selector: 'app-carburant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">
            {{ isEditMode ? 'Modifier le Carburant' : 'Nouveau Carburant' }}
          </h1>
        </div>

        <!-- Message d'erreur -->
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ errorMessage }}
        </div>

        <!-- Formulaire -->
        <form (ngSubmit)="onSubmit()" #carburantForm="ngForm">
          <div class="mb-4">
            <label for="nom" class="block text-gray-700 font-medium mb-2">Nom du Carburant *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              [(ngModel)]="carburant.nom"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Essence, Diesel, GPL...">
            <p class="text-gray-500 text-sm mt-1">Le type de carburant (Essence 95, Diesel, etc.)</p>
          </div>

          <div class="mb-6">
            <label for="description" class="block text-gray-700 font-medium mb-2">Description *</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="carburant.description"
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Description détaillée du carburant, ses caractéristiques..."></textarea>
            <p class="text-gray-500 text-sm mt-1">Ajoutez des détails sur le carburant</p>
          </div>

          <!-- Prévisualisation -->
          <div *ngIf="carburant.nom || carburant.description" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 class="text-sm font-semibold text-gray-600 mb-2">Aperçu :</h3>
            <div class="bg-white p-4 rounded border-l-4 border-green-500">
              <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ carburant.nom || 'Nom du carburant' }}</h4>
              <p class="text-gray-600">{{ carburant.description || 'Description du carburant' }}</p>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              [disabled]="!carburantForm.form.valid || loading"
              class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition duration-200 font-medium">
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
export class CarburantFormComponent implements OnInit {
  private carburantService = inject(CarburantService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  carburant: Carburant = {
    nom: '',
    description: ''
  };

  isEditMode = false;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadCarburant(+id);
    }
  }

  loadCarburant(id: number) {
    this.loading = true;
    this.carburantService.getById(id).subscribe({
      next: (data) => {
        this.carburant = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du carburant';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    const operation = this.isEditMode
      ? this.carburantService.update(this.carburant)
      : this.carburantService.create(this.carburant);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/carburants']);
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
    this.router.navigate(['/carburants']);
  }
}
