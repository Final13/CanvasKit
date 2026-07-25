import { NextRequest, NextResponse } from "next/server";
import { getOrderWithItems } from "@/lib/orders/order.db";

interface OrderItemResponse {
  id: string;
  templateSlug: string;
  templateTitle: string;
  customizationJson: string | null;
}

interface OrderResponse {
  id: string;
  status: string;
  items: OrderItemResponse[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.length < 10) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const data = await getOrderWithItems(id);
  if (!data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const response: OrderResponse = {
    id: data.order.id,
    status: data.order.status,
    items: data.items.map((item) => ({
      id: item.id,
      templateSlug: item.template_slug,
      templateTitle: item.template_title,
      customizationJson: item.customization_json,
    })),
  };

  return NextResponse.json(response);
}
