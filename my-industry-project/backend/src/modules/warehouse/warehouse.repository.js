import { query } from "../../config/database.js";
const createWareHouse = async (data) => {
  const sql = `INSERT INTO warehouses(name,city,state,latitude,longitude,capacity) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [
    data.name,
    data.city,
    data.state,
    data.latitude,
    data.longitude,
    data.capacity,
  ];
  const result = await query(sql, values);
  console.log(result.rows);

  return result.rows[0];
};

const getAllWarehousesRepo = async () => {
  // const sql = `SELECT * FROM warehouses(name,city,state,latitude,longitude,capacity) ORDER BY created_at DESC`;
  const sql = `SELECT * FROM warehouses ORDER BY created_at DESC`;
  const result = await query(sql);
  // console.log(result.rows);

  return result.rows;
};

const getWarehouseByIdRepo = async (id) => {
  const sql = `SELECT * FROM warehouses where id=$1`;
  const result = await query(sql, [id]);
  return result.rows[0];
};

const updateWarehouseRepo = async (id, data) => {
  const sql = `UPDATE warehouses SET name=$1,city=$2,state=$3,latitude=$4,longitude=$5,capacity=$6 WHERE id=$7 RETURNING *`;
  const values = [
    data.name,
    data.city,
    data.state,
    data.latitude,
    data.longitude,
    data.capacity,
    id,
  ];
  const result = await query(sql, values);

  return result.rows[0];
};
const deleteWarehouseRepo = async (id) => {
  const sql = `DELETE FROM warehouses WHERE id=$1 RETURNING *`;
  const result = await query(sql, [id]);
  return result.rows[0];
};
export {
  createWareHouse,
  getAllWarehousesRepo,
  getWarehouseByIdRepo,
  updateWarehouseRepo,
  deleteWarehouseRepo,
};
