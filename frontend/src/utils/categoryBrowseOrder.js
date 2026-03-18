/**
 * Flat visit order of category leaves (section + subcategory) for Men/Women.
 * Matches Navbar / API: /category/{gender}/{section}/{subcategory}
 */
import { categoryTree } from "../data/categoryTree";

export function toCatSlug(name) {
  if (!name || typeof name !== "string") return "";
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function flattenGenderTree(tree, gender) {
  const out = [];
  const sectionNames = Object.keys(tree);
  for (const sectionName of sectionNames) {
    const sectionSlug = toCatSlug(sectionName);
    const val = tree[sectionName];
    if (Array.isArray(val)) {
      for (const item of val) {
        out.push({
          gender,
          sectionSlug,
          subcategorySlug: toCatSlug(item),
          sectionName,
          subName: item,
        });
      }
    } else if (val && typeof val === "object") {
      for (const subKey of Object.keys(val)) {
        const subVal = val[subKey];
        if (Array.isArray(subVal) && subVal.length > 0) {
          for (const leaf of subVal) {
            out.push({
              gender,
              sectionSlug,
              subcategorySlug: toCatSlug(leaf),
              sectionName,
              subName: leaf,
            });
          }
        } else {
          out.push({
            gender,
            sectionSlug,
            subcategorySlug: toCatSlug(subKey),
            sectionName,
            subName: subKey,
          });
        }
      }
    }
  }
  return out;
}

/** Full scroll order: current gender’s leaves first, then the other gender’s. */
export function getCategoryBrowseSequence(startGender) {
  const men = flattenGenderTree(categoryTree.Male, "men");
  const women = flattenGenderTree(categoryTree.Female, "women");
  return startGender === "men" ? [...men, ...women] : [...women, ...men];
}

export function findLeafIndexInSequence(sequence, gender, sectionSlug, subcategorySlug) {
  const sec = (sectionSlug || "").toLowerCase();
  const sub = (subcategorySlug || "").toLowerCase();
  const g = gender === "women" ? "women" : "men";
  return sequence.findIndex(
    (x) => x.gender === g && x.sectionSlug === sec && x.subcategorySlug === sub
  );
}

/** After viewing this leaf, next fetch starts at this index. */
export function getNextBrowseIndexAfterLeaf(sequence, gender, sectionSlug, subcategorySlug) {
  const i = findLeafIndexInSequence(sequence, gender, sectionSlug, subcategorySlug);
  return i >= 0 ? i + 1 : 0;
}

/**
 * Max sequence index among all subs visible on a section-only page (same section).
 */
export function getNextBrowseIndexAfterSectionPage(sequence, gender, sectionSlug, subcategoryNames) {
  const sec = (sectionSlug || "").toLowerCase();
  const g = gender === "women" ? "women" : "men";
  let max = -1;
  for (const name of subcategoryNames || []) {
    const sub = toCatSlug(name);
    const i = sequence.findIndex((x) => x.gender === g && x.sectionSlug === sec && x.subcategorySlug === sub);
    if (i > max) max = i;
  }
  return max >= 0 ? max + 1 : 0;
}

/**
 * Max sequence index for full gender overview (all sections × subs on page).
 */
export function getNextBrowseIndexAfterFullGenderPage(sequence, gender, sectionsPayload) {
  const g = gender === "women" ? "women" : "men";
  let max = -1;
  for (const { sectionName, subcategories } of sectionsPayload || []) {
    const sec = toCatSlug(sectionName);
    for (const { subcategoryName } of subcategories || []) {
      const sub = toCatSlug(subcategoryName);
      const i = sequence.findIndex((x) => x.gender === g && x.sectionSlug === sec && x.subcategorySlug === sub);
      if (i > max) max = i;
    }
  }
  return max >= 0 ? max + 1 : 0;
}
