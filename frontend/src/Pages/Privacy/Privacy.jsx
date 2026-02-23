import { Container } from "../../components";

const Privacy = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-invert max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: "var(--color-primary)" }}>
            Privacy Policy
          </h1>
          <div className="space-y-6 text-lg" style={{ color: "var(--text-secondary)" }}>
            <p>
              Last updated: 2026. Jacquard (“we”, “our”) is committed to protecting your privacy.
            </p>
            <p>
              We collect information you provide when you register, place an order, or contact us. We use this to process orders, improve our services, and communicate with you. We do not sell your personal data to third parties.
            </p>
            <p>
              We may update this policy from time to time. Continued use of our site after changes constitutes acceptance of the updated policy.
            </p>
            <p>
              For questions about this Privacy Policy, please contact us through our Contact page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Privacy;
