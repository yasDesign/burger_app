import { supabase } from '../api/supabase'

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },

  async save(category) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: category.id || undefined,
        name: category.name, // nombre -> name
        is_active: category.is_active // activo -> is_active
      })
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}