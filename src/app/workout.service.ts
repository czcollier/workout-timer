import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, onSnapshot, DocumentReference, Unsubscribe, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

// --- INTERFACES ---
export interface Exercise {
  id: string;
  name: string;
  duration: number;
  rest: number;
}
interface WorkoutDoc {
  owner: string;
  exercises: Exercise[];
  sharedWith: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // --- STATE SIGNALS ---
  user = signal<User | null>(null);
  workoutList = signal<Exercise[]>([]);
  sharedWith = signal<string[]>([]);
  loadedWorkoutOwnerId = signal<string | null>(null);
  draggedItemIndex = signal<number | null>(null);
  availableVoices = signal<SpeechSynthesisVoice[]>([]);
  selectedVoiceURI = signal<string | null>(null);
  workoutState = signal<'stopped' | 'running' | 'paused'>('stopped');
  currentExerciseIndex = signal(0);
  currentIntervalType = signal<'exercise' | 'rest'>('exercise');
  timeRemaining = signal(0);

  // This observable signals when the initial Firebase auth check is complete.
  private authStateCheckedSource = new ReplaySubject<boolean>(1);
  authStateChecked$ = this.authStateCheckedSource.asObservable();

  private firestoreUnsubscribe: Unsubscribe | null = null;
  private timerId: any = null;
  private wakeLock: any = null;

  private readonly VOICE_DESCRIPTORS: { [key: string]: string } = {
    'david': 'Standard Male', 'zira': 'Standard Female', 'mark': 'Professional Male',
    'google us english': 'Clear Female', 'google uk english female': 'British Female', 'google uk english male': 'British Male',
    'samantha': 'Friendly Female', 'alex': 'Deep Male', 'daniel': 'British Male', 'karen': 'Australian Female', 'rishi': 'Indian Male', 'victoria': 'Calm Female',
  };

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.user.set(user);
      if (user) {
        this.loadWorkout(user.uid);
      } else {
        // Clear all workout data on logout
        this.workoutList.set([]);
        this.sharedWith.set([]);
        this.loadedWorkoutOwnerId.set(null);
      }
      // Signal that the check is complete. This is crucial for the APP_INITIALIZER.
      if (!this.authStateCheckedSource.closed) {
        this.authStateCheckedSource.next(true);
        this.authStateCheckedSource.complete();
      }
    });
    this.loadVoices();
  }

  isOwner = computed(() => this.user()?.uid === this.loadedWorkoutOwnerId());

  login() { signInWithPopup(this.auth, new GoogleAuthProvider()); }
  logout() {
    signOut(this.auth);
    // After signing out, navigate the user to the login page.
    this.router.navigate(['/login']);
  }

  loadWorkout(ownerId: string) {
    const trimmedId = ownerId.trim();
    if (!trimmedId) return;
    if (this.firestoreUnsubscribe) this.firestoreUnsubscribe();
    const userDocRef = doc(this.firestore, 'workouts', trimmedId) as DocumentReference<WorkoutDoc>;
    this.firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.workoutList.set(data.exercises || []);
        this.sharedWith.set(data.sharedWith || []);
        this.loadedWorkoutOwnerId.set(data.owner);
      } else if (trimmedId === this.user()?.uid) {
        // This handles the case where a user is logged in but has not created a workout yet.
        this.workoutList.set([]);
        this.sharedWith.set([]);
        this.loadedWorkoutOwnerId.set(trimmedId);
      }
    });
  }

  async saveWorkoutToFirestore() {
    if (!this.isOwner() || !this.loadedWorkoutOwnerId()) return;
    const userDocRef = doc(this.firestore, 'workouts', this.loadedWorkoutOwnerId()!);
    const workoutData: WorkoutDoc = {
      owner: this.user()!.uid,
      exercises: this.workoutList(),
      // Ensure the owner is always in the sharedWith list
      sharedWith: Array.from(new Set([...this.sharedWith(), this.user()!.uid]))
    };
    await setDoc(userDocRef, workoutData, { merge: true });
  }

  async shareWorkout(friendUid: string) {
    if (!friendUid || !this.loadedWorkoutOwnerId()) return;
    const userDocRef = doc(this.firestore, 'workouts', this.loadedWorkoutOwnerId()!);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) await this.saveWorkoutToFirestore();
    await updateDoc(userDocRef, { sharedWith: arrayUnion(friendUid) });
  }

  async unshareWorkout(friendUid: string) {
    if (!this.loadedWorkoutOwnerId()) return;
    const userDocRef = doc(this.firestore, 'workouts', this.loadedWorkoutOwnerId()!);
    await updateDoc(userDocRef, { sharedWith: arrayRemove(friendUid) });
  }

  addExercise(event: SubmitEvent, nameInput: HTMLInputElement, durationInput: HTMLInputElement, restInput: HTMLInputElement) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const duration = parseInt(durationInput.value, 10);
    const rest = parseInt(restInput.value, 10);
    if (name && duration > 0 && rest >= 0) {
      const newExercise: Exercise = { id: Date.now().toString(), name, duration, rest };
      this.workoutList.update(list => [...list, newExercise]);
      this.saveWorkoutToFirestore();
      nameInput.value = ''; durationInput.value = ''; restInput.value = ''; nameInput.focus();
    }
  }

  removeExercise(id: string) {
    this.workoutList.update(list => list.filter(ex => ex.id !== id));
    this.saveWorkoutToFirestore();
  }
  
  onDragStart(index: number) { this.draggedItemIndex.set(index); }
  onDrop(droppedIndex: number) {
    const draggedIndex = this.draggedItemIndex();
    if (draggedIndex === null || draggedIndex === droppedIndex) return;
    const list = [...this.workoutList()];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(droppedIndex, 0, draggedItem);
    this.workoutList.set(list);
    this.saveWorkoutToFirestore();
    this.draggedItemIndex.set(null);
  }

  async startWorkout() {
    if (this.workoutList().length === 0) return;
    this.workoutState.set('running');
    this.currentExerciseIndex.set(0);
    this.currentIntervalType.set('exercise');
    this.timeRemaining.set(this.workoutList()[0].duration);
    this.speak(`Starting ${this.workoutList()[0].name}`);
    this.timerId = setInterval(() => this.tick(), 1000);
    await this.requestWakeLock();
  }

  pauseWorkout() {
    this.workoutState.set('paused');
    clearInterval(this.timerId);
  }

  resumeWorkout() {
    this.workoutState.set('running');
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  async resetWorkout() {
    this.workoutState.set('stopped');
    clearInterval(this.timerId);
    this.currentExerciseIndex.set(0);
    this.currentIntervalType.set('exercise');
    this.timeRemaining.set(0);
    await this.releaseWakeLock();
  }
  
  private tick() {
    this.timeRemaining.update(t => t - 1);
    const remaining = this.timeRemaining();
    if (remaining > 0 && remaining <= 5) this.speak(remaining.toString());
    if (this.timeRemaining() <= 0) this.moveToNextInterval();
  }

  private moveToNextInterval() {
    const exerciseIndex = this.currentExerciseIndex();
    const currentExercise = this.workoutList()[exerciseIndex];
    if (this.currentIntervalType() === 'exercise') {
      this.currentIntervalType.set('rest');
      this.timeRemaining.set(currentExercise.rest);
      if (currentExercise.rest > 0) this.speak('Rest');
      else this.moveToNextInterval();
    } else {
      if (exerciseIndex + 1 < this.workoutList().length) {
        this.currentExerciseIndex.update(i => i + 1);
        const nextExercise = this.workoutList()[this.currentExerciseIndex()];
        this.currentIntervalType.set('exercise');
        this.timeRemaining.set(nextExercise.duration);
        this.speak(nextExercise.name);
      } else {
        this.speak('Workout complete!');
        this.resetWorkout();
      }
    }
  }

  copyMyUid() {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(this.user()?.uid || '');
    }
  }

  private speak(text: string) {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedURI = this.selectedVoiceURI();
      if (selectedURI) {
        const voice = this.availableVoices().find(v => v.voiceURI === selectedURI);
        if (voice) utterance.voice = voice;
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  loadVoices() {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      const setVoices = () => {
        const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        this.availableVoices.set(voices);
        if (!this.selectedVoiceURI() || !voices.some(v => v.voiceURI === this.selectedVoiceURI())) {
          this.selectedVoiceURI.set(voices[0]?.voiceURI || null);
        }
      };
      setVoices();
      window.speechSynthesis.onvoiceschanged = setVoices;
    }
  }
  
  onVoiceChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedVoiceURI.set(select.value);
  }
  
  getDescriptiveVoiceName(voice: SpeechSynthesisVoice): string {
    const nameLower = voice.name.toLowerCase();
    for (const key in this.VOICE_DESCRIPTORS) {
      if (nameLower.includes(key)) return this.VOICE_DESCRIPTORS[key];
    }
    return voice.name;
  }
  
  private async requestWakeLock() {
    if (isPlatformBrowser(this.platformId) && 'wakeLock' in navigator) {
      try { this.wakeLock = await (navigator as any).wakeLock.request('screen'); }
      catch (err) { console.error('Screen Wake Lock failed:', err); }
    }
  }

  private async releaseWakeLock() {
    if (isPlatformBrowser(this.platformId) && this.wakeLock) {
      try { await this.wakeLock.release(); this.wakeLock = null; }
      catch (err) { console.error('Could not release wake lock:', err); }
    }
  }
}