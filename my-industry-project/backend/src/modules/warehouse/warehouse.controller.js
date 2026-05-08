import {
  createWareHouse,
  getAllWarehousesService,
  getWarehouseByIdService,
  updateWarehouseService,
  deleteWarehouseService,
} from "./warehouse.service.js";

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await createWareHouse(req.body);
    res.status(201).json({
      success: true,
      message: "Warehouse created Successfully",
      data: warehouse,
    });
    console.log(warehouse);
  } catch (error) {
    next(error);
  }
};
const getAllWarehouses = async (req, res, next) => {
  try {
    const warehouses = await getAllWarehousesService();
    res.status(201).json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    next(error);
  }
};

const getWarehousesById = async (req, res, next) => {
  try {
    const warehouse = await getWarehouseByIdService(req.params.id);
    res.json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await updateWarehouseService(req.params.id, req.body);
    res.json({
      success: true,
      message: "Warehouse updated Successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await deleteWarehouseService(req.params.id);
    res.json({
      success: true,
      message: "Warehouse deleted Successfully",
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};
export {
  createWarehouse,
  getAllWarehouses,
  getWarehousesById,
  updateWarehouse,
  deleteWarehouse,
};
