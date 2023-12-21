import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
const Header = ({ children, hasHiddenAuthButtons }) => {

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
    </Box>
  );
};

export default Header;
