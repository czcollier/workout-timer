import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-workout-runner',
  standalone: true,
  imports: [],
  template: `
    <div class="w-full max-w-md mx-auto text-center">
      <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <p class="text-xl text-gray-400 mb-2">{{ service.currentExerciseIndex() + 1 }} / {{ service.workoutList().length }}</p>
        <p class="text-4xl font-bold mb-4" [style.color]="exerciseNameColor()">{{ currentExerciseName() }}</p>
        <div class="relative flex justify-center items-center mb-8">
          <span class="absolute text-7xl font-mono font-bold">{{ service.timeRemaining() }}</span>
          <svg class="transform -rotate-90" width="250" height="250" viewBox="0 0 250 250">
            <circle cx="125" cy="125" r="115" stroke="#374151" stroke-width="20" fill="transparent" />
            <circle
              cx="125" cy="125" r="115"
              [attr.stroke]="progressRingColor()"
              stroke-width="20"
              fill="transparent"
              stroke-linecap="round"
              [style.strokeDasharray]="circumference"
              [style.strokeDashoffset]="progressOffset()"
              style="transition: stroke-dashoffset 0.5s linear;"
            />
          </svg>
        </div>
        <!-- Controls -->
        <div class="flex space-x-4">
          @if (service.workoutState() === 'paused') {
            <button (click)="service.resumeWorkout()" class="w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-xl">Resume</button>
          } @else {
            <button (click)="service.pauseWorkout()" class="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg text-xl">Pause</button>
          }
          <button (click)="resetWorkout()" class="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-xl">Reset</button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class WorkoutRunnerComponent {
  service = inject(WorkoutService);
  private router = inject(Router);

  readonly circumference = 2 * Math.PI * 115;

  constructor() {
    // If the page is reloaded or accessed directly, and the workout isn't running, redirect away.
    if (this.service.workoutList().length === 0 || this.service.workoutState() === 'stopped') {
      this.router.navigate(['/']);
    }
  }

  // --- COMPUTED SIGNALS ---
  currentExerciseName = computed(() => {
    if (this.service.workoutState() === 'stopped' || this.service.workoutList().length === 0) return 'Workout';
    const exercise = this.service.workoutList()[this.service.currentExerciseIndex()];
    return this.service.currentIntervalType() === 'rest' ? 'Rest' : exercise?.name || 'Finished';
  });

  totalDuration = computed(() => {
    if (this.service.workoutState() === 'stopped' || this.service.workoutList().length === 0) return 1;
    const exercise = this.service.workoutList()[this.service.currentExerciseIndex()];
    return this.service.currentIntervalType() === 'exercise' ? exercise.duration : exercise.rest;
  });

  progressOffset = computed(() => {
    const progress = this.service.timeRemaining() / this.totalDuration();
    // This corrected formula ensures the ring drains in a clockwise direction.
    return this.circumference * (1 - progress);
  });

  exerciseNameColor = computed(() => {
    return this.service.currentIntervalType() === 'exercise' ? '#facc15' : '#22d3ee';
  });

  progressRingColor = computed(() => {
    return this.service.currentIntervalType() === 'exercise' ? '#22d3ee' : '#facc15';
  });

  // --- TIMER CONTROL ---
  resetWorkout() {
    this.service.resetWorkout();
    this.router.navigate(['/']);
  }
}
