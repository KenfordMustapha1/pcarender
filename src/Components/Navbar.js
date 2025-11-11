import { useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="pca2.png" alt="PCA Logo" className="logo-image" />
      </div>
      <ul className="navbar-links">
        {isHomePage ? (
          <>
            <li><ScrollLink to="home" smooth={true} duration={800} offset={-80}>Home</ScrollLink></li>
            <li><ScrollLink to="about" smooth={true} duration={800} offset={-80}>About</ScrollLink></li>
            <li><ScrollLink to="contact-us" smooth={true} duration={800} offset={-80}>Contact Us</ScrollLink></li>
          </>
        ) : (
          <>
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/">About</RouterLink></li>
            <li><RouterLink to="/">Contact Us</RouterLink></li>
          </>
        )}
        <li><RouterLink to="/marketnav">Market</RouterLink></li>
      </ul>
      <div className="navbar-auth">
        <RouterLink to="/login" className="signin-btn">Sign In</RouterLink>
        <RouterLink to="/signup" className="signup-btn">Sign Up</RouterLink>
      </div>
    </nav>
  );
};

export default Navbar;
