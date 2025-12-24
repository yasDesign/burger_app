import { supabase } from "../api/supabase";

export const orderService = {
  async getAllPOS() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items (id, quantity, unit_price, products (name))")
      .order("id", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items (id, quantity, unit_price, products (name))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // ESTA ES LA ÚNICA FUNCIÓN CREATE QUE DEBE EXISTIR
  async create(total, cashierId, items, paymentMethod) {
    console.log(total, cashierId, items, paymentMethod)
    const { data, error } = await supabase.rpc("register_sale", {
      p_total_amount: total,
      p_cashier_id: cashierId,
      p_items: items,
      p_payment_method: paymentMethod, // Enviamos el valor dinámico
    });

    if (error) {
      console.error("Error en RPC:", error.message);
      throw error;
    }
    return data;
  },

  async voidOrder(orderId) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select();
    if (error) throw error;
    return data;
  },
};
