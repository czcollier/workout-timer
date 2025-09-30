import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkoutService } from './workout.service';

export const authGuard: CanActivateFn = (route, state) => {
  const workoutService = inject(WorkoutService);
  const router = inject(Router);

  // Because of the APP_INITIALIZER, this check is now safe and synchronous.
  // The race condition is completely gone.
  if (workoutService.user()) {
    return true; // If user is logged in, allow access.
  }

  // If not logged in, redirect to the login page.
  router.navigate(['/login']);
  return false;
};

