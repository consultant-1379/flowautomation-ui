package com.ericsson.flowautomationui.pagemodel.page

import com.ericsson.cifwk.taf.utils.FileFinder
import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class BasePage extends BaseFragment {

    @FindBy(className = "elLayouts-TopSection-title")
    WebElement topSectionTitle

    void selectFile(WebDriver driver, final String fileName) {
        System.properties.'taf.skip.archives' = true   //Needed to use taf FileFinder utility
        final String pathToFile = FileFinder.findFile(fileName, "resources").get(0)
        println "Path to file " + pathToFile
        final File file = new File(pathToFile)
        final WebElement element = driver.findElement(By.cssSelector("[type=file]"))
        element.sendKeys(file.getAbsolutePath())
    }

    def isTopsectionVisible() {
        waitVisible(topSectionTitle)
    }

    boolean verifyTopSectionTitle(final String title) {
        getText(topSectionTitle).contains(title)
        return true
    }
}