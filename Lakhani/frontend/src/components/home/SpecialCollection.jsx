// SpecialCollection.jsx
import { Link } from "react-router-dom";

const SpecialCollection = () => {
  return (
    <section className="p-6">
      <div className="container-fluid p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="col-span-1">
            <div className="bg-[#1f1f1f] overflow-hidden rounded-lg shadow-md relative">
              <div className="absolute inset-0 flex justify-center items-center flex-col bg-gray-800 bg-opacity-80 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10">
                <h1 className="text-2xl md:text-4xl text-white font-normal mb-0 tracking-wider">
                  New Arrivals 2026
                </h1>
                <p className="text-white text-lg">Crown for wife</p>
                <br />
                <h3 className="text-3xl md:text-4xl text-white font-normal mb-0 tracking-wider">
                  Coming soon...
                </h3>
              </div>
              <img
                src="/images/banner/11.jpg"
                alt="New Arrivals"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-[#1f1f1f] overflow-hidden rounded-lg shadow-md relative">
              <div className="absolute inset-0 flex justify-center items-center flex-col bg-gray-800 bg-opacity-80 opacity-0 hover:opacity-100 transition-opacity duration-300 z-10">
                <h1 className="text-2xl md:text-4xl text-white font-normal mb-0 tracking-wider">
                  Featured Products 2026
                </h1>
                <p className="text-white text-lg">Ring for Valentine</p>
                <br />
                <h3 className="text-3xl md:text-4xl text-white font-normal mb-0 tracking-wider">
                  Coming soon...
                </h3>
              </div>
              <img
                src="/images/banner/2.jpg"
                alt="Featured Products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialCollection;
