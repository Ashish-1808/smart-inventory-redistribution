import { param, validationResult } from "express-validator";

//validate warehouseId Param
const validateWarehouseId = [
  param("warehouseId")
    // .matches(/^[0-9a-fA-F-]{36}$/)
    .isUUID()
    .withMessage("Invalid Warehouse ID format"),

  (req, res, next) => {
    console.log("warehouseId: ", req.params.warehouseId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("VALIDATION ERROR:", errors.array());
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }
    next();
  },
];

export { validateWarehouseId };
