import { assets } from "../assets/assets_frontend/assets";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleExploreDoctors = () => {
    navigate("/doctors");
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20">
      {/* ---------- left side ---------- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-28" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block" /> schedule your appointment
            hassle-free.
          </p>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row w-full md:w-auto">
          <a
            href="#speciality"
            className="group flex items-center justify-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm hover:scale-105 transition-all duration-300"
          >
            Book Appointment
            <img
              className="w-3 transition-transform duration-300 group-hover:translate-x-2"
              src={assets.arrow_icon}
              alt=""
            />
          </a>
          <button
            onClick={handleExploreDoctors}
            className="group flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-full text-white text-sm transition-all duration-300 transform hover:scale-105"
          >
            🔍 Explore Doctors
            <img
              className="w-3 transition-transform duration-300 group-hover:translate-x-2 brightness-0 invert"
              src={assets.arrow_icon}
              alt=""
            />
          </button>
        </div>
      </div>

      {/* ---------- right side ---------- */}
      <div className="md:w-1/2 relative">
        <img
          className="w-full md:absolute bottom-0 h-auto rounded-lg"
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Hero;
