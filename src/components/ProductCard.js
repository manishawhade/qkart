import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
      component="img"
        sx={{ height: 140 }}
        image={product.image}
        title={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
        {product.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
        ${product.cost}
        </Typography>
        <Rating
          name="simple-controlled"
          readOnly
          value={product.rating}
        />
      </CardContent>
      <CardActions>
        <Button fullWidth={true} className="button" variant="contained" startIcon={<AddShoppingCartOutlined />} onClick={() => handleAddToCart()}>ADD TO CART</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
