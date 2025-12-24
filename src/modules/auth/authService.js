import { supabase } from '../../api/supabase'

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Obtenemos el perfil con el ROL desde nuestra tabla perfiles
    const { data: profile } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    return { ...user, ...profile }
  }
}