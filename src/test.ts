// This file is required by karma.conf.cjs and loads recursively all the .spec and framework files
import 'zone.js';
// eslint-disable-next-line import/no-unresolved
import 'zone.js/testing'; // It says it can't find the module, but it works and this is what the docs say to do.
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: false }
  }
);
