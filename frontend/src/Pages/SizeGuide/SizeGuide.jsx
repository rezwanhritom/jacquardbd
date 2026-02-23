import { Container } from "../../components";

/** Same size guide table as used when choosing a product (ProductVariants). */
const SIZE_GUIDE = [
  { size: "XS", chest: "34-36", waist: "28-30", length: "26" },
  { size: "S", chest: "36-38", waist: "30-32", length: "27" },
  { size: "M", chest: "38-40", waist: "32-34", length: "28" },
  { size: "L", chest: "40-42", waist: "34-36", length: "29" },
  { size: "XL", chest: "42-44", waist: "36-38", length: "30" },
  { size: "XXL", chest: "44-46", waist: "38-40", length: "31" },
  { size: "3XL", chest: "46-48", waist: "40-42", length: "32" },
];

const SizeGuide = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
            Size Guide
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Use this guide to find your best fit. All measurements are in inches.
          </p>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-primary)" }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Size</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Chest (inches)</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Waist (inches)</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Length (inches)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.size} className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <td className="py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>{row.size}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.chest}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.waist}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SizeGuide;
