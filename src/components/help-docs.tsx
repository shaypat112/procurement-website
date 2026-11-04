import { Separator } from "@/components/ui/separator";
import { TypographyH2, TypographyH3, TypographyMuted, TypographyP } from "@/components/ui/typography";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "catalog", label: "Catalog" },
  { id: "request-order", label: "Request an order" },
  { id: "track-order", label: "Track an order" },
  { id: "inventory", label: "Inventory" },
  { id: "reinventory", label: "Reinventory" },
  { id: "account", label: "Account and settings" },
];

export function HelpDocs() {
  return <div className="grid items-start gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16">
    <nav aria-label="On this page" className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 lg:sticky lg:top-24 lg:border-0 lg:bg-transparent lg:p-0">
      <p className="mb-3 text-xs font-semibold text-[var(--text)]">On this page</p>
      <div className="flex flex-col gap-1 border-l border-[var(--border)] pl-3">{sections.map(section=><a key={section.id} href={`#${section.id}`} className="py-1 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--muted)]">{section.label}</a>)}</div>
    </nav>
    <article className="min-w-0 max-w-3xl pb-20 text-[var(--text)]">
      <section id="overview" className="scroll-mt-24"><TypographyH2>Getting started</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Sign in with Discord to open your dashboard. The dashboard shows requests tied to your account and a summary of shared inventory. Use the sidebar to move between the catalog, order sheet, and inventory.</TypographyP></section>
      <Separator className="my-9"/>
      <section id="catalog" className="scroll-mt-24"><TypographyH2>Catalog</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Search the catalog before adding a part. Each item should have one consistent name. Add a part number, supplier, cost, and specifications when you know them so future requests use the same entry.</TypographyP><TypographyH3 className="mt-6 text-base">Add a new item</TypographyH3><TypographyMuted className="mt-2">Open <strong className="font-medium text-[var(--text)]">Add item</strong>, fill in the item name, and save. The item is then available in the order selector.</TypographyMuted></section>
      <Separator className="my-9"/>
      <section id="request-order" className="scroll-mt-24"><TypographyH2>Request an order</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Select a catalog item, enter the quantity, and add a subsystem if it helps explain the request. Your Discord account is recorded automatically.</TypographyP><TypographyH3 className="mt-6 text-base">If the item is already active</TypographyH3><TypographyMuted className="mt-2">A warning shows the existing order and its requesters. Check whether your request is a duplicate. Confirming a request for the same item and subsystem adds its quantity to a Pending order. If the item is already Ordered, a new order row is created.</TypographyMuted></section>
      <Separator className="my-9"/>
      <section id="track-order" className="scroll-mt-24"><TypographyH2>Track an order</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Orders move from <strong className="font-medium text-[var(--text)]">Pending</strong> to <strong className="font-medium text-[var(--text)]">Ordered</strong> to <strong className="font-medium text-[var(--text)]">Delivered</strong>. Use the status control on the order sheet when the purchase is placed or the item arrives. Delivered quantities are added to inventory.</TypographyP><TypographyMuted className="mt-4">Your dashboard lists orders you requested, including your share of a stacked order.</TypographyMuted></section>
      <Separator className="my-9"/>
      <section id="inventory" className="scroll-mt-24"><TypographyH2>Inventory</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Inventory shows the on-hand quantity for each catalog item. Add storage details in the item row. Attach STEP, CAD, or reference files through the file control; select a file name to open an existing attachment.</TypographyP></section>
      <Separator className="my-9"/>
      <section id="reinventory" className="scroll-mt-24"><TypographyH2>Reinventory</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Use <strong className="font-medium text-[var(--text)]">Reinventory</strong> on the Inventory page for a physical count. Select the catalog item and enter the count on hand. Saving replaces its displayed quantity and records a dated check-in under your Discord account.</TypographyP></section>
      <Separator className="my-9"/>
      <section id="account" className="scroll-mt-24"><TypographyH2>Account and settings</TypographyH2><TypographyP className="mt-4 text-[var(--muted)]">Settings shows the Discord account used for your requests. You can switch between light and dark mode there or with the theme button in the top bar. Use Sign out when you are finished.</TypographyP></section>
    </article>
  </div>;
}
