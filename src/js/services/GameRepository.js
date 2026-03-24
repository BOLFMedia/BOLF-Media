export class GameRepository {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }

  async getAllGames() {
    const { data, error } = await this.client
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
    return data;
  }

  async getGameById(id) {
    const { data, error } = await this.client
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching game with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async addGame(gameData) {
    const { data, error } = await this.client
      .from('games')
      .insert([gameData])
      .select();

    if (error) {
      console.error('Error adding game:', error);
      throw error;
    }
    return data;
  }

  async updateGame(id, gameData) {
    const { data, error } = await this.client
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error updating game with id ${id}:`, error);
      throw error;
    }
    return data;
  }

  async deleteGame(id) {
    const { error } = await this.client
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting game with id ${id}:`, error);
      throw error;
    }
    return true;
  }
}
