import Container from "../Container";

const Section = ({
  children,
  className = "",
  containerClassName = "",
  maxWidth = "7xl",
  backgroundColor = "primary",
  padding = "default",
}) => {
  const backgroundColorClasses = {
    primary: "bg-theme-primary",
    secondary: "bg-theme-secondary",
    tertiary: "bg-theme-tertiary",
  };

  const paddingClasses = {
    none: "",
    small: "py-8 sm:py-12",
    default: "py-16 sm:py-20",
    large: "py-24 sm:py-32",
  };

  return (
    <section
      className={`${backgroundColorClasses[backgroundColor]} ${paddingClasses[padding]} transition-colors duration-300 ${className}`}
    >
      <Container maxWidth={maxWidth} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
};

export default Section;
