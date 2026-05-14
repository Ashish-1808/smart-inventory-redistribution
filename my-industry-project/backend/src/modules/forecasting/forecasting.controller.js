import forecastService from "./forecasting.service.js";
import { sendResponse } from "../../utils/response.js";

const generateForecast = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;
    const data = await forecastService.generateForecast(warehouseId);
    // console.log(data);
    sendResponse(res, 200, "Forecast Generated Successfully", data);
  } catch (error) {
    sendResponse(res, 404, "Error", null, error.message);
    next(error);
  }
};

export default { generateForecast };
