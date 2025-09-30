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

      <!-- Workout Setup -->
      <div class="space-y-4">

        <!-- Load Workout Section -->
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400">Load Workout</h2>
          <div class="flex gap-2">
            <input #loadUidInput placeholder="Enter User ID to load workout" class="flex-grow bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            <button (click)="loadWorkout(loadUidInput)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg">Load</button>
          </div>
          @if(service.loadedWorkoutOwnerId() !== user()?.uid) {
            <button (click)="loadMyWorkout()" class="mt-2 text-cyan-400 hover:underline w-full text-sm">Load My Workout</button>
          }
        </div>

        @if(service.isOwner()) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-cyan-400">Create Your Workout</h2>
            <form (submit)="addExercise($event, nameInput, durationInput, restInput)" class="flex flex-col gap-3">
              <input #nameInput placeholder="Exercise Name" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
              <div class="flex gap-3">
                <input #durationInput type="number" placeholder="Duration (s)" class="w-1/2 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                <input #restInput type="number" placeholder="Rest (s)" class="w-1/2 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
              </div>
              <button type="submit" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Add Exercise</button>
            </form>
          </div>
        }

        @if(workoutList().length > 0) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-cyan-400">Exercise List</h2>
            <ul class="space-y-3">
              @for (exercise of workoutList(); track exercise.id; let i = $index) {
                <li
                  class="flex items-center justify-between bg-gray-700 p-4 rounded-lg transition-shadow"
                  [class.cursor-grab]="service.isOwner()"
                  [attr.draggable]="service.isOwner() ? 'true' : 'false'"
                  (dragstart)="service.onDragStart(i)"
                  (dragover)="onDragOver($event)"
                  (drop)="service.onDrop(i)">
                  <div>
                    <p class="font-semibold text-lg text-left">{{ exercise.name }}</p>
                    <p class="text-sm text-gray-400 text-left">Work: {{ exercise.duration }}s, Rest: {{ exercise.rest }}s</p>
                  </div>
                  @if(service.isOwner()) {
                    <button (click)="service.removeExercise(exercise.id)" class="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                  }
                </li>
              }
            </ul>
          </div>
        }

        <div class="flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-lg">
          <a routerLink="/settings" class="text-cyan-400 hover:underline">Go to Settings & Sharing</a>
        </div>

        <button (click)="startWorkout()" [disabled]="workoutList().length === 0" class="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg">Start Workout</button>
      </div>
    </div>
  `,
  styles: [],
})
export class WorkoutEditorComponent {
  service = inject(WorkoutService);
  private router = inject(Router);

  user = computed(() => this.service.user());
  workoutList = computed(() => this.service.workoutList());

  addExercise(event: SubmitEvent, nameInput: HTMLInputElement, durationInput: HTMLInputElement, restInput: HTMLInputElement) {
    this.service.addExercise(event, nameInput, durationInput, restInput);
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  startWorkout() {
    this.service.startWorkout();
    this.router.navigate(['/run']);
  }
  
  loadWorkout(input: HTMLInputElement) {
    this.service.loadWorkout(input.value);
    input.value = '';
  }

  loadMyWorkout() {
    if(this.user()) {
      this.service.loadWorkout(this.user()!.uid);
    }
  }
}
