import { Link } from "react-router";
import { FiStar, FiGift, FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Membership = () => {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role ?? "user";
  if (role === "premium" || role === "admin") {
    return null;
  }

  const benefits = [
    { icon: FiStar, title: "Early access", description: "New collections before anyone else" },
    { icon: FiGift, title: "Member offers", description: "Discounts and birthday rewards" },
    { icon: FiShield, title: "Priority support", description: "Faster help when you need it" },
  ];

  const becomeMemberTo = isAuthenticated ? "/account" : "/login";

  return (
    <section
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      style={{ backgroundColor: "var(--color-primary)", color: "white" }}
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/70 mb-3">Membership</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-3">
            Join exclusive membership
          </h2>
          <p className="text-sm sm:text-base text-white/80 mb-6 max-w-md">
            Unlock rewards, early drops, and a smoother shopping experience.
          </p>
          <Link
            to={becomeMemberTo}
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold"
            style={{ backgroundColor: "white", color: "#004122" }}
          >
            Become a member
          </Link>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="p-5 border border-white/15 bg-white/5">
                <Icon size={20} className="mb-3 text-white/90" />
                <h3 className="text-sm font-semibold mb-1">{benefit.title}</h3>
                <p className="text-xs text-white/75 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Membership;
