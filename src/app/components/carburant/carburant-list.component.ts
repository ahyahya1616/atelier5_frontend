import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarburantService } from '../../services/carburant.service';
import { Carburant } from '../../models/Carburant';

@Component({
  selector: 'app-carburant-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Liste des Carburants</h1>
        <button
          (click)="navigateToCreate()"
          class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200">
          + Nouveau Carburant
        </button>
      </div>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Liste des carburants -->
      <div *ngIf="!loading && carburants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let carburant of carburants"
             class="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 p-6 border-l-4 border-green-500">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-semibold text-gray-800">{{ carburant.nom }}</h3>
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">ID: {{ carburant.id }}</span>
          </div>
          <p class="text-gray-600 mb-4 min-h-[60px]">{{ carburant.description }}</p>
          <div class="flex gap-2">
            <button
              (click)="navigateToEdit(carburant.id!)"
              class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-200">
              Modifier
            </button>
            <button
              (click)="deleteCarburant(carburant.id!)"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucun carburant -->
      <div *ngIf="!loading && carburants.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">⛽</div>
        <p class="text-gray-500 text-lg mb-2">Aucun carburant trouvé</p>
        <p class="text-gray-400 mb-4">Commencez par ajouter votre premier type de carburant</p>
        <button
          (click)="navigateToCreate()"
          class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200">
          Créer le premier carburant
        </button>
      </div>
    </div>
  `
})
export class CarburantListComponent implements OnInit {
  private carburantService = inject(CarburantService);
  private router = inject(Router);

  carburants: Carburant[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadCarburants();
  }

  loadCarburants() {
    this.loading = true;
    this.errorMessage = '';
    this.carburantService.getAll().subscribe({
      next: (data) => {
        this.carburants = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des carburants';
        console.error('Erreur:', error);
        this.loading = false;
      }
    });
  }

  deleteCarburant(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce carburant ?')) {
      this.carburantService.delete(id).subscribe({
        next: () => {
          this.loadCarburants();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  navigateToCreate() {
    this.router.navigate(['/carburants/create']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/carburants/edit', id]);
  }
}
