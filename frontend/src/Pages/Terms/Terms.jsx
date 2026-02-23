import { Container } from "../../components";

const Terms = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-invert max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: "var(--color-primary)" }}>
            Terms of Service
          </h1>
          <div className="space-y-6 text-lg" style={{ color: "var(--text-secondary)" }}>
            <p>
              Last updated: 2026. By using Jacquard’s website and services, you agree to these terms.
            </p>
            <p>
              You must be at least 18 years old (or the age of majority in your jurisdiction) to place an order. You are responsible for providing accurate information and for keeping your account secure.
            </p>
            <p>
              Products are subject to availability. We reserve the right to limit quantities and to correct pricing or other errors. Our shipping and return policies apply as stated on the site.
            </p>
            <p>
              We may modify these terms at any time. Your continued use of the site after changes constitutes acceptance. For questions, please contact us via our Contact page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Terms;
