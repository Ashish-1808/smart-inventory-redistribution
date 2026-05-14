import { query, pool } from "../../config/database.js";

const findInventory = async () => {
  const sql = `SELECT * FROM inventory ORDER BY warehouse_id`;
  const { rows } = await query(sql);
  return rows;
};
const findInventoryByWarehouse = async (warehouseId) => {
  const sql = `SELECT * FROM inventory WHERE warehouse_id=$1`;
  const { rows } = await query(sql, [warehouseId]);
  return rows;
};
const findInventoryRecord = async (warehouseId, productId) => {
  const sql = `SELECT * FROM inventory WHERE warehouse_id=$1 AND product_id=$2`;
  const { rows } = await query(sql, [warehouseId, productId]);
  return rows[0];
};

const createInventory = async (
  warehouseId,
  productId,
  quantity,
  client = null,
) => {
  const executor = client || pool;
  const sql = `INSERT INTO inventory(warehouse_id,product_id,quantity) VALUES($1,$2,$3) RETURNING *`;
  const { rows } = await executor.query(sql, [
    warehouseId,
    productId,
    quantity,
  ]);

  return rows;
};

const updateInventory = async (
  warehouseId,
  productId,
  quantity,
  client = null,
) => {
  const sql = `UPDATE inventory 
    SET quantity=$3,last_updated=CURRENT_TIMESTAMP
    WHERE warehouse_id=$1 and product_id=$2
    RETURNING *`;

  const executor = client || pool;

  const { rows } = await executor.query(sql, [
    warehouseId,
    productId,
    quantity,
  ]);

  return rows[0];
};

const findLowStock = async () => {
  const sql = `SELECT i.id,i.warehouse_id,i.product_id,i.quantity,i.min_threshold,w.name as "warehouse_name",p.name as "product_name" FROM inventory i JOIN warehouses w on i.warehouse_id=w.id JOIN products p on i.product_id=p.id where i.quantity<i.min_threshold ORDER BY i.quantity `;

  const { rows } = await query(sql);

  return rows;
};

export default {
  findInventory,
  findInventoryByWarehouse,
  findInventoryRecord,
  createInventory,
  updateInventory,
  findLowStock,
};
