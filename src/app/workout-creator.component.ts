import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-workout-creator',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto text-center">
      <h1 class="text-5xl font-bold text-cyan-400">Edit Your Workout</h1>
      <p class="text-gray-400 mb-8">Add, remove, and reorder your exercises.</p>

      <div class="space-y-4">
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400">Add Exercise</h2>
          <form (submit)="addExercise($event, nameInput, durationInput, restInput)" class="flex flex-col gap-3">
            <input #nameInput placeholder="Exercise Name" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
            <div class="flex gap-3">
              <input #durationInput type="number" placeholder="Duration (s)" class="w-1/2 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
              <input #restInput type="number" placeholder="Rest (s)" class="w-1/2 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
            </div>
            <button type="submit" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Add Exercise</button>
          </form>
        </div>

        @if(workoutList().length > 0) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-cyan-400">Your Exercises</h2>
            <ul class="space-y-3">
              @for (exercise of workoutList(); track exercise.id; let i = $index) {
                <li
                  class="flex items-center justify-between bg-gray-700 p-4 rounded-lg cursor-grab transition-shadow"
                  draggable="true"
                  (dragstart)="service.onDragStart(i)"
                  (dragover)="onDragOver($event)"
                  (drop)="service.onDrop(i)">
                  <div>
                    <p class="font-semibold text-lg text-left">{{ exercise.name }}</p>
                    <p class="text-sm text-gray-400 text-left">Work: {{ exercise.duration }}s, Rest: {{ exercise.rest }}s</p>
                  </div>
                  <button (click)="service.removeExercise(exercise.id)" class="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                  </button>
                </li>
              }
            </ul>
          </div>
        }

        <a routerLink="/" class="mt-4 inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg">Done Editing</a>
      </div>
    </div>
  `
})
export class WorkoutCreatorComponent {
  service = inject(WorkoutService);

  workoutList = computed(() => this.service.workoutList());

  addExercise(event: SubmitEvent, nameInput: HTMLInputElement, durationInput: HTMLInputElement, restInput: HTMLInputElement) {
    this.service.addExercise(event, nameInput, durationInput, restInput);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
}