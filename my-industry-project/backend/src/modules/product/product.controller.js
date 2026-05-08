import ProductService from "./product.service.js";

const createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
const updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Updated Successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: "Deleted Successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
