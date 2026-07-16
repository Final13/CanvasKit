import { getMysqlClient } from "@/lib/mysql";

export interface YookassaPaymentRecord {
  id: string;
  order_id: string;
  yookassa_payment_id: string;
  amount: number;
  status: string | null;
  payload_json: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createYookassaPaymentRecord(data: {
  orderId: string;
  yookassaPaymentId: string;
  amount: number;
  status: string;
  payloadJson: string;
}): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query(
    `INSERT INTO yookassa_payments (order_id, yookassa_payment_id, amount, status, payload_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.orderId,
      data.yookassaPaymentId,
      data.amount,
      data.status,
      data.payloadJson,
    ]
  );
}

export async function updateYookassaPaymentStatus(
  yookassaPaymentId: string,
  status: string,
  payloadJson: string
): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query(
    `UPDATE yookassa_payments
     SET status = ?, payload_json = ?
     WHERE yookassa_payment_id = ?`,
    [status, payloadJson, yookassaPaymentId]
  );
}

export async function getYookassaPaymentByYookassaId(
  yookassaPaymentId: string
): Promise<YookassaPaymentRecord | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const rows = await db.query<YookassaPaymentRecord[]>(
    "SELECT * FROM yookassa_payments WHERE yookassa_payment_id = ?",
    [yookassaPaymentId]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
