const validateAddRemove = (req, res, next) => {
  const { warehouse_id, product_id, quantity } = req.body;
  if (!warehouse_id || !product_id || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (quantity < 0) {
    return res.status(400).json({ message: "Quantity must be positive" });
  }
  next();
};

const validateTransfer = (req, res, next) => {
  const {
    source_warehouse_id,
    destination_warehouse_id,
    product_id,
    quantity,
  } = req.body;
  if (
    !source_warehouse_id ||
    !destination_warehouse_id ||
    !product_id ||
    !quantity
  ) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be positive" });
  }

  if (source_warehouse_id === destination_warehouse_id) {
    return res
      .status(400)
      .json({ message: "Source and destination can't be same" });
  }
  next();
};

export { validateAddRemove, validateTransfer };
