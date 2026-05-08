import { query } from "../../config/database.js";

//CREATE
const createProduct = async (product) => {
  const sql = `INSERT INTO products(name,category,sku,threshold_quantity,priority_level) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const values = [
    product.name,
    product.category,
    product.sku,
    product.threshold_quantity,
    product.priority_level,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};
//GET ALL
const getAllProducts = async () => {
  const sql = `SELECT * FROM products`;
  const result = await query(sql);
  // console.log(result);

  return result.rows;
};
//GET ONE
const getProductById = async (id) => {
  const sql = `SELECT * FROM products WHERE id=$1`;
  const result = await query(sql, [id]);
  return result.rows[0];
};
//UPDATE
const updateProduct = async (id, product) => {
  const sql = `UPDATE products SET name=$1,category=$2,sku=$3,threshold_quantity=$4,priority_level=$5 WHERE id=$6 RETURNING *`;
  const values = [
    product.name,
    product.category,
    product.sku,
    product.threshold_quantity,
    product.priority_level,
    id,
  ];
  const result = await query(sql, values);
  console.log(result);

  return result.rows[0];
};
//DELETE
const deleteProduct = async (id) => {
  const sql = `DELETE FROM products WHERE id=$1 RETURNING *`;
  const result = await query(sql, [id]);
  console.log(result);
  return result.rows[0];
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
