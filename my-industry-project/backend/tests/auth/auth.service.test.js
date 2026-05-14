import { jest } from "@jest/globals";

// ✅ MOCK DEPENDENCIES
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/config/database.js", () => ({
  query: jest.fn(),
}));

// IMPORT AFTER MOCK
const bcrypt = (await import("bcryptjs")).default;
const jwt = (await import("jsonwebtoken")).default;
const { query } = await import("../../src/config/database.js");

const AuthService = (await import("../../src/modules/auth/auth.service.js"))
  .default;

describe("Auth Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // LOGIN TESTS

  describe("login", () => {
    it("should return token and user on valid credentials", async () => {
      query.mockResolvedValue({
        rows: [{ id: "1", email: "test@test.com", password: "hashed" }],
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      const result = await AuthService.login({
        email: "test@test.com",
        password: "123",
      });

      expect(result).toEqual({
        token: "mockToken",
        user: { id: "1", email: "test@test.com" },
      });

      expect(query).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith("123", "hashed");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should return null if user not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const result = await AuthService.login({
        email: "test@test.com",
        password: "123",
      });

      expect(result).toBeNull();
    });

    it("should return null if password is invalid", async () => {
      query.mockResolvedValue({
        rows: [{ id: "1", email: "test@test.com", password: "hashed" }],
      });

      bcrypt.compare.mockResolvedValue(false);

      const result = await AuthService.login({
        email: "test@test.com",
        password: "wrong",
      });

      expect(result).toBeNull();
    });
  });

  // SIGNUP TESTS

  describe("signup", () => {
    it("should create user successfully", async () => {
      bcrypt.hash.mockResolvedValue("hashedPassword");

      query.mockResolvedValue({
        rows: [
          {
            id: "1",
            first_name: "Ashish",
            last_name: "Walke",
            email: "test@test.com",
            mobile_no: "1234567890",
          },
        ],
      });

      const result = await AuthService.signup({
        firstName: "Ashish",
        lastName: "Walke",
        email: "test@test.com",
        mobileNo: "1234567890",
        password: "123",
      });

      expect(result).toEqual({
        id: "1",
        first_name: "Ashish",
        last_name: "Walke",
        email: "test@test.com",
        mobile_no: "1234567890",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
      expect(query).toHaveBeenCalled();
    });

    it("should throw error if DB fails", async () => {
      bcrypt.hash.mockResolvedValue("hashedPassword");
      query.mockRejectedValue(new Error("DB Error"));

      await expect(
        AuthService.signup({
          firstName: "Ashish",
          lastName: "Walke",
          email: "test@test.com",
          mobileNo: "123",
          password: "123",
        }),
      ).rejects.toThrow("DB Error");
    });
  });
});
``;
