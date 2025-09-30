import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { WorkoutEditorComponent } from './workout-editor.component';
import { WorkoutRunnerComponent } from './workout-runner.component';
import { SettingsComponent } from './settings.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard'; // Import the new guard

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [loginGuard] // Protect this route from logged-in users
  },
  {
    path: '',
    component: WorkoutEditorComponent,
    canActivate: [authGuard] // Protect this route from logged-out users
  },
  { 
    path: 'run', 
    component: WorkoutRunnerComponent, 
    canActivate: [authGuard] // Protect this route
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [authGuard] // Protect this route
  },
  // Redirect any unknown paths to the main page
  { path: '**', redirectTo: '' }
];