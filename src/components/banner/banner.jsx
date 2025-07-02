import catcherBanner from "../game-catcher/assets/banner.jpg";
import "./banner.css";

export const Banner = ({ game }) => {
  return (
    <div className='banner-container'>
      <img className='banner-image' src={catcherBanner} />
    </div>
  );
};