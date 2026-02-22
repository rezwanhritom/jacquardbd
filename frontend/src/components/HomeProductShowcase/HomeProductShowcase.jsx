import { Link } from "react-router";

/**
 * Two products max: image block with name + description centered on the image.
 * Mobile: stacked. Desktop: side by side. Tiny white gap between. No price.
 */
const HomeProductShowcase = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px transition-colors duration-300" style={{ backgroundColor: "#fff" }}>
      {products.map((product) => (
        <ProductBlock key={product.id} product={product} />
      ))}
    </div>
  );
};

const ProductBlock = ({ product }) => {
  const description = product.description || "Discover this piece from our collection.";

  return (
    <Link
      to={`/product/${product.id}`}
      className="block relative overflow-hidden aspect-[3/4] md:aspect-[4/5] group"
    >
      <div className="absolute inset-0">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/50" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md">
            {product.name}
          </h3>
          <p className="text-sm md:text-base text-white/95 leading-relaxed drop-shadow-sm line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default HomeProductShowcase;
