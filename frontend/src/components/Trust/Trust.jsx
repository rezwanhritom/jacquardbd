import { trustData } from "../../data/trust";
import { FiTruck, FiRotateCcw, FiShield, FiHeadphones } from "react-icons/fi";

const Trust = () => {
  const getIcon = (iconName) => {
    const icons = {
      truck: FiTruck,
      return: FiRotateCcw,
      shield: FiShield,
      support: FiHeadphones,
    };
    return icons[iconName] || FiShield;
  };

  return (
    <section
      className="border-y py-6 sm:py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {trustData.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <div key={item.id} className="flex items-start sm:items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-full"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--color-primary)" }}
              >
                <Icon size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Trust;
