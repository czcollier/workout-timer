import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="relative w-full text-center">
      <h1 class="text-5xl font-bold text-cyan-400">Settings</h1>
      <p class="text-gray-400 mb-8">Manage your workout settings and sharing options.</p>

      <div class="space-y-4">
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400 text-left">Your User ID</h2>
          <div class="text-left text-sm p-3 bg-gray-700 rounded-lg">
            <p class="font-semibold">Copy your ID to let others load your workout:</p>
            <div class="flex items-center gap-2 mt-1">
              <input type="text" [value]="service.user()?.uid" readonly class="w-full bg-gray-600 text-gray-300 p-2 rounded font-mono text-xs">
              <button (click)="copyMyUid()" class="bg-gray-500 hover:bg-gray-400 p-2 rounded">Copy</button>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400 text-left">TTS Voice</h2>
          <select id="voice-select" (change)="service.onVoiceChange($event)" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">
            @for (voice of service.availableVoices(); track voice.voiceURI) {
              <option [value]="voice.voiceURI" [selected]="voice.voiceURI === service.selectedVoiceURI()">
                {{ service.getDescriptiveVoiceName(voice) }} ({{ voice.lang }})
              </option>
            }
          </select>
        </div>

        @if (service.isOwner()) {
          <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-bold mb-4 text-cyan-400 text-left">Share Workout</h2>
            <div class="flex gap-2 mb-4">
              <input #shareUidInput placeholder="Enter User ID to share with" class="flex-grow bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              <button (click)="share(shareUidInput)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg">Share</button>
            </div>
            <h3 class="font-semibold text-left mb-2">Shared With:</h3>
            <ul class="space-y-2 text-left">
              @for(uid of service.sharedWith(); track uid) {
                <li class="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span class="font-mono text-xs">{{ uid }}</span>
                  @if(uid !== service.loadedWorkoutOwnerId()) {
                    <button (click)="service.unshareWorkout(uid)" class="text-red-500 hover:text-red-400 text-xs">Remove</button>
                  }
                </li>
              } @empty {
                <li class="text-gray-500">Not shared with anyone yet.</li>
              }
            </ul>
          </div>
        }

        <a routerLink="/" class="mt-4 inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Back to Workout</a>
      </div>
    </div>
  `
})
export class SettingsComponent {
  service = inject(WorkoutService);

  copyMyUid() {
    navigator.clipboard.writeText(this.service.user()?.uid || '');
  }

  share(input: HTMLInputElement) {
    this.service.shareWorkout(input.value);
    input.value = '';
  }
}

