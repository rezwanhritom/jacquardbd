import { Link } from "react-router";

const Tile = ({ item }) => {
  if (!item?.image) return null;
  return (
    <Link
      to={item.path}
      className="group relative block overflow-hidden h-[58vw] min-h-[260px] max-h-[420px] md:h-[min(72vh,640px)] md:max-h-none md:min-h-[420px]"
      aria-label={`Shop ${item.title}`}
    >
      <img
        src={item.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.08) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-8 text-white">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-white/80 mb-1.5">
          Shop
        </p>
        <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-none">
          {item.title}
        </h3>
        <span className="mt-3 inline-flex w-fit text-xs sm:text-sm font-medium tracking-wide border-b border-white/70 pb-0.5 group-hover:border-white">
          Shop now
        </span>
      </div>
    </Link>
  );
};

/**
 * Men / Women tiles using the most-sold product image from each gender.
 */
const ShopDepartments = ({ men, women }) => {
  const tiles = [men, women].filter((t) => t?.image);
  if (!tiles.length) return null;

  return (
    <section aria-label="Shop Men and Women" className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
      <div className={`grid gap-2 sm:gap-3 ${tiles.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {tiles.map((item) => (
          <Tile key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
};

export default ShopDepartments;
