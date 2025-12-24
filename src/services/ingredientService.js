import { supabase } from '../api/supabase'

export const ingredientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('base_ingredients')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },

  async save(ingredient) {
    const { data, error } = await supabase
      .from('base_ingredients')
      .upsert({
        id: ingredient.id || undefined,
        name: ingredient.name,
        stock: ingredient.stock,
        is_active: ingredient.is_active
      })
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('base_ingredients')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}