/**
 * SupabaseService
 * Handles all database interactions.
 */
import { createClient } from '@supabase/supabase-js';

export class SupabaseService {
  constructor(url, key) {
    this.client = createClient(url, key);
  }

  async fetchGames() {
    // TODO: Implement actual query when table is ready
    const { data, error } = await this.client
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }
    return data;
  }
}
