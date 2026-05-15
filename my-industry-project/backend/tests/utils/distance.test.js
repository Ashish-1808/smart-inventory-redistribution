import calculateDistance from "../../src/utils/distance.js";

describe("calculateDistance Utility", () => {
  //same co-ordinates
  test("should return 0 for same coordinates", () => {
    const result = calculateDistance(18.5204, 73.8567, 18.5204, 73.8567);

    expect(result).toBeCloseTo(0, 5);
  });

  ///Known distance
  test("should calculate correct distance between Pune and Mumbai", () => {
    const pune = { lat: 18.5204, lon: 73.8567 };
    const mumbai = { lat: 19.076, lon: 72.8777 };

    const result = calculateDistance(
      pune.lat,
      pune.lon,
      mumbai.lat,
      mumbai.lon,
    );

    // Approx distance ~ 150 km
    expect(result).toBeGreaterThan(100);
    expect(result).toBeLessThan(140);
  });

  //Different Locations

  test("should return positive distance for different points", () => {
    const result = calculateDistance(0, 0, 10, 10);

    expect(result).toBeGreaterThan(0);
  });

  //  Opposite Coordinates (Max distance)
  test("should calculate large distance for opposite points", () => {
    const result = calculateDistance(0, 0, -0, 180);

    // Half of earth circumference ≈ 20000 km
    expect(result).toBeGreaterThan(19000);
  });
});
