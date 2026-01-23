import { Container } from "../components";

const About = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
            About Us
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Welcome to Jacquard, where fashion meets elegance. We are dedicated to providing
            premium quality clothing and accessories that reflect your unique style.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default About;
