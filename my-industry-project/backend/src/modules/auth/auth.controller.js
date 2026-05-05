const AuthService = require("./auth.service");
// import isJSON from "../../../node_modules/validator/es/lib/isJSON";

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "username and password is required",
    });
  }

  const result = await AuthService.login({ email, password });
  if (!result) {
    return res.status(401).json({
      message: "Invalid Username or Password",
    });
  }
  return res.status(200).json({
    message: "Login Successful",
    token: result.token,
    user: result.user,
  });
};

exports.signup = async (req, res) => {
  const { firstName, lastName, email, mobileNo, password } = req.body;
  //Basic server side validation
  if (!firstName || !lastName || !email || !mobileNo || !password) {
    res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const user = await AuthService.signup({
      firstName,
      lastName,
      email,
      mobileNo,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    //unique constraint error(email or mobile)
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email or Mobile number already exists",
      });
    }

    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
