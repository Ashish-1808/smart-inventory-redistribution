import ProductRepo from "./product.repository.js";

const createProduct = async (data) => {
  return await ProductRepo.createProduct(data);
};

const getAllProducts = async () => {
  return await ProductRepo.getAllProducts();
};
const getProductById = async (id) => {
  return await ProductRepo.getProductById(id);
};
const updateProduct = async (id, data) => {
  return await ProductRepo.updateProduct(id, data);
};
const deleteProduct = async (id) => {
  return await ProductRepo.deleteProduct(id);
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
