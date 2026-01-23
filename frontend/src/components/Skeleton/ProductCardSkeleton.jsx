import Skeleton from "./Skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton height="300px" rounded="rounded-lg" />
      <div className="space-y-2">
        <Skeleton height="12px" width="60%" />
        <Skeleton height="16px" width="80%" />
        <Skeleton height="20px" width="40%" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
