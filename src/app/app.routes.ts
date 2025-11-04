import { Routes } from '@angular/router';
import {StationListComponent} from './components/station/station-list.component';
import {StationFormComponent} from './components/station/station-form.component';
import {CarburantListComponent} from './components/carburant/carburant-list.component';
import {CarburantFormComponent} from './components/carburant/carburant-form.component';
import {HistoCarbListComponent} from './components/histoCarb/histocarb-list.component';
import {HistoCarbFormComponent} from './components/histoCarb/histocarb-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/stations', pathMatch: 'full' },
  { path: 'stations', component: StationListComponent },
  { path: 'stations/create', component: StationFormComponent },
  { path: 'stations/edit/:id', component: StationFormComponent },
  { path: 'carburants', component: CarburantListComponent },
  { path: 'carburants/create', component: CarburantFormComponent },
  { path: 'carburants/edit/:id', component: CarburantFormComponent },
  { path: 'histocarb', component: HistoCarbListComponent },
  { path: 'histocarb/create', component: HistoCarbFormComponent }

];
