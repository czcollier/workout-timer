import { ApplicationConfig, APP_INITIALIZER, provideZonelessChangeDetection, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { WorkoutService } from './workout.service';
import { firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// This factory is now platform-aware.
export function initializeAuthFactory(workoutService: WorkoutService, platformId: Object): () => Promise<any> {
  return () => {
    // If we're on the server, resolve immediately.
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }
    // If in the browser, wait for the auth check to complete.
    return firstValueFrom(workoutService.authStateChecked$);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideZonelessChangeDetection(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [WorkoutService, PLATFORM_ID], // Add PLATFORM_ID to dependencies
      multi: true
    }
  ]
};

