import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Import the base browser config

// Create the server-specific configuration directly in this file.
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
  ],
};

// Merge the base config with the server config to create the final, complete config.
const finalConfig = mergeApplicationConfig(appConfig, serverConfig);

// Bootstrap the application with the fully merged configuration.
const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, finalConfig, context);

export default bootstrap;

