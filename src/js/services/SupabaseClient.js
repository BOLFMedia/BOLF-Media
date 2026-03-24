import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export class SupabaseClient {
  static #instance = null;

  static getInstance(url, key) {
    if (!this.#instance) {
      if (!url || !key) {
        throw new Error('Supabase URL and Key are required for initialization.');
      }
      this.#instance = createClient(url, key);
    }
    return this.#instance;
  }
}
