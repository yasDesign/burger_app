import { supabase } from '../api/supabase'

export const authService = {
  /**
   * Inicia sesión y retorna tanto el usuario de Auth como su perfil (rol)
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error

    // Recuperamos el perfil vinculado al ID del usuario recién logueado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError
    
    return { user: data.user, profile }
  },

  /**
   * Cierra la sesión globalmente
   */
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Obtiene la sesión actual y el perfil del usuario si existe
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return { user: session.user, profile }
  }
}