import Skeleton from "./Skeleton";

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b-2" style={{ borderColor: "var(--border-primary)" }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" width="100%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" width="100%" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
