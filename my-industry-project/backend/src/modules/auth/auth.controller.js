import AuthService from "./auth.service.js";

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const result = await AuthService.login({ email, password });

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// SIGNUP
const signup = async (req, res) => {
  const { firstName, lastName, email, mobileNo, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !mobileNo || !password) {
    return res.status(400).json({
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

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // Unique constraint (Postgres error code)
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email or Mobile number already exists",
      });
    }

    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default {
  login,
  signup,
};
