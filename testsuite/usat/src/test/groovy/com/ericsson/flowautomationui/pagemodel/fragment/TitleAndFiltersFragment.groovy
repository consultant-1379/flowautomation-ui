/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2017
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/
package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.FindBy

class TitleAndFiltersFragment extends BaseFragment {

    @FindBy(className = "eaFlowCatalog-rMain-titleAndFilters-title-selected-count")
    private WebElement selectedCount

    @FindBy(className = "eaFlowCatalog-rMain-titleAndFilters-title-selected-clearSelection-link")
    private WebElement clearSelection

    @FindBy(className = "eaFlowCatalog-wTopPanel-Sections-filterByName")
    private WebElement filterTextBox

    @FindBy(className = "eaFlowAutomationLib-tableSettingsButton-icon")
    private WebElement tableSettingsIcon

    boolean isSelectedCountCorrect(String amountThatShouldBeSelected) {
        return amountThatShouldBeSelected == waitVisible(selectedCount).getAttribute("innerText")
    }

    def clearSelection() {
        click(clearSelection)
    }

    boolean isSelectedCountCleared(WebDriver driver) {
        List<WebElement> hiddenSelectedCount = findElements(driver, "eaFlowCatalog-rMain-titleAndFilters-title-selected_hidden")
        return hiddenSelectedCount.size() > 0
    }

    def applyTableSettings() {
        click(tableSettingsIcon)
    }

    def applyFilter(String filterText, WebDriver driver) {
        waitVisible(filterTextBox)
        Actions action = new Actions(driver)
        action.moveToElement(filterTextBox)
        action.click()
        click(filterTextBox)
        filterTextBox.sendKeys(filterText)
    }
}
