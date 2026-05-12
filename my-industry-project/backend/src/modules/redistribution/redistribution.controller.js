import redistributionService from "./redistribution.service.js";
import { sendResponse } from "../../utils/response.js";

const redistribution = async (req, res, next) => {
  try {
    const data = await redistributionService.redistribution();
    sendResponse(res, 200, "Redistribution executed successfully", data);
  } catch (error) {
    next(error);
  }
};

export default { redistribution };
