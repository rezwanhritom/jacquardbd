/**
 * Hero: single static image only. Image always fits within the frame (contain);
 * may show neutral background on sides/top/bottom if aspect ratio differs.
 */
const Hero = () => {
  const heroImage = "/home-hero.png";

  return (
    <section
      className="relative h-[55vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden flex items-center justify-center bg-neutral-200"
      aria-label="Hero"
    >
      <img
        src={heroImage}
        alt=""
        className="w-full h-full object-contain object-center"
      />
    </section>
  );
};

export default Hero;
