import { Link } from "react-router";

function toSlug(s) {
  return (s || "").toLowerCase().replace(/\s+/g, "-");
}

/**
 * Desktop mega menu: even category columns first, product photos in a row underneath.
 * Men and Women share the same 6-column grid so columns line up; panel height stays compact.
 */
const MegaMenu = ({ genderLabel, categories = [], featured = [], onNavigate }) => {
  const genderSlug = (genderLabel || "").toLowerCase();
  const photos = (featured || []).filter((p) => p?.image).slice(0, 4);

  return (
    <div className="w-full max-w-[1120px] mx-auto px-8 xl:px-10 py-5">
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-5 items-start">
        {categories.map((category) => {
          const sectionSlug = toSlug(category.title);
          const sectionPath = `/category/${genderSlug}/${sectionSlug}`;
          return (
            <div key={category.id || category.title} className="min-w-0">
              <Link
                to={sectionPath}
                onClick={onNavigate}
                className="block mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] leading-5 hover:underline underline-offset-4"
                style={{ color: "var(--color-primary)" }}
              >
                {category.title}
              </Link>
              <ul className="space-y-1.5">
                {(category.items || []).map((item) => {
                  const itemLabel = typeof item === "string" ? item : item.label;
                  const children = typeof item === "string" ? [] : item.children || [];
                  const itemSlug = toSlug(itemLabel);
                  const itemPath = `/category/${genderSlug}/${sectionSlug}/${itemSlug}`;
                  return (
                    <li key={itemLabel}>
                      <Link
                        to={itemPath}
                        onClick={onNavigate}
                        className="block text-[13px] leading-5 hover:underline underline-offset-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {itemLabel}
                      </Link>
                      {children.length > 0 && (
                        <ul className="mt-1 mb-0.5 pl-2 space-y-1 border-l" style={{ borderColor: "var(--border-primary)" }}>
                          {children.map((child) => (
                            <li key={child}>
                              <Link
                                to={`/category/${genderSlug}/${sectionSlug}/${toSlug(child)}`}
                                onClick={onNavigate}
                                className="block text-[12px] leading-5 hover:underline underline-offset-2"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {child}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {photos.length > 0 && (
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
          <div className="grid grid-cols-4 gap-3">
            {photos.map((product) => (
              <Link
                key={product.slug || product.path}
                to={product.path}
                onClick={onNavigate}
                className="group block min-w-0"
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden max-h-[168px]"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <img
                    src={product.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p
                  className="mt-1.5 text-[11px] leading-snug line-clamp-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          to={`/category/${genderSlug}`}
          onClick={onNavigate}
          className="text-[11px] uppercase tracking-[0.16em] font-semibold hover:underline underline-offset-4"
          style={{ color: "var(--color-primary)" }}
        >
          Shop all {genderLabel}
        </Link>
      </div>
    </div>
  );
};

export default MegaMenu;
