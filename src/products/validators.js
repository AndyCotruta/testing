import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const productSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Name of the product is required and must be a string",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage:
        "Description of the product is required and must be a string",
    },
  },
  brand: {
    in: ["body"],
    isString: {
      errorMessage: "Brand of the product is required and must be a string",
    },
  },
  price: {
    in: ["body"],
    isInt: {
      errorMessage: "Price of the product is required and must be a number",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category of the product is required and must be a string",
    },
  },
};

const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment text is required and must be a string",
    },
  },
  rate: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Rate is required and must be a number between 0 and 5",
      options: {
        min: 0,
        max: 5,
      },
    },
  },
  productId: {
    in: ["body"],
    isString: {
      errorMessage: "Product ID is required and must be a string",
    },
  },
};

export const checksProductSchema = checkSchema(productSchema);
export const checksReviewSchema = checkSchema(reviewSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      createHttpError(
        400,
        "Some error occurred when trying to validate the product",
        {
          errorsList: errors.array(),
        }
      )
    );
  } else {
    next();
  }
};

export const triggerReviewBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      createHttpError(
        400,
        "Some error occurred when trying to validate the review",
        { errorsList: errors.array() }
      )
    );
  } else {
    next();
  }
};
