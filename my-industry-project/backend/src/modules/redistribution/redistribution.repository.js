import { pool, query } from "../../config/database.js";

const getLowStockItems = async () => {
  const { rows } = await query(
    `SELECT * FROM inventory WHERE quantity<min_threshold`,
  );
  return rows;
};

const getHighStockWarehouses = async (productId) => {
  const { rows } = await query(
    `SELECT * FROM inventory  WHERE product_id=$1 AND quantity>min_threshold`,
    [productId],
  );
  return rows;
};

const getForecast = async (warehouseId, productId) => {
  const { rows } = await query(
    `SELECT * FROM demand_forecast WHERE warehouse_id=$1 AND product_id=$2`,
    [warehouseId, productId],
  );
  return rows[0];
};

const getProduct = async (productId) => {
  const { rows } = await query(`SELECT * FROM products WHERE id=$1`, [
    productId,
  ]);
  return rows[0];
};

const getWarehouse = async (warehouseId) => {
  const { rows } = await query(`SELECT * FROM warehouses WHERE id=$1`, [
    warehouseId,
  ]);
  return rows[0];
};

const saveRedistributionLogs = async (
  productId,
  sourceWarehouseId,
  destinationWarehouseId,
  quantity,
  score,
  status,
) => {
  const sql = `INSERT INTO redistribution_logs(product_id,source_warehouse_id,destination_warehouse_id,transferred_quantity,score,status) VALUES ($1,$2,$3,$4,$5,$6)`;
  await pool.query(sql, [
    productId,
    sourceWarehouseId,
    destinationWarehouseId,
    quantity,
    score,
    status,
  ]);
};
export default {
  getLowStockItems,
  getHighStockWarehouses,
  getForecast,
  getProduct,
  getWarehouse,
  saveRedistributionLogs,
};
