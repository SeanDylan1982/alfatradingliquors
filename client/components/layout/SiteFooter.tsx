import { Link } from "react-router-dom";
import { useCatalog } from "@/lib/catalog";
import { getOpenStatus, openingHours, formatMinutes, storeInfo } from "@/lib/store-info";

const whatsAppUrl = `https://wa.me/${storeInfo.whatsappNumber}`;

export function SiteFooter() {
  const { categories } = useCatalog();
  const openStatus = getOpenStatus();

  return (
    <footer className="bg-primary text-primary-foreground print:hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-2xl font-semibold">{storeInfo.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Your neighbourhood bottle shop in Northmead, Benoni. Browse online, then send your order to us.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">18+ only</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Visit</h2>
          <address className="mt-4 text-sm not-italic leading-relaxed text-primary-foreground/80">
            {storeInfo.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            href={storeInfo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-gold"
          >
            Open in Google Maps
          </a>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Opening hours</h2>
          <p className="mt-4 text-sm font-medium">{openStatus.label}</p>
          <dl className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            {openingHours.map((entry) => (
              <div key={entry.label} className="flex justify-between gap-6">
                <dt>{entry.label}</dt>
                <dd className="tabular-nums">
                  {formatMinutes(entry.opens)} – {formatMinutes(entry.closes)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contact</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href={`tel:${storeInfo.phoneHref}`} className="hover:text-gold">
              {storeInfo.phoneDisplay}
            </a>
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              Chat on WhatsApp
            </a>
          </div>

          <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Shop</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-primary-foreground/80">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/shop?category=${category.id}`} className="hover:text-gold">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {storeInfo.name}. Please drink responsibly.</p>
          <Link to="/admin" className="hover:text-gold">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
