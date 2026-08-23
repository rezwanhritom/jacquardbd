import Skeleton from "./Skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] w-full">
        <Skeleton height="100%" rounded="rounded-lg" />
      </div>
      <div className="space-y-2 px-1">
        <Skeleton height="12px" width="70%" />
        <Skeleton height="16px" width="40%" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
