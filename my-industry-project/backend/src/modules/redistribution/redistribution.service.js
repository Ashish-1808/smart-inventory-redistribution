import redistributionRepo from "./redistribution.repository.js";
import calculateDistance from "../../utils/distance.js";
import inventoryService from "../inventory/inventory.service.js";
import logger from "../../utils/logger.js";

//weights
const WEIGHTS = {
  demand: 0.4,
  priority: 0.2,
  distance: 0.2,
  stock: 0.2,
};

const redistribution = async () => {
  const lowStockItems = await redistributionRepo.getLowStockItems();

  //log after low stock detection
  logger.info({
    type: "LOW_STOCK_DETECTED",
    count: lowStockItems.length,
  });

  const decisions = [];

  for (const item of lowStockItems) {
    const { warehouse_id, product_id, quantity, min_threshold } = item;
    const shortage = min_threshold - quantity;

    //check for the product and warehouse demand forecast
    const forecast = await redistributionRepo.getForecast(
      warehouse_id,
      product_id,
    );

    if (!forecast) continue;

    const product = await redistributionRepo.getProduct(product_id); //to fetch the product related information
    const destinationWarehouse =
      await redistributionRepo.getWarehouse(warehouse_id); //require to fetch the location

    //find the high stock warehouse
    const sources = await redistributionRepo.getHighStockWarehouses(product_id);

    //calculate the distance for redistribution
    let bestSource = -Infinity;
    let bestScore = null;

    //fetch the source warehouse and choose best among them
    for (const src of sources) {
      if (src.warehouse_id === warehouse_id) continue;

      const sourceWarehouse = await redistributionRepo.getWarehouse(
        src.warehouse_id,
      );

      //calculate the distance between source and destination warehouses
      const distance = calculateDistance(
        destinationWarehouse.latitude,
        destinationWarehouse.longitude,
        sourceWarehouse.latitude,
        sourceWarehouse.longitude,
      );

      const availableStock = src.quantity;

      //calculate score of warehouse
      const score =
        WEIGHTS.demand * forecast.predicted_demand +
        WEIGHTS.priority * product.priority_level -
        WEIGHTS.distance * distance +
        WEIGHTS.stock * availableStock;

      logger.info({
        type: "REDISTRIBUTION DECISION",
        product_id,
        destination: warehouse_id,
        shortage,
        predicted_demand: forecast.predicted_demand,
      });

      if (score > bestScore) {
        bestScore = score;
        bestSource = src;
      }

      logger.info({
        type: "SOURCE_SELECTED",
        product_id,
        source: bestSource.warehouse_id,
        score: bestScore,
      });
    }

    if (bestSource) {
      const sourceName = await redistributionRepo.getWarehouse(
        bestSource.warehouse_id,
      );

      const transferQty = Math.min(shortage, bestSource.quantity);

      let status = "PENDING";

      //stock transfer from source to destination warehouse
      try {
        logger.info({
          type: "TRANSFER_INITIATED",
          product_id,
          from: bestSource.warehouse_id,
          to: warehouse_id,
          quantity: transferQty,
        });

        await inventoryService.transferStock({
          source_warehouse_id: bestSource.warehouse_id,
          destination_warehouse_id: warehouse_id,
          product_id,
          quantity: transferQty,
        });
        status = "TRANSFER_EXECUTED";

        logger.info({
          type: "TRANSFER_SUCCESS",
          product_id,
          from: bestSource.warehouse_id,
          to: warehouse_id,
          quantity: transferQty,
        });
      } catch (err) {
        status = "TRANSFER_FAILED";
        logger.info({
          type: "TRANSFER_FAILED",
          error: err.message,
        });
      }

      //Log the operation
      await redistributionRepo.saveRedistributionLogs(
        product_id,
        bestSource.warehouse_id,
        warehouse_id,
        transferQty,
        bestScore.toFixed(2),
        status,
      );

      decisions.push({
        product_id,
        product_name: product.name,

        from: bestSource.warehouse_id,
        from_name: sourceName.name,

        to: warehouse_id,
        to_name: destinationWarehouse.name,

        transfer_quantity: transferQty,
        score: bestScore.toFixed(2),

        status,
      });
    }
  }
  return decisions;
};

export default { redistribution };
