import { useState } from "react";
import { Link } from "react-router";
import { FiChevronRight } from "react-icons/fi";

function toSlug(s) {
  return (s || "").toLowerCase().replace(/\s+/g, "-");
}

/**
 * Mobile drill-down: category → subcategory → leaf. Text only, no product photos.
 */
const MobileCategoryList = ({ tree, genderSlug, onNavigate }) => {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!tree || typeof tree !== "object") return null;

  return (
    <div className="pl-1 pb-2">
      {Object.entries(tree).map(([sectionTitle, sectionValue]) => {
        const sectionSlug = toSlug(sectionTitle);
        const sectionPath = `/category/${genderSlug}/${sectionSlug}`;
        const isObject = sectionValue && typeof sectionValue === "object" && !Array.isArray(sectionValue);
        const leaves = Array.isArray(sectionValue) ? sectionValue.filter(Boolean) : [];
        const hasChildren = isObject || leaves.length > 0;
        const sectionOpen = expanded.has(sectionTitle);

        return (
          <div key={sectionTitle}>
            <div className="flex items-center justify-between">
              <Link
                to={sectionPath}
                onClick={onNavigate}
                className="flex-1 min-w-0 py-1 pr-2 text-[13px] font-medium"
                style={{ color: sectionOpen ? "var(--color-primary)" : "var(--text-secondary)" }}
              >
                {sectionTitle}
              </Link>
              {hasChildren ? (
                <button
                  type="button"
                  className="p-2 -mr-1 shrink-0"
                  aria-expanded={sectionOpen}
                  aria-label={sectionOpen ? `Collapse ${sectionTitle}` : `Expand ${sectionTitle}`}
                  onClick={() => toggle(sectionTitle)}
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <FiChevronRight
                    size={14}
                    className="transition-transform duration-200"
                    style={{ transform: sectionOpen ? "rotate(90deg)" : "none" }}
                  />
                </button>
              ) : null}
            </div>

            {sectionOpen && isObject && (
              <div className="pl-3 border-l" style={{ borderColor: "var(--border-primary)" }}>
                {Object.entries(sectionValue).map(([subTitle, subValue]) => {
                  const subKey = `${sectionTitle}/${subTitle}`;
                  const subSlug = toSlug(subTitle);
                  const subPath = `/category/${genderSlug}/${sectionSlug}/${subSlug}`;
                  const subLeaves = Array.isArray(subValue) ? subValue.filter(Boolean) : [];
                  const subOpen = expanded.has(subKey);

                  return (
                    <div key={subKey}>
                      <div className="flex items-center justify-between">
                        <Link
                          to={subPath}
                          onClick={onNavigate}
                          className="flex-1 min-w-0 py-1.5 pr-2 text-[13px]"
                          style={{ color: subOpen ? "var(--color-primary)" : "var(--text-secondary)" }}
                        >
                          {subTitle}
                        </Link>
                        {subLeaves.length > 0 ? (
                          <button
                            type="button"
                            className="p-2 -mr-1 shrink-0"
                            aria-expanded={subOpen}
                            aria-label={subOpen ? `Collapse ${subTitle}` : `Expand ${subTitle}`}
                            onClick={() => toggle(subKey)}
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            <FiChevronRight
                              size={14}
                              className="transition-transform duration-200"
                              style={{ transform: subOpen ? "rotate(90deg)" : "none" }}
                            />
                          </button>
                        ) : null}
                      </div>
                      {subOpen && subLeaves.length > 0 && (
                        <div className="pl-3 pb-1">
                          {subLeaves.map((leaf) => (
                            <Link
                              key={leaf}
                              to={`/category/${genderSlug}/${sectionSlug}/${toSlug(leaf)}`}
                              onClick={onNavigate}
                              className="block py-1.5 text-[12px]"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {leaf}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {sectionOpen && leaves.length > 0 && (
              <div className="pl-3 pb-1 border-l" style={{ borderColor: "var(--border-primary)" }}>
                {leaves.map((leaf) => (
                  <Link
                    key={leaf}
                    to={`/category/${genderSlug}/${sectionSlug}/${toSlug(leaf)}`}
                    onClick={onNavigate}
                    className="block py-1.5 text-[13px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {leaf}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileCategoryList;
