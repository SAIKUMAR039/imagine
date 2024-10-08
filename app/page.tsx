import Header from "@/components/Header";
import { MainContainer } from "@/components/main-container";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Main */}
      <MainContainer />
    </div>
  );
};

export default HomePage;
