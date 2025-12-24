import { supabase } from '../api/supabase'

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        base_ingredients(name, stock)
      `)
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },

  async save(product) {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: product.id || undefined,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        base_ingredient_id: product.base_ingredient_id || null,
        is_active: product.is_active
      })
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}