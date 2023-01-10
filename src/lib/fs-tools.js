import fs from "fs-extra";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const { writeFile, readJSON, writeJSON } = fs;

export const publicFolderPath = join(process.cwd(), "./public");

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const productsJSONPath = join(dataFolderPath, "products.json");
const reviewsJSONPath = join(dataFolderPath, "reviews.json");

const productsImagesPath = join(process.cwd(), "./public/productsImgs");

export const saveProductImage = (fileName, imageAsBuffer) =>
  writeFile(join(productsImagesPath, fileName), imageAsBuffer);

export const getProducts = () => readJSON(productsJSONPath);
export const writeProducts = (productsArray) =>
  writeJSON(productsJSONPath, productsArray);

export const getReviews = () => readJSON(reviewsJSONPath);
export const writeReviews = (reviewsArray) =>
  writeJSON(reviewsJSONPath, reviewsArray);
