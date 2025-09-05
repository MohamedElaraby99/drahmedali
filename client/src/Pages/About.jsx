import React from "react";
import aboutMainImage from "../assets/images/about.png";
import CarouselSlide from "../Components/CarouselSlide";
import { celebrities } from "../Constants/CelebrityData";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css"; 
import Layout from "../Layout/Layout";

function AboutUs() {
      const settings = {
        dots: true,
        screenY: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoading: true,
        autoplay: true,
        speed: 500,
      };
      
  return (
    <Layout>
      <section className="md:py-10 py-7 mb-10 text-white overflow-x-hidden md:px-16 px-6 min-h-[100vh]" dir="rtl">
        {/* hero */}
        <div className="flex md:flex-row flex-col-reverse items-center justify-center md:gap-10 gap-7 w-full space-y-7">
          <div className="md:w-1/2 w-full space-y-7 text-right">
            <h1 className="text-5xl text-blue-500 font-semibold font-inter text-right">
              تعليم <span className="font-nunito-sans">ميسور التكلفة وعالي الجودة</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-200 font-nunito-sans text-right leading-relaxed">
              هدفنا هو توفير التعليم الميسور التكلفة وعالي الجودة للعالم. 
              نحن نوفر المنصة للمدرسين والطلاب الطموحين لمشاركة مهاراتهم وإبداعهم 
              ومعرفتهم مع بعضهم البعض لتمكين والمساهمة في نمو ورفاهية البشرية.
            </p>
          </div>

          <div className="md:w-1/2 w-1/7 flex items-center justify-center">
            <img
              style={{
                filter: "drop-shadow(0px 15px 10px rgb(0,0,0));",
              }}
              alt="about main image"
              className="drop-shadow-2xl"
              src={aboutMainImage}
            />
          </div>
        </div>

        {/* slider */}
        <div className="w-[90vw] px-0 pt-7 mt-10 rounded-lg bg-[#dc85ffb4] dark:bg-[#393d4e93] backdrop-blur-lg md:h-[350px] h-[550px]">
          <Slider {...settings} className="h-full">
            {celebrities.map((details, index) => (
              <CarouselSlide details={details} key={index} />
            ))}
          </Slider>
        </div>
      </section>
    </Layout>
  );
}

export default AboutUs;
