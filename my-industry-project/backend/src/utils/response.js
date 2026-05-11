const sendResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  error = null,
) => {
  const response = {
    success: statusCode < 400,
    message,
  };

  if (data) {
    response.data = data;
  }
  if (error) {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

export { sendResponse };
