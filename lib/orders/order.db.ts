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
  /** Полноразмерный PNG дизайна (data URL) — для письма после оплаты. */
  png_data?: string | null;
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
      ],
    );

    for (const item of input.items) {
      const itemId = generateId();
      transaction.query(
        `INSERT INTO order_items (id, order_id, template_slug, template_title, preview_url, price, customization_json, png_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          input.id,
          item.template_slug,
          item.template_title,
          item.preview_url ?? null,
          item.price,
          item.customization_json ?? null,
          item.png_data ?? null,
        ],
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
      error instanceof Error ? error.stack : "no stack",
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
    [userId],
  );
  return Array.isArray(rows) ? rows : [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const rows = await db.query<Order[]>("SELECT * FROM orders WHERE id = ?", [id]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function getOrderWithItems(
  id: string,
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const orderRows = await db.query<Order[]>("SELECT * FROM orders WHERE id = ?", [id]);
  const order = Array.isArray(orderRows) && orderRows.length > 0 ? orderRows[0] : null;
  if (!order) return null;

  const itemRows = await db.query<OrderItem[]>("SELECT * FROM order_items WHERE order_id = ?", [
    id,
  ]);
  return { order, items: Array.isArray(itemRows) ? itemRows : [] };
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
}

export async function setOrderPaymentId(id: string, paymentId: string): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query("UPDATE orders SET payment_id = ? WHERE id = ?", [paymentId, id]);
}

/**
 * Оплаченные заказы пользователя с items (для страницы «Ваши заказы»).
 */
export interface PaidOrderItem {
  id: string;
  orderId: string;
  templateSlug: string;
  templateTitle: string;
  previewUrl: string | null;
  customizationJson: string | null;
}

export interface PaidOrder {
  id: string;
  createdAt: Date;
  items: PaidOrderItem[];
}

export async function getPaidOrdersWithItems(userId: string): Promise<PaidOrder[]> {
  const db = getMysqlClient();
  if (!db) return [];

  const orderRows = await db.query<Order[]>(
    "SELECT * FROM orders WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC",
    [userId],
  );
  const orders = Array.isArray(orderRows) ? orderRows : [];
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const itemRows = await db.query<OrderItem[]>(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    orderIds,
  );
  const items = Array.isArray(itemRows) ? itemRows : [];

  return orders.map((order) => ({
    id: order.id,
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.id,
        orderId: item.order_id,
        templateSlug: item.template_slug,
        templateTitle: item.template_title,
        previewUrl: item.preview_url,
        customizationJson: item.customization_json,
      })),
  }));
}

/**
 * Slug'и шаблонов из оплаченных заказов пользователя.
 */
export async function getPurchasedTemplateSlugs(userId: string): Promise<string[]> {
  const db = getMysqlClient();
  if (!db) return [];

  const rows = await db.query<{ template_slug: string }[]>(
    `SELECT DISTINCT oi.template_slug
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = ? AND o.status = 'paid'`,
    [userId],
  );
  return Array.isArray(rows) ? rows.map((r) => r.template_slug) : [];
}
