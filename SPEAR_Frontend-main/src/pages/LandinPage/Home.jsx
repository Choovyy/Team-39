import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="relative h-screen w-screen m-0 p-0 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/src/assets/imgs/background.jpg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-85 z-10"></div>

      {/* Full-Height Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-full relative z-20">
        {/* Left Grid */}
        <div className="flex flex-col justify-center items-start text-white px-8 md:pl-20 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight font-sans">
            Student Peer
            <br /> Evaluation and Review
            <br /> System (S.P.E.A.R.)
          </h1>
          <p className="text-lg">
            Empowering collaboration and academic excellence
          </p>
          <Link to="/register">
            <button className="bg-orange-400 text-white py-2 px-4 rounded-md text-lg hover:bg-orange-500 transition">
              Get Started
            </button>
          </Link>
        </div>

        {/* Right Grid */}
        <div className="flex items-center justify-center">
          <img
            src="src/assets/imgs/logo-light.png"
            alt="SPEAR Logo"
            className="max-w-full h-auto mr-10 mb-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
