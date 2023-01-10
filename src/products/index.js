import express, { request } from "express";
import {
  getProducts,
  getReviews,
  writeProducts,
  writeReviews,
} from "../lib/fs-tools.js";
import {
  checksProductSchema,
  checksReviewSchema,
  triggerBadRequest,
  triggerReviewBadRequest,
} from "./validators.js";
import uniqid from "uniqid";
import httpErrors from "http-errors";

const productsRouter = express.Router();

const { NotFound } = httpErrors;

const getProductsWithReviews = async () => {
  const productsArray = await getProducts();
  const reviews = await getReviews();
  const productsWithReviews = productsArray.map((product) => {
    const targetReview = reviews.filter(
      (review) => review.productId === product.id
    );
    if (targetReview) {
      product.reviews = targetReview;
    }
    return product;
  });
  return productsWithReviews;
};

const getProductWithReviews = async (id) => {
  const productsArray = await getProducts();
  const searchedProduct = productsArray.find((product) => product.id === id);
  const reviews = await getReviews();
  const targetReview = reviews.filter((review) => review.productId === id);
  if (targetReview) {
    searchedProduct.reviews = targetReview;
  }
  return searchedProduct;
};

//..................................CRUD OPERATIONS..................................

// 1. CREATE a new product
productsRouter.post(
  "/",
  checksProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productsArray = await getProducts();
      const newProduct = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      productsArray.push(newProduct);
      await writeProducts(productsArray);
      res.status(201).send(`Product with id ${newProduct.id} was created`);
    } catch (error) {
      console.log(error);
    }
  }
);

// 2. GET all products
productsRouter.get("/", async (req, res, next) => {
  try {
    const query = req.query.category;
    console.log(query);
    const productsArray = await getProductsWithReviews();
    if (!query) {
      res.send(productsArray);
    } else {
      const searchedProducts = productsArray.filter(
        (product) => product.category === query
      );
      res.send(searchedProducts);
    }
  } catch (error) {
    console.log(error);
  }
});

// 3. GET product by ID
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const searchedProduct = await getProductWithReviews(productID);

    if (searchedProduct) {
      res.send(searchedProduct);
    } else {
      next(NotFound(`Product with ID ${productID} was not found`));
    }
  } catch (error) {
    console.log(error);
  }
});

// 4. EDIT a product based on the id
productsRouter.put(
  "/:id",
  checksProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productID = req.params.id;
      const productsArray = await getProducts();
      const oldProductIndex = productsArray.findIndex(
        (product) => product.id === productID
      );
      if (oldProductIndex !== -1) {
        const oldProduct = productsArray[oldProductIndex];
        const updatedProduct = {
          ...oldProduct,
          ...req.body,
          updatedAt: new Date(),
        };
        productsArray[oldProductIndex] = updatedProduct;
        await writeProducts(productsArray);
        res.send(updatedProduct);
      } else {
        next(NotFound(`Product with id ${productID} could not be found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// 5.DELETE a product based on the id
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const productsArray = await getProducts();
    const filteredArray = productsArray.filter(
      (product) => product.id !== productID
    );
    if (filteredArray.length !== productsArray.length) {
      await writeProducts(filteredArray);
      res.status(204).send();
    } else {
      next(NotFound(`Product with id ${productID} could not be found`));
    }
  } catch (error) {
    console.log(error);
  }
});

// 6. ADD product REVIEWS
productsRouter.post(
  "/:id/reviews",
  checksReviewSchema,
  triggerReviewBadRequest,
  async (req, res, next) => {
    try {
      const reviewsArray = await getReviews();
      if (req.body.productId === req.params.id) {
        const newReview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        };
        reviewsArray.push(newReview);
        await writeReviews(reviewsArray);
        res
          .status(201)
          .send(`Review with id ${newReview._id} was created successfully`);
      } else {
        next(NotFound(`Product with id ${req.body.productId} was not found`));
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// 7. GET all reviews of a product
productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const productID = req.params.id;
    const reviewsArray = await getReviews();
    const targetReviews = reviewsArray.filter(
      (review) => review.productId === productID
    );
    res.send(targetReviews);
  } catch (error) {
    console.log(error);
  }
});

// 8. GET a specific review for a product
productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productID = req.params.productId;
    const reviewID = req.params.reviewId;
    const reviewsArray = await getReviews();
    const targetReview = reviewsArray
      .filter((review) => review.productId === productID)
      .find((review) => review._id === reviewID);
    if (targetReview) {
      res.send(targetReview);
    } else {
      next(
        NotFound(
          `Request could not be performed because of incorrect reviewId or productId`
        )
      );
    }
  } catch (error) {
    console.log(error);
  }
});

// 9. UPDATE a specific review for a product
productsRouter.put(
  "/:productId/reviews/:reviewId",
  checksReviewSchema,
  triggerReviewBadRequest,
  async (req, res, next) => {
    try {
      const productID = req.params.productId;
      const reviewID = req.params.reviewId;
      const reviewsArray = await getReviews();
      const indexOfTargetReview = reviewsArray
        .filter((review) => review.productId === productID)
        .findIndex((review) => review._id === reviewID);
      if (indexOfTargetReview !== -1) {
        const targetReview = reviewsArray[indexOfTargetReview];
        const updatedTargetReview = {
          ...targetReview,
          ...req.body,
          updatedAt: new Date(),
        };
        reviewsArray[indexOfTargetReview] = updatedTargetReview;
        await writeReviews(reviewsArray);
        res.send(updatedTargetReview);
      } else {
        next(
          NotFound(
            `Request could not be performed because of incorrect reviewId or productId`
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// 10. DELETE a specific review for a product
productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async function (req, res, next) {
    try {
      const productID = req.params.productId;
      const reviewID = req.params.reviewId;
      const reviewsArray = await getReviews();
      const filteredReviewsArray = reviewsArray
        .filter((review) => review.productId === productID)
        .filter((review) => review._id !== reviewID);
      if (
        filteredReviewsArray.length !==
        reviewsArray.filter((review) => review.productId === productID).length
      ) {
        await writeReviews(filteredReviewsArray);
        res.status(204).send();
      } else {
        next(
          NotFound(
            `Request could not be performed because of incorrect reviewId or productId`
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export default productsRouter;
