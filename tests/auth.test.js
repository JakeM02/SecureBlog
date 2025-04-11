const { Builder, By, until } = require("selenium-webdriver");

(async function authTests() {
  const driver = await new Builder().forBrowser("chrome").build();

  // Set base URL
  const baseUrl = "http://localhost:3000";

  // Unique test user
  const testUser = {
    username: "testuser" + Date.now(),
    password: "test"
  };

  // Register new user
  try {
    await driver.get(`${baseUrl}/register`);

    await driver.findElement(By.name("username")).sendKeys(testUser.username);
    await driver.findElement(By.name("password")).sendKeys(testUser.password);
    await driver.findElement(By.css("button[type='submit']")).click();

    await driver.wait(until.urlContains("/login"), 5000);
    console.log("PASSED - Registration successful and redirected to login");
  } catch (err) {
    console.error("FAILED - Registration failed:", err.message);
  }

  // Login with valid credentials
  try {
    await driver.get(`${baseUrl}/login`);

    await driver.findElement(By.name("username")).sendKeys(testUser.username);
    await driver.findElement(By.name("password")).sendKeys(testUser.password);
    await driver.findElement(By.css("button[type='submit']")).click();

    await driver.wait(until.urlContains("/dashboard"), 5000);
    console.log("PASSED - Login with valid credentials successful");
  } catch (err) {
    console.error("FAILED - Valid login failed:", err.message);
  }

  // Login with invalid credentials
  try {
    await driver.get(`${baseUrl}/login`);

    await driver.findElement(By.name("username")).sendKeys("fakeuser");
    await driver.findElement(By.name("password")).sendKeys("wrongpass");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Wait for error message or same login URL
    await driver.sleep(1000);
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (bodyText.includes("Invalid") || bodyText.includes("incorrect")) {
      console.log("PASSED - Invalid login shows error message");
    } else {
      throw new Error("FAILED - Error message not found");
    }
  } catch (err) {
    console.error("FAILED - Invalid login test failed:", err.message);
  }

  await driver.quit();
})();
