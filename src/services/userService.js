import { supabase } from '../api/supabase'

export const userService = {
  /**
   * Obtiene la lista completa de perfiles (empleados)
   */
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })
    
    if (error) throw error
    return data
  },

  /**
   * Crea un nuevo usuario en Supabase Auth.
   * El Trigger SQL se encargará de crear la fila en la tabla 'profiles'.
   */
  async createUser(email, password, fullName, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Estos metadatos son leídos por el Trigger SQL handle_new_user
        data: {
          full_name: fullName,
          role: role
        }
      }
    })
    
    if (error) throw error
    return data
  },

  /**
   * Actualiza el nombre o el rol de un usuario existente
   */
  async updateProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        role: profile.role,
        updated_at: new Date()
      })
      .eq('id', profile.id)
      .select()

    if (error) throw error
    return data[0]
  },

  /**
   * Elimina un usuario (Nota: Requiere permisos especiales en Supabase 
   * o manejar borrado lógico en la tabla profiles)
   */
  async deleteProfile(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  }
}