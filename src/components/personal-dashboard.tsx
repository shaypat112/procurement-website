"use client";

import { Archive, Clock3, PackageCheck, ShoppingCart } from "lucide-react";
import WidgetGrid, { type WidgetGridItem, type WidgetSize } from "@/components/kokonutui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DashboardOrder = { id: string; status: string; quantity: number; catalog: { name: string } };
type DashboardStock = { id: string; quantity: number; catalog: { name: string } };

export function PersonalDashboard({ orders, stock, onOrders, onInventory }: {
  orders: DashboardOrder[];
  stock: DashboardStock[];
  onOrders: () => void;
  onInventory: () => void;
}) {
  const number = (value: number, description: string) => (_size: WidgetSize) => (
    <div className="flex h-full flex-col justify-end">
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
      <Button type="button" variant="link" size="sm" onClick={onOrders} className="mt-2 h-auto w-fit p-0 text-xs underline underline-offset-4">Open orders →</Button>
    </div>
  );
  const items: WidgetGridItem[] = [
    { id: "open", title: "My open orders", icon: <ShoppingCart size={15} />, defaultSpan: 2, render: number(orders.filter((order) => order.status !== "DELIVERED").length, "Requests in progress") },
    { id: "pending", title: "Awaiting purchase", icon: <Clock3 size={15} />, defaultSpan: 2, render: number(orders.filter((order) => order.status === "PENDING").length, "My pending requests") },
    { id: "delivered", title: "My delivered orders", icon: <PackageCheck size={15} />, defaultSpan: 2, render: number(orders.filter((order) => order.status === "DELIVERED").length, "Requests received") },
    { id: "orders", title: "Recent orders", icon: <ShoppingCart size={15} />, defaultSpan: 4, render: () => (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden">{orders.slice(0, 3).map((order) => <div key={order.id} className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 text-xs last:border-0"><span className="min-w-0 truncate text-[var(--text)]">{order.catalog.name} <span className="text-[var(--muted)]">× {order.quantity}</span></span><Badge className="shrink-0">{order.status.toLowerCase()}</Badge></div>)}{orders.length === 0 && <p className="text-xs text-[var(--muted)]">Your requests will appear here.</p>}</div>
        <Button type="button" variant="link" size="sm" onClick={onOrders} className="mt-2 h-7 w-fit px-0 text-xs underline underline-offset-4">Open orders →</Button>
      </div>
    ) },
    { id: "inventory", title: "Inventory", icon: <Archive size={15} />, defaultSpan: 2, render: () => (
      <div className="flex h-full flex-col">
        <p className="text-2xl font-semibold tabular-nums text-[var(--text)]">{stock.reduce((sum, item) => sum + item.quantity, 0)} <span className="text-xs font-normal text-[var(--muted)]">units</span></p>
        <p className="mt-1 min-h-0 flex-1 truncate text-xs text-[var(--muted)]">{stock.length ? `${stock.length} catalog items on hand` : "Delivered items will appear here."}</p>
        <Button type="button" variant="link" size="sm" onClick={onInventory} className="mt-2 h-7 w-fit px-0 text-xs underline underline-offset-4">Open inventory →</Button>
      </div>
    ) },
  ];

  return <WidgetGrid items={items} rowHeight={164} className="!max-w-none [--wg-accent:var(--accent)]" />;
}
