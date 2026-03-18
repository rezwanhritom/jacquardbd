/**
 * Home hero: mobile uses a 4:5 slot capped by viewport (fits on screen);
 * desktop uses a 21:9-style height. Image object-cover — design for those ratios.
 */
const Hero = () => {
  const heroImage = "/home-hero.png";

  return (
    <section className="relative w-full overflow-hidden bg-neutral-200 jacquard-hero-home" aria-label="Hero">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </section>
  );
};

export default Hero;
