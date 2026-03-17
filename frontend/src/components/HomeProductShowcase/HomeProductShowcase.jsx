import ParallaxProductCard from "../ParallaxProductCard";

/**
 * Mobile: single column (one by one). Desktop: New Arrivals 2x2, Best Sellers 2 in a row.
 */
const HomeProductShowcase = ({ products }) => {
  if (!products?.length) return null;
  return (
    <div
      className={`grid gap-px transition-colors duration-300 grid-cols-1 md:grid-cols-2`}
      style={{ backgroundColor: "var(--border-primary)" }}
    >
      {products.map((product) => {
        const productId = product.slug || product._id;
        const image =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "https://via.placeholder.com/600x800?text=No+image";
        const description =
          product.shortDescription ||
          product.description ||
          "Discover this piece from our collection.";
        return (
          <ParallaxProductCard
            key={product._id || product.id}
            to={`/product/${productId}`}
            image={image}
            title={product.name}
            description={description}
          />
        );
      })}
    </div>
  );
};

export default HomeProductShowcase;
