const validateCreateWarehouse = (req, res, next) => {
  const { name, city, state, latitude, longitude, capacity } = req.body;
  if (!name || !city || !state)
    res.status(400).json({
      success: false,
      message: "Name,city,States are required",
    });
  if (!latitude || !longitude)
    res.status(400).json({
      success: false,
      message: "Longitude,Latitude are required",
    });
  if (!capacity)
    res.status(400).json({
      success: false,
      message: "Capacity is required",
    });
  next();
};

export { validateCreateWarehouse };
