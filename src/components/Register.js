import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading,setisLoading] = useState(false);
  const history = useHistory()

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
    let uname = document.getElementById('username').value
    let password = document.getElementById('password').value
    let confirmPassword = document.getElementById('confirmPassword').value
    var obj={ 
      username: uname,
      password: password,
      confirmPassword: confirmPassword
    }
    if(!validateInput(obj)) { return }
    setisLoading(true);
    delete obj.confirmPassword;
    axios
      .post(`${config.endpoint}/auth/register`, obj)
      .then((res) => {
        enqueueSnackbar("Registered successfully", { variant: "success" });
        history.push("/login");
      })
      .catch((error) => {
        let errMessage = "Something went wrong. Check that the backend is running, reachable and returns valid JSON.";
        if (error.response) {
          if(error.response.status === 400){
            errMessage = error.response.data.message;
          }
        }
        enqueueSnackbar(
          errMessage,
          { variant: "error" }
        );
      })
      .finally(() => setisLoading(false));
  };


  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    let res = true;
    if(data.username === ""){
      res = false;
      enqueueSnackbar("Username is a required field", { variant: 'warning' })
    }else if(data.username.length < 6){
      res = false;
      enqueueSnackbar("Username must be at least 6 characters", { variant: 'warning' })
    }else if(data.password === ""){
      res = false;
      enqueueSnackbar("Password is a required field", { variant: 'warning' })
    }else if(data.password.length < 6){
      res = false;
      enqueueSnackbar("Password must be at least 6 characters", { variant: 'warning' })
    }else if(data.confirmPassword !== data.password){
      res = false;
      enqueueSnackbar("Passwords do not match", { variant: 'warning' })
    }
    return res;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons ><Button
          onClick={() => {
            history.push("/");
          }}
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Back to explore
        </Button></Header>
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
          />
          { !isLoading && <Button className="button" variant="contained" onClick={register}>
            Register Now
           </Button>}
          { isLoading && <CircularProgress/>}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link className="link" to={'/login'}>
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
