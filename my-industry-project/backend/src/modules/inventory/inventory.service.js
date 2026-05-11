import inventoryRepo from "./inventory.repository.js";
import { pool } from "../../config/database.js";

const addStock = async ({ warehouse_id, product_id, quantity }) => {
  const record = await inventoryRepo.findInventoryRecord(
    warehouse_id,
    product_id,
  );

  if (!record)
    return await inventoryRepo.createInventory(
      warehouse_id,
      product_id,
      quantity,
    );

  const newQty = record.quantity + quantity;
  return await inventoryRepo.updateInventory(warehouse_id, product_id, newQty);
};

const removeStock = async ({ warehouse_id, product_id, quantity }) => {
  const record = await inventoryRepo.findInventoryRecord(
    warehouse_id,
    product_id,
  );

  //check if record is exist or not
  if (!record) throw new Error("Inventory not found");

  //check for insufficient stock
  if (record.quantity < quantity) throw new Error("Insufficient stock");

  // console.log("old Quantity: ", record.quantity);

  //update the quantity
  const newQty = record.quantity - quantity;
  // console.log("new quantity : ", newQty);

  return await inventoryRepo.updateInventory(warehouse_id, product_id, newQty);
};

const transferStock = async ({
  source_warehouse_id,
  destination_warehouse_id,
  product_id,
  quantity,
}) => {
  // console.log(
  //   source_warehouse_id,
  //   destination_warehouse_id,
  //   product_id,
  //   quantity,
  // );

  //here transaction is important
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const source = await inventoryRepo.findInventoryRecord(
      source_warehouse_id,
      product_id,
    );

    if (!source || source.quantity < quantity) {
      throw new Error("Insufficient stock in stock warehouse");
    }

    //Decrease Source
    await inventoryRepo.updateInventory(
      source_warehouse_id,
      product_id,
      source.quantity - quantity,
      client,
    );

    //Increase Destination
    const dest = await inventoryRepo.findInventoryRecord(
      destination_warehouse_id,
      product_id,
    );
    if (!dest) {
      await inventoryRepo.createInventory(
        destination_warehouse_id,
        product_id,
        quantity,
      );
    } else {
      await inventoryRepo.updateInventory(
        destination_warehouse_id,
        product_id,
        dest.quantity + quantity,
        client,
      );
    }
    await client.query("COMMIT");
    return { message: "Stock transferred successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getInventory = async () => {
  return await inventoryRepo.findInventory();
};

const getInventoryByWarehouse = async (warehouseId) => {
  return await inventoryRepo.findInventoryByWarehouse(warehouseId);
};

const getLowStock = async () => {
  const data = await inventoryRepo.findLowStock();
  return data.map((item) => ({
    ...item,
    status: "LOW",
    shortage: item.min_threshold - item.quantity,
  }));
};

export default {
  addStock,
  removeStock,
  transferStock,
  getInventory,
  getInventoryByWarehouse,
  getLowStock,
};
