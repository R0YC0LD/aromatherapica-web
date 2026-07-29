import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { notFound } from "next/navigation";

export default async function OrderResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.localOrder.findUnique({ where: { id } });
  if (!order) notFound();

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Sipariş alındı</h1>
      <p>Yerel sipariş no: <strong>{order.id}</strong></p>
      {order.ticimaxOrderCode ? <p>Ticimax sipariş kodu: <strong>{order.ticimaxOrderCode}</strong></p> : null}
      {order.ticimaxOrderId ? <p>Ticimax sipariş ID: <strong>{order.ticimaxOrderId}</strong></p> : null}
      <p>Durum: {order.status}</p>
      <p>Ödeme: {order.paymentStatus}</p>
      <p>Tutar: {formatCurrency(order.totalAmount)}</p>
      <p>Tarih: {formatDate(order.createdAt)}</p>
    </section>
  );
}
