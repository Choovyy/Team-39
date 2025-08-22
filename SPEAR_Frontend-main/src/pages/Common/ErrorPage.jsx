import React from "react";
import { useNavigate } from "react-router-dom";
import errorImage from "../../assets/imgs/error2.jpeg";

const ErrorPage = () => {
  const navigate = useNavigate();


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <img
        src={errorImage}
        alt="Error Illustration"
        className="w-1/6 max-w-md mb-8 translate-x-7"
      />

      <div className="text-center px-4">
        <h1 className="text-4xl font-semibold text-gray-700 mb-4">
          Something's wrong here...
        </h1>
        <p className="text-gray-500 text-lg mb-6">
          We can't find the page you're looking for. Please check the URL or
          go back to the previous page.
        </p>
      </div>

      <div className="flex gap-4">
      <button
      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-300"
      onClick={() => navigate(-1)}
    >
      Go back to previous page
     </button>

        {/* <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-300">
          Help
        </button> */}
      </div>
    </div>
  );
};

export default ErrorPage;
