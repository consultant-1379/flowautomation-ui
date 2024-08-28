package com.ericsson.flowautomationui.spec

import org.apache.commons.io.FileUtils
import org.jboss.arquillian.drone.api.annotation.Drone
import org.jboss.arquillian.test.api.ArquillianResource
import org.openqa.selenium.Dimension
import org.openqa.selenium.JavascriptExecutor
import org.openqa.selenium.OutputType
import org.openqa.selenium.Point
import org.openqa.selenium.TakesScreenshot
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.ByIdOrName
import spock.lang.Specification

class BaseSpecification extends Specification {

    @Drone
    WebDriver driver

    @ArquillianResource
    private URL url

    def takeScreenshot(String name) {
        File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE)
        FileUtils.copyFile(screenshotFile, new File("./target/screenshots/" + name + ".png"))
    }

    def openFlowAutomationUrl() {
        if (driver != null && !driver.getCurrentUrl().contains("flow-automation")) {
            driver.get(url.toString())
            def window = driver.manage().window()
            window.setPosition(new Point(0, 0))
            window.setSize(new Dimension(1366, 768))
        } else {
            driver.quit()
        }
    }

    def openFlowCatalogUrl() {
        openFlowAutomationUrl()
        redirectToFlowCatalogUrl()
    }

    def redirectToFlowCatalogUrl() {
        driver.get(url.toString() + "#flow-automation/flowcatalog")
    }

    def scrollToElement(WebElement element) {
        Actions actions = new Actions(driver)
        actions.moveToElement(element)
        actions.perform()
        return true
    }

    def scrollEnd() {
        WebElement scroll = driver.findElement(ByIdOrName.id("utFormContent"))
        def size = scroll.getCssValue("max-height").replaceAll("px","")

        def command = new StringBuffer().append("document.getElementById('utFormContent').scrollTop +=").append(10000).toString()
        JavascriptExecutor jsExec = (JavascriptExecutor) driver
        jsExec.executeScript(command)

        return true
    }

    def scrollPage(WebElement element, int scrollPoints) {
        try {
            Actions actions = new Actions(driver)
            int numberOfPixelsToDragTheScrollbarDown = 10
            for (int i = 10; i < scrollPoints; i = i + numberOfPixelsToDragTheScrollbarDown) {
                actions.moveToElement(element).clickAndHold().moveByOffset(0, numberOfPixelsToDragTheScrollbarDown).release(element).build().perform()
            }
            Thread.sleep(500)
            return true
        }
        catch (Exception e) {
            e.printStackTrace()
            return false
        }
    }
}