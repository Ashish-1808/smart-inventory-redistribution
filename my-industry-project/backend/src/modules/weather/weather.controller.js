import weatherService from "./weather.service.js";
import { sendResponse } from "../../utils/response.js";

const getForecast = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;
    const data = await weatherService.getForecast(warehouseId);
    sendResponse(res, 200, "Forecast fetch successfully", data);
  } catch (error) {
    next(error);
  }
};

export default { getForecast };
