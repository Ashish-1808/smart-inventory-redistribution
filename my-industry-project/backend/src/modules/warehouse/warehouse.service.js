import {
  createWareHouse as createWareHouseRepo,
  getAllWarehousesRepo,
  updateWarehouseRepo,
  deleteWarehouseRepo,
  getWarehouseByIdRepo,
} from "./warehouse.repository.js";

const createWareHouse = async (data) => {
  const warehouse = await createWareHouseRepo(data);
  return warehouse;
};

const getAllWarehousesService = async () => {
  const warehouses = await getAllWarehousesRepo();
  return warehouses;
};

const getWarehouseByIdService = async (id) => {
  const warehouse = await getWarehouseByIdRepo(id);
  if (!warehouse) throw new Error("Warehouse not found");
  return warehouse;
};

const updateWarehouseService = async (id, data) => {
  const warehouse = await updateWarehouseRepo(id, data);
  if (!warehouse) throw new Error("Warehouse not found");
  return warehouse;
};

const deleteWarehouseService = async (id) => {
  const warehouse = await deleteWarehouseRepo(id);
  if (!warehouse) throw new Error("Warehouse not found");
  return warehouse;
};
export {
  createWareHouse,
  getAllWarehousesService,
  getWarehouseByIdService,
  updateWarehouseService,
  deleteWarehouseService,
};
