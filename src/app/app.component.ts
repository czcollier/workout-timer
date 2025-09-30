import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center p-4 justify-center">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent {}


