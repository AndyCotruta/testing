import express from "express";
import multer from "multer";
import { extname } from "path";
import {
  getProducts,
  saveProductImage,
  writeProducts,
} from "../lib/fs-tools.js";
import httpErrors from "http-errors";

const filesRouter = express.Router();

const { NotFound } = httpErrors;

// 1. ADD product image
filesRouter.post(
  "/:id/upload",
  multer().single("productImg"),
  async (req, res, next) => {
    try {
      const fileExtensionType = extname(req.file.originalname);
      const fileName = req.params.id + fileExtensionType;
      await saveProductImage(fileName, req.file.buffer);
      const url = `http://localhost:3001/productsImgs/${fileName}`;
      const productsArray = await getProducts();
      const productID = req.params.id;
      const oldProductIndex = productsArray.findIndex(
        (product) => product.id === productID
      );
      if (oldProductIndex !== -1) {
        const oldProduct = productsArray[oldProductIndex];
        const updatedProduct = {
          ...oldProduct,
          imageUrl: url,
          updatedAt: new Date(),
        };
        productsArray[oldProductIndex] = updatedProduct;
        await writeProducts(productsArray);
        res.send(
          "The product with id " +
            productID +
            " has been updated with the correct image"
        );
      } else {
        next(NotFound(`Product with id ${productID} was not found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);
export default filesRouter;
