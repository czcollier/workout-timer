import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { WorkoutEditorComponent } from './workout-editor.component';
import { WorkoutRunnerComponent } from './workout-runner.component';
import { WorkoutCreatorComponent } from './workout-creator.component';
import { SettingsComponent } from './settings.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard'; // Import the new guard

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [loginGuard] // This route is now protected
  },
  {
    path: '', // Default route
    component: WorkoutEditorComponent,
    canActivate: [authGuard] // This route is protected
  },
  { 
    path: 'run', 
    component: WorkoutRunnerComponent, 
    canActivate: [authGuard] // This route is protected
  },
  { 
    path: 'create', 
    component: WorkoutCreatorComponent, 
    canActivate: [authGuard] // This route is protected
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [authGuard] // This route is protected
  },
  // Redirect any unknown paths to the main page
  { path: '**', redirectTo: '' }
];

