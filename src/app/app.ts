import { Component, signal, computed, effect, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Interface for a single exercise in the workout plan
interface Exercise {
  name: string;
  duration: number;
  rest: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center p-4">
      <header class="w-full max-w-md text-center mb-8">
        <h1 class="text-4xl font-bold text-cyan-400">Workout Timer</h1>
        <p class="text-gray-400">Build and run your custom interval workouts.</p>
      </header>

      <!-- Main content: either workout setup or timer view -->
      <main class="w-full max-w-md">
        <!-- Show timer view if workout is active, otherwise show setup -->
        @if (workoutState() !== 'idle') {
          <div class="bg-gray-800 rounded-lg shadow-lg p-6 text-center animate-fade-in">
            <h2 class="text-2xl font-semibold text-gray-300">
              {{ currentExerciseIndex() + 1 }} / {{ workoutList().length }}
            </h2>
            <h3 class="text-4xl font-bold my-4 capitalize text-yellow-400">
              {{ currentIntervalName() }}
            </h3>

            <!-- Circular Timer Display -->
            <div class="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
              <svg class="absolute w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="120" stroke-width="12" stroke="rgba(255, 255, 255, 0.1)" fill="transparent" class="stroke-linecap-round"/>
                <circle cx="50%" cy="50%" r="120" stroke-width="12" [attr.stroke]="progressColor()" fill="transparent"
                  class="stroke-linecap-round transition-all duration-500"
                  [style.strokeDasharray]="circumference"
                  [style.strokeDashoffset]="progressOffset()"
                />
              </svg>
              <span class="text-7xl font-mono font-bold">{{ timeRemaining() }}</span>
            </div>

            <!-- Controls for the timer -->
            <div class="flex justify-center space-x-4">
              @if (workoutState() === 'running') {
                <button (click)="pauseWorkout()" class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors">Pause</button>
              }
              @if (workoutState() === 'paused') {
                <button (click)="resumeWorkout()" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">Resume</button>
              }
              <button (click)="resetWorkout()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">Reset</button>
            </div>
          </div>
        } @else {
          <!-- Workout Setup Form -->
          <div class="bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-cyan-300">Create Your Workout</h2>
            <form (submit)="addExercise($event)" class="space-y-4">
              <input #nameInput type="text" placeholder="Exercise Name" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
              <div class="grid grid-cols-2 gap-4">
                <input #durationInput type="number" placeholder="Duration (s)" min="1" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
                <input #restInput type="number" placeholder="Rest (s)" min="0" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
              </div>
              <button type="submit" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-colors">Add Exercise</button>
            </form>
          </div>

          <!-- Voice Selection Dropdown -->
          @if (availableVoices().length > 0) {
            <div class="bg-gray-800 rounded-lg shadow-lg p-6 mt-6 animate-fade-in">
              <label for="voice-select" class="block text-sm font-medium text-gray-300 mb-2">TTS Voice:</label>
              <select id="voice-select" (change)="onVoiceChange($event)" class="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">
                @for (voice of availableVoices(); track voice.voiceURI) {
                  <option [value]="voice.voiceURI" [selected]="voice.voiceURI === selectedVoiceURI()">
                    {{ getDescriptiveVoiceName(voice) }} ({{ voice.lang }})
                  </option>
                }
              </select>
            </div>
          }

          <!-- List of Added Exercises -->
          <div class="mt-6">
            @if (workoutList().length > 0) {
              <ul class="space-y-3">
                @for (exercise of workoutList(); track exercise; let i = $index) {
                  <li
                    class="bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-move transition-all duration-150"
                    draggable="true"
                    (dragstart)="onDragStart($event, i)"
                    (dragover)="onDragOver($event, i)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event, i)"
                    [class.opacity-50]="draggedItemIndex() === i"
                    [class.border-t-2]="dragOverIndex() === i"
                    [class.border-cyan-400]="dragOverIndex() === i">
                    <div>
                      <span class="font-bold capitalize">{{ exercise.name }}</span>
                      <p class="text-sm text-gray-400">Work: {{ exercise.duration }}s, Rest: {{ exercise.rest }}s</p>
                    </div>
                    <button (click)="removeExercise(i)" class="text-red-400 hover:text-red-600">&times;</button>
                  </li>
                }
              </ul>
              <button (click)="startWorkout()" class="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors text-xl">
                Start Workout
              </button>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@700&display=swap');
    :host {
      font-family: 'Inter', sans-serif;
    }
    .font-mono {
      font-family: 'Roboto Mono', monospace;
    }
    .stroke-linecap-round { stroke-linecap: round; }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // --- STATE SIGNALS ---
  workoutList = signal<Exercise[]>([]);
  workoutState = signal<'idle' | 'running' | 'paused'>('idle');
  currentExerciseIndex = signal(0);
  timeRemaining = signal(0);
  currentIntervalType = signal<'exercise' | 'rest'>('exercise');
  availableVoices = signal<SpeechSynthesisVoice[]>([]);
  selectedVoiceURI = signal<string | null>(null);
  draggedItemIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  private timerId: any = null;
  private wakeLockSentinel: any = null;
  readonly circumference = 2 * Math.PI * 120; // For the progress circle

  // A map of common voice names to more descriptive labels.
  private readonly VOICE_DESCRIPTORS: { [key: string]: string } = {
    // Microsoft
    'david': 'Standard Male',
    'zira': 'Standard Female',
    'mark': 'Professional Male',
    // Google
    'google us english': 'Clear Female',
    'google uk english female': 'British Female',
    'google uk english male': 'British Male',
    // Apple
    'samantha': 'Friendly Female',
    'alex': 'Deep Male',
    'daniel': 'British Male',
    'karen': 'Australian Female',
    'rishi': 'Indian Male',
    'victoria': 'Calm Female',
  };


  // --- COMPUTED SIGNALS ---

  // Get the name of the current interval (exercise name or "Rest")
  currentIntervalName = computed(() => {
    if (this.workoutState() === 'idle') return 'Get Ready';
    const exercise = this.workoutList()[this.currentExerciseIndex()];
    return this.currentIntervalType() === 'exercise' ? exercise.name : 'Rest';
  });

  // Calculate the progress circle's offset for the animation
  progressOffset = computed(() => {
    const exercise = this.workoutList()[this.currentExerciseIndex()];
    const totalDuration = this.currentIntervalType() === 'exercise' ? exercise.duration : exercise.rest;
    if (totalDuration === 0) return 0;
    const progress = (totalDuration - this.timeRemaining()) / totalDuration;
    return this.circumference * (1 - progress);
  });

  // Determine the color of the progress circle
  progressColor = computed(() => {
    return this.currentIntervalType() === 'exercise' ? '#22d3ee' : '#facc15'; // cyan for exercise, yellow for rest
  });


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // All browser-specific APIs (localStorage, speechSynthesis) must only be called on the client.
    // We check if the platform is a browser before running this code.
    if (isPlatformBrowser(this.platformId)) {
      // Load workout list from local storage on startup
      try {
        const savedList = localStorage.getItem('workoutTimerApp-workoutList');
        if (savedList) {
          this.workoutList.set(JSON.parse(savedList));
        }
      } catch (e) {
        console.error("Failed to load or parse workout list from localStorage.", e);
        localStorage.removeItem('workoutTimerApp-workoutList'); // Clear corrupted data
      }

      // Effect to save the workout list to local storage whenever it changes
      effect(() => {
        localStorage.setItem('workoutTimerApp-workoutList', JSON.stringify(this.workoutList()));
      });

      // Effect to handle TTS announcements when the timer state changes
      effect(() => {
        if (this.workoutState() === 'running') {
          const remaining = this.timeRemaining();
          if (remaining > 0 && remaining <= 5) {
            this.speak(remaining.toString());
          }
        }
      });

      // Load speech synthesis voices when they become available
      if ('speechSynthesis' in window) {
        this.loadVoices(); // Initial load
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }

      // Re-acquire the screen wake lock if the page becomes visible again
      document.addEventListener('visibilitychange', () => {
        if (this.wakeLockSentinel !== null && document.visibilityState === 'visible') {
          this.requestWakeLock();
        }
      });
    }
  }

  // --- METHODS ---

  /**
   * Generates a more descriptive name for a voice if it's a known one.
   * Falls back to the original name if not found in our map.
   */
  getDescriptiveVoiceName(voice: SpeechSynthesisVoice): string {
    const nameLower = voice.name.toLowerCase();
    for (const key in this.VOICE_DESCRIPTORS) {
      if (nameLower.includes(key)) {
        return this.VOICE_DESCRIPTORS[key];
      }
    }
    return voice.name; // Fallback to the original name
  }

  private loadVoices() {
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
    this.availableVoices.set(voices);
    // Set a default voice if none is selected or the current one is no longer available
    const currentVoiceExists = voices.some(v => v.voiceURI === this.selectedVoiceURI());
    if ((!this.selectedVoiceURI() || !currentVoiceExists) && voices.length > 0) {
      const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if(defaultVoice) {
        this.selectedVoiceURI.set(defaultVoice.voiceURI);
      }
    }
  }

  onVoiceChange(event: Event) {
    this.selectedVoiceURI.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Adds a new exercise to the workout list from the form.
   */
  addExercise(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
    const durationInput = form.querySelectorAll('input[type="number"]')[0] as HTMLInputElement;
    const restInput = form.querySelectorAll('input[type="number"]')[1] as HTMLInputElement;

    const newExercise: Exercise = {
      name: nameInput.value || 'Unnamed Exercise',
      duration: parseInt(durationInput.value, 10),
      rest: parseInt(restInput.value, 10)
    };

    this.workoutList.update(list => [...list, newExercise]);
    form.reset();
    nameInput.focus();
  }

  /**
   * Removes an exercise from the workout list.
   */
  removeExercise(index: number) {
    this.workoutList.update(list => list.filter((_, i) => i !== index));
  }

  // --- Drag and Drop Methods ---

  onDragStart(event: DragEvent, index: number) {
    this.draggedItemIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault(); // Necessary to allow dropping
    if (index !== this.draggedItemIndex()) {
      this.dragOverIndex.set(index);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    const startIndex = this.draggedItemIndex();

    if (startIndex !== null && startIndex !== targetIndex) {
      this.workoutList.update(list => {
        const newList = [...list];
        const [draggedItem] = newList.splice(startIndex, 1);
        newList.splice(targetIndex, 0, draggedItem);
        return newList;
      });
    }

    this.draggedItemIndex.set(null);
    this.dragOverIndex.set(null);
  }

  /**
   * Starts the entire workout sequence.
   */
  startWorkout() {
    if (this.workoutList().length === 0) return;
    this.requestWakeLock();
    this.workoutState.set('running');
    this.currentExerciseIndex.set(0);
    this.startCurrentInterval();
  }

  /**
   * Starts the timer for the current interval (exercise or rest).
   */
  private startCurrentInterval() {
    const exercise = this.workoutList()[this.currentExerciseIndex()];

    // Announce the start of the interval
    this.speak(this.currentIntervalName());

    // Set the initial time for the interval
    const duration = this.currentIntervalType() === 'exercise' ? exercise.duration : exercise.rest;
    this.timeRemaining.set(duration);

    // Clear any existing timer and start a new one
    clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  /**
   * The main timer tick function, called every second.
   */
  private tick() {
    this.timeRemaining.update(t => t - 1);
    if (this.timeRemaining() <= 0) {
      this.moveToNextInterval();
    }
  }

  /**
   * Moves to the next interval in the sequence (exercise -> rest -> next exercise).
   */
  private moveToNextInterval() {
    clearInterval(this.timerId);

    // If we just finished an exercise, move to rest
    if (this.currentIntervalType() === 'exercise') {
      const currentRest = this.workoutList()[this.currentExerciseIndex()].rest;
      if (currentRest > 0) {
        this.currentIntervalType.set('rest');
        this.startCurrentInterval();
      } else {
        // Skip rest if it's 0 duration
        this.moveToNextExercise();
      }
    } else { // If we just finished a rest, move to the next exercise
      this.moveToNextExercise();
    }
  }

  /**
   * Moves to the next exercise in the workout list.
   */
  private moveToNextExercise() {
    const nextIndex = this.currentExerciseIndex() + 1;
    if (nextIndex < this.workoutList().length) {
      this.currentExerciseIndex.set(nextIndex);
      this.currentIntervalType.set('exercise');
      this.startCurrentInterval();
    } else {
      // Workout is complete
      this.speak("Workout complete. Well done!");
      this.resetWorkout();
    }
  }

  /**
   * Pauses the current timer.
   */
  pauseWorkout() {
    this.workoutState.set('paused');
    clearInterval(this.timerId);
  }

  /**
   * Resumes the timer from a paused state.
   */
  resumeWorkout() {
    this.workoutState.set('running');
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Resets the entire workout to the setup screen.
   */
  resetWorkout() {
    this.releaseWakeLock();
    this.workoutState.set('idle');
    this.currentExerciseIndex.set(0);
    this.timeRemaining.set(0);
    this.currentIntervalType.set('exercise');
    clearInterval(this.timerId);
  }

  /**
   * Uses the browser's speech synthesis to speak a given text.
   */
  private speak(text: string) {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const selected = this.availableVoices().find(v => v.voiceURI === this.selectedVoiceURI());
      if (selected) {
        utterance.voice = selected;
      }

      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }

  // --- Screen Wake Lock Methods ---

  private async requestWakeLock() {
    if ('wakeLock' in navigator && isPlatformBrowser(this.platformId)) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock is active.');
      } catch (err: any) {
        console.error(`Could not acquire wake lock: ${err.name}, ${err.message}`);
      }
    }
  }

  private async releaseWakeLock() {
    if (this.wakeLockSentinel !== null && isPlatformBrowser(this.platformId)) {
      try {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        console.log('Screen Wake Lock released.');
      } catch (err: any) {
        console.error(`Could not release wake lock: ${err.name}, ${err.message}`);
      }
    }
  }
}

