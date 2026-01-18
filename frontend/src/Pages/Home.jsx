import {
  Navbar,
  Hero,
  Categories,
  Products,
  Trust,
  Newsletter,
  Footer,
} from "../components";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Trust />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
