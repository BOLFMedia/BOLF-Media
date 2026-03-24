export class AuthManager {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }

  async login(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    return data.user;
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error) return null;
    return user;
  }

  async onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange((event, session) => {
      callback(event, session ? session.user : null);
    });
  }
}
