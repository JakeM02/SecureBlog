const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = 'http://localhost:3000';

async function login(driver, username, password) {
  await driver.get(`${baseUrl}/login`);
  await driver.findElement(By.name('username')).sendKeys(username);
  await driver.findElement(By.name('password')).sendKeys(password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/dashboard'), 5000);
}

(async function adminBlogTest() {
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.manage().window().setRect({ width: 1280, height: 1024 });

  try {
    await login(driver, 'admin', 'admin');

    // Create Post
    await driver.get(`${baseUrl}/posts/create`);
    await driver.findElement(By.name('title')).sendKeys('Admin Test Post');
    await driver.findElement(By.name('content')).sendKeys('This is a post created by admin.');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 3000);

    const pageSource = await driver.getPageSource();
    assert(pageSource.includes('Admin Test Post'));
    console.log("PASSED - Admin post created and visible on dashboard");

    // Open the modal
    const postCard = await driver.findElement(By.xpath("//h5[contains(text(),'Admin Test Post')]/ancestor::div[contains(@class,'card')]"));
    await postCard.click();
    await delay(500); 

    // Wait for Edit button in modal and click it
    const editButton = await driver.wait(until.elementLocated(By.linkText('Edit')), 5000);
    await editButton.click();

    // On edit page
    const titleInput = await driver.findElement(By.name('title'));
    await titleInput.clear();
    await titleInput.sendKeys('Admin Updated Post');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await delay(1000);

    const updatedPage = await driver.getPageSource();
    assert(updatedPage.includes('Admin Updated Post'));
    console.log("PASSED - Admin post edited successfully");

    // Search Post
    await driver.get(`${baseUrl}/dashboard`);
    const searchInput = await driver.findElement(By.css('input[type="search"]'));
    await searchInput.clear();
    await searchInput.sendKeys('Updated');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await delay(1000);

    const searchPage = await driver.getPageSource();
    assert(searchPage.includes('Admin Updated Post'));
    console.log("PASSED - Search displays updated post");

    // Delete Post
  await driver.get(`${baseUrl}/dashboard`);
  const postCardToDelete = await driver.findElement(By.xpath("//h5[contains(text(),'Admin Updated Post')]/ancestor::div[contains(@class,'card')]"));
  await postCardToDelete.click();
  await delay(500);

  // Submit delete form inside modal
  const deleteForm = await driver.findElement(By.xpath("//h5[contains(text(),'Admin Updated Post')]/ancestor::div[@class='modal-content']//form[contains(@action, '/posts/delete')]"));
  await deleteForm.submit();
  await delay(1000);

  const afterDelete = await driver.getPageSource();
  assert(!afterDelete.includes('Admin Updated Post'));
  console.log("PASSED - Admin post deleted successfully");


  } catch (err) {
    console.error("Test failed:", err.message);
  } finally {
    await driver.quit();
  }
})();
