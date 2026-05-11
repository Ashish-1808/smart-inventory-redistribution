import inventoryService from "./inventory.service.js";
import { sendResponse } from "../../utils/response.js";
const addStock = async (req, res, next) => {
  try {
    const data = await inventoryService.addStock(req.body);
    sendResponse(res, 201, "Stock added Successfully", data);
  } catch (error) {
    next(error);
  }
};
const removeStock = async (req, res, next) => {
  try {
    const data = await inventoryService.removeStock(req.body);
    sendResponse(res, 200, "Stock removed Successfully", data);
  } catch (error) {
    next(error);
  }
};
const transferStock = async (req, res, next) => {
  try {
    const data = await inventoryService.transferStock(req.body);
    sendResponse(res, 200, data.message);
  } catch (error) {
    next(error);
  }
};
const getInventory = async (req, res, next) => {
  try {
    const data = await inventoryService.getInventory();
    sendResponse(res, 200, "Inventory Fetched", data);
  } catch (error) {
    next(error);
  }
};
const getInventoryByWarehouse = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;

    if (!isUUID(warehouseId)) {
      return res.status(400).json({
        success: "false",
        message: "Invalid Warehouse ID.Must be UUID.",
      });
    }
    const data = await inventoryService.getInventoryByWarehouse(warehouseId);

    sendResponse(res, 200, "Warehouse Inventory fetched", data);
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const data = await inventoryService.getLowStock();
    sendResponse(res, 200, "Low Stock items fetched", data);
  } catch (error) {
    next(error);
  }
};

export default {
  addStock,
  removeStock,
  transferStock,
  getInventory,
  getInventoryByWarehouse,
  getLowStock,
};
