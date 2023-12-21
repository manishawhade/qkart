import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import { useHistory} from "react-router-dom";
import { Avatar, Button, Stack } from "@mui/material";
import ProductCard from './ProductCard.js'
import CartCard from './Cart.js'
import { generateCartItemsFrom } from './Cart.js'

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [token, settoken] = useState(false);
  const [isLoading,setisLoading] = useState(false);
  const [data,setdata] = useState(null);
  const [cartdata,setcartdata] = useState(null);
  const history = useHistory();
  const [timerId,settimerId] = useState(null);
  const [isSearchFailed,setisSearchFailed] = useState(false);
  const [inputValue,setinputValue] = useState("")

  useEffect(() => {
    performAPICall();
  },[]);

  useEffect(() => {
    return () => clearTimeout(timerId);
  },[timerId]);

  useEffect(() => {
    var userdata = localStorage.getItem("token");
    userdata === null ? setisLoggedIn(false) : setisLoggedIn(true);
  });

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
*/

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
 * @property {string} productId - Unique ID for the product
 */



  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setisLoading(true);
    axios
      .get(`${config.endpoint}/products`)
      .then((res) => {
        setdata(res.data)
        var token = localStorage.getItem("token");
        if(token){
          settoken(token);
          fetchCart(token, res.data);
        }
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

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    axios
          .get(`${config.endpoint}/products/search?value=${text}`)
          .then((res) => {
            setisSearchFailed(false)
            setdata(res.data)
          })
          .catch(() => {
            setisSearchFailed(true)
          })
    // let value = text.target.value.toLowerCase()
    // clearTimeout(timerId)
    // if(value){
    //   settimerId(setTimeout(() => {
    //     axios
    //       .get(`${config.endpoint}/products/search?value=${value}`)
    //       .then((res) => {
    //         setisSearchFailed(false)
    //         setdata(res.data)
    //       })
    //       .catch(() => {
    //         setisSearchFailed(true)
    //       })
    //   }, 1000));
    // }else{
    //   performAPICall()
    // }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let value = event.target.value.toLowerCase()
    setinputValue(value)
    clearTimeout(timerId)
    if(value){
      settimerId(setTimeout(() => {
        performSearch(value)
        // axios
        //   .get(`${config.endpoint}/products/search?value=${value}`)
        //   .then((res) => {
        //     setisSearchFailed(false)
        //     setdata(res.data)
        //   })
        //   .catch(() => {
        //     setisSearchFailed(true)
        //   })
      }, debounceTimeout));
    }else{
      performAPICall()
    }
  };





  


  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token, proddata) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      axios
      .get(`${config.endpoint}/cart`,
        {headers: {
          "Authorization": `Bearer ${token}`
          }   
        }
      )
      .then((res) => {
        let cartitems = generateCartItemsFrom(res.data, proddata)
        setcartdata(cartitems)
      })
      .catch((error) => {
        console.log(error)
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
      });
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let item = items.find(x => x.productId === productId)
    if(item){
      if(item.quantity === 0){
        return false
      }else{
        return true;
      }
    }
    return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    var obj = {
      productId:productId,
      qty:qty
    }
    axios
      .post(`${config.endpoint}/cart`, obj,
        {
          headers: {
          "Authorization": `Bearer ${token}`
          }   
        }
      )
      .then((res) => {
        let cartitems = generateCartItemsFrom(res.data, data)
        setcartdata(cartitems)
      })
      .catch((error) => {
        console.log(error)
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
      });
  };

  const handleAddToCart = (item) => {
    if(!isLoggedIn){
      enqueueSnackbar("Login to add an item to the Cart", { variant: "error" });
      return;
    }
    if(isItemInCart(cartdata, item._id)){
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "error" });
      return;
    }
    addToCart(token, cartdata, data, item._id, 1)
  }

  const handleQuantity = (value,productId) => {
    addToCart(token, cartdata, data, productId, value)
  } 


  return (
    <div>
      <Header>
      {isLoggedIn ? (
        <>
        <TextField
                className="search-desktop"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search for items/categories"
                value={inputValue}
                name="search"
                onChange={(e) => {debounceSearch(e,500)}}
              />
        
            <Stack direction="row" spacing={2}>
                <Avatar alt={localStorage.getItem('username')} src="../../public/avatar.png" />{localStorage.getItem('username')}
                <Button
                  className="explore-button"
                  variant="text"
                  onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('username')
                    localStorage.removeItem('balance')
                    history.push("/");
                    window.location.reload()
                  }}
                >
                  LOGOUT
                </Button>
            </Stack>
            </>
          ) : (
            <>
              <TextField
                className="search-desktop"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search for items/categories"
                value={inputValue}
                name="search"
                onChange={(e) => {debounceSearch(e,500)}}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  className="explore-button"
                  variant="text"
                  onClick={() => {
                    history.push("/login");
                  }}
                >
                  LOGIN
                </Button>
                <Button
                  className="button"
                  variant="contained"
                  onClick={() => {
                    history.push("/register");
                  }}
                >
                  REGISTER
                </Button>
              </Stack>
            </>
          )}
      </Header>

        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}


      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        value={inputValue}
        onChange={(e) => {debounceSearch(e,500)}}
      />
      <Grid container spacing={2}>
        <Grid item md xs={12}>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          {
            (isLoading)
            ?
            <div className="loader">
              <CircularProgress/>
              <Typography variant="caption" display="block" gutterBottom>
              Loading Products
              </Typography>
            </div>
            :
            (isSearchFailed)
            ?
            <div className="loader">
              <SentimentDissatisfied/>
              <Typography variant="caption" display="block" gutterBottom>
              No products found
              </Typography>
            </div>
            :
            <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
              {
              data && data.map((item) => (
                <Grid key={item._id} item xs={2} md={4}>
                  <ProductCard  product={item} handleAddToCart={() => handleAddToCart(item)} />
                </Grid>
              ))
              }
            </Grid>
          }
        </Grid>  
        {isLoggedIn && <Grid item md={3} xs={12}>
          {cartdata && <CartCard products={data} items={cartdata} handleQuantity={handleQuantity}/>}
        </Grid>
        }
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
