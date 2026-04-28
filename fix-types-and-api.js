const fs = require('fs');
const base = 'c:/Users/Rupesh kumar sah/OneDrive/Desktop/rupesh3/frontend/src';

// 1. Fix api.ts - add named export
let api = fs.readFileSync(`${base}/services/api.ts`, 'utf8');
api = api.replace('export default api;', 'export { api };\nexport default api;');
fs.writeFileSync(`${base}/services/api.ts`, api);
console.log('Fixed api.ts');

// 2. Fix authStore.ts - add login/register methods
let authStore = fs.readFileSync(`${base}/stores/authStore.ts`, 'utf8');
authStore = authStore.replace(
  "import { User } from '../types';",
  "import { User } from '../types';\nimport api from '../services/api';"
);
authStore = authStore.replace(
  `interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}`,
  `interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}`
);
authStore = authStore.replace(
  '      logout: () => {',
  `      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {`
);
fs.writeFileSync(`${base}/stores/authStore.ts`, authStore);
console.log('Fixed authStore.ts');

// 3. Fix types - add _id alias
let types = fs.readFileSync(`${base}/types/index.ts`, 'utf8');
types = types.replace(
  'export interface User {\n  id: string;',
  'export interface User {\n  _id: string;\n  id: string;'
);
types = types.replace(
  'export interface Lead {\n  id: string;',
  'export interface Lead {\n  _id: string;\n  id: string;'
);
types = types.replace(
  'export interface Activity {\n  id: string;',
  'export interface Activity {\n  _id: string;\n  id: string;'
);
fs.writeFileSync(`${base}/types/index.ts`, types);
console.log('Fixed types');

// 4. Fix Button.tsx - add icon prop alias
let button = fs.readFileSync(`${base}/components/ui/Button.tsx`, 'utf8');
button = button.replace(
  '  leftIcon?: React.ReactNode;\n  rightIcon?: React.ReactNode;',
  '  icon?: React.ReactNode;\n  leftIcon?: React.ReactNode;\n  rightIcon?: React.ReactNode;'
);
button = button.replace(
  '  leftIcon,\n  rightIcon,',
  '  icon,\n  leftIcon,\n  rightIcon,'
);
button = button.replace(
  '      ) : leftIcon ? (',
  '      ) : icon ? (\n        <span className="mr-2">{icon}</span>\n      ) : leftIcon ? ('
);
fs.writeFileSync(`${base}/components/ui/Button.tsx`, button);
console.log('Fixed Button.tsx');

// 5. Fix Activities.tsx - remove unused useState import
let activities = fs.readFileSync(`${base}/pages/Activities.tsx`, 'utf8');
activities = activities.replace("import { useState } from 'react';\n", '');
fs.writeFileSync(`${base}/pages/Activities.tsx`, activities);
console.log('Fixed Activities.tsx');

console.log('All fixes applied!');

