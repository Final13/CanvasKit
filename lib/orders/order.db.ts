import { getMysqlClient } from "@/lib/mysql";

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "cancelled";
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  payment_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  template_slug: string;
  template_title: string;
  preview_url: string | null;
  price: number;
  customization_json: string | null;
}

export interface CreateOrderInput {
  id: string;
  userId: string;
  total: number;
  customerName?: string;
  customerEmail?: string;
  items: Omit<OrderItem, "id" | "order_id">[];
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  const transaction = await db.transaction();
  try {
    transaction.query(
      `INSERT INTO orders (id, user_id, status, total, customer_name, customer_email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.userId,
        "pending",
        input.total,
        input.customerName ?? null,
        input.customerEmail ?? null,
      ]
    );

    for (const item of input.items) {
      const itemId = generateId();
      transaction.query(
        `INSERT INTO order_items (id, order_id, template_slug, template_title, preview_url, price, customization_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          input.id,
          item.template_slug,
          item.template_title,
          item.preview_url ?? null,
          item.price,
          item.customization_json ?? null,
        ]
      );
    }

    await transaction.commit();
    return input.id;
  } catch (error) {
    console.error("createOrder transaction error:", error);
    console.error(
      "createOrder transaction error details:",
      typeof error,
      JSON.stringify(error),
      error instanceof Error ? error.stack : "no stack"
    );
    await new Promise<void>((resolve) => {
      transaction.rollback(() => resolve());
    });
    throw error;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const db = getMysqlClient();
  if (!db) return [];

  const rows = await db.query<Order[]>(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return Array.isArray(rows) ? rows : [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const rows = await db.query<Order[]>("SELECT * FROM orders WHERE id = ?", [
    id,
  ]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function getOrderWithItems(
  id: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const orderRows = await db.query<Order[]>(
    "SELECT * FROM orders WHERE id = ?",
    [id]
  );
  const order =
    Array.isArray(orderRows) && orderRows.length > 0 ? orderRows[0] : null;
  if (!order) return null;

  const itemRows = await db.query<OrderItem[]>(
    "SELECT * FROM order_items WHERE order_id = ?",
    [id]
  );
  return { order, items: Array.isArray(itemRows) ? itemRows : [] };
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
}

export async function setOrderPaymentId(
  id: string,
  paymentId: string
): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query("UPDATE orders SET payment_id = ? WHERE id = ?", [
    paymentId,
    id,
  ]);
}
