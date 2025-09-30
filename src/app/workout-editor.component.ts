import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-workout-editor',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="relative w-full max-w-md mx-auto text-center">
      <!-- Main Title/Subtitle -->
      <h1 class="text-5xl font-bold text-cyan-400">Workout Timer</h1>
      <p class="text-gray-400 mb-8">Build and run your custom interval workouts.</p>

      <!-- Logout Button -->
      <div class="absolute top-0 right-0 -mt-20 flex items-center">
        <span class="text-gray-400 text-sm mr-3 hidden sm:inline">{{ user()?.displayName }}</span>
        <button (click)="service.logout()" title="Logout" class="bg-gray-700 hover:bg-red-600 text-white font-bold p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>

      <!-- Main Controls -->
      <div class="space-y-4">
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400">Load A Shared Workout</h2>
          <div class="flex gap-2">
            <input #loadCodeInput placeholder="Enter Share Code to load workout" class="flex-grow bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 uppercase" />
            <button (click)="loadWorkout(loadCodeInput)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg">Load</button>
          </div>
          @if(!service.isOwner() && user()) {
            <button (click)="loadMyWorkout()" class="mt-3 text-cyan-400 hover:underline w-full text-sm">Load My Workout</button>
          }
        </div>

        @if(service.isOwner()) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
            <a routerLink="/create" class="text-cyan-400 hover:text-cyan-300 text-lg font-semibold p-4 block w-full">
              + Edit My Workout 
            </a>
          </div>
        }

        @if(workoutList().length > 0) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
               <h2 class="text-2xl font-bold text-cyan-400">
                @if(service.isOwner()) {
                  My Exercise List
                } @else {
                  Loaded Workout
                }
               </h2>
               <span class="text-gray-400 text-sm">{{ workoutList().length }} exercises</span>
            </div>
            <ul class="space-y-3">
              @for (exercise of workoutList(); track exercise.id; let i = $index) {
                <li class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p class="font-semibold text-lg text-left">{{ exercise.name }}</p>
                    <p class="text-sm text-gray-400 text-left">Work: {{ exercise.duration }}s, Rest: {{ exercise.rest }}s</p>
                  </div>
                </li>
              }
            </ul>
          </div>
        } @else {
           <div class="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
              <p class="text-gray-400">Your workout is empty. Go to "Edit My Workout" or load a shared workout to get started.</p>
           </div>
        }

        <div class="flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-lg">
          <a routerLink="/settings" class="text-cyan-400 hover:underline">Go to Settings & Sharing</a>
        </div>

        <button (click)="startWorkout()" [disabled]="workoutList().length === 0" class="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-xl">Start Workout</button>
      </div>
    </div>
  `,
  styles: [`
    input {
      text-transform: uppercase;
    }
  `],
})
export class WorkoutEditorComponent {
  service = inject(WorkoutService);
  private router = inject(Router);

  user = computed(() => this.service.user());
  workoutList = computed(() => this.service.workoutList());
  
  startWorkout() {
    this.service.startWorkout();
    this.router.navigate(['/run']);
  }
  
  loadWorkout(input: HTMLInputElement) {
    this.service.loadWorkoutByShareCode(input.value);
    input.value = '';
  }

  loadMyWorkout() {
    if(this.user()) {
      this.service.loadWorkout(this.user()!.uid);
    }
  }
}

