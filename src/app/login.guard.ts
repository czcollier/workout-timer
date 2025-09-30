import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkoutService } from './workout.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const workoutService = inject(WorkoutService);
  const router = inject(Router);

  // If the user is already logged in, redirect them away from the login page.
  if (workoutService.user()) {
    router.navigate(['/']); // Navigate to the main editor page
    return false;
  }
  
  // If not logged in, allow them to see the login page.
  return true;
};
