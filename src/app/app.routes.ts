import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { WorkoutEditorComponent } from './workout-editor.component';
import { WorkoutRunnerComponent } from './workout-runner.component';
import { SettingsComponent } from './settings.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard';
import { WorkoutCreatorComponent } from './workout-creator.component'; // Import the new component

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [loginGuard]
  },
  {
    path: '', // Default route
    component: WorkoutEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'create', // Add the new route
    component: WorkoutCreatorComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'run', 
    component: WorkoutRunnerComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [authGuard]
  },
  // Redirect any unknown paths to the main page
  { path: '**', redirectTo: '' }
];

