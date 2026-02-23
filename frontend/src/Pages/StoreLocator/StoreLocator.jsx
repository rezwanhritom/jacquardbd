import { Container } from "../../components";

const StoreLocator = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
            Store Locator
          </h1>
          <div
            className="rounded-xl p-8 text-left"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <p className="text-lg leading-relaxed">
              We do not have a physical store at this time. We are an online-only retailer and are working to bring you a store experience as soon as possible. Thank you for your patience and continued support.
            </p>
            <p className="mt-4 text-base" style={{ color: "var(--text-secondary)" }}>
              For any queries, please visit our Contact page or FAQs.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StoreLocator;
