import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutService } from './workout.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="relative w-full max-w-md mx-auto text-center">
      <h1 class="text-5xl font-bold text-cyan-400">Settings</h1>
      <p class="text-gray-400 mb-8">Manage your workout settings and sharing options.</p>

      <div class="space-y-4">
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400 text-left">Your Share Code</h2>
          <div class="text-left text-sm p-3 bg-gray-700 rounded-lg">
            <p class="font-semibold">Copy your code to let others load your workout:</p>
            @if(service.userShareCode()) {
              <div class="flex items-center gap-2 mt-1">
                <input type="text" [value]="service.userShareCode()" readonly class="w-full bg-gray-600 text-gray-300 p-2 rounded font-mono text-lg">
                <button (click)="service.copyMyShareCode()" class="bg-gray-500 hover:bg-gray-400 p-2 rounded">Copy</button>
              </div>
            } @else {
              <p class="text-gray-400 mt-2">Add an exercise to your workout to generate a Share Code.</p>
            }
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
            <h2 class="text-2xl font-bold mb-4 text-cyan-400 text-left">Share Your Workout</h2>
            <div class="flex gap-2 mb-4">
              <input #shareCodeInput placeholder="Enter friend's Share Code" class="flex-grow bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 uppercase" />
              <button (click)="share(shareCodeInput)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg">Share</button>
            </div>
            <h3 class="font-semibold text-left mb-2">Shared With (by User ID):</h3>
            <ul class="space-y-2 text-left">
              @for(uid of service.sharedWith(); track uid) {
                <li class="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span class="font-mono text-xs">{{ uid }}</span>
                  @if(uid !== service.user()?.uid) {
                    <button (click)="service.unshareWorkout(uid)" class="text-red-500 hover:text-red-400 text-xs">Remove</button>                  
                  } @else {
                    <span class="text-xs text-gray-500">(Owner)</span>
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
  `,
    styles: [`
    input {
      text-transform: uppercase;
    }
  `],
})
export class SettingsComponent {
  service = inject(WorkoutService);

  share(input: HTMLInputElement) {
    this.service.shareWorkout(input.value);
    input.value = '';
  }
}
