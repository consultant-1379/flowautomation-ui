package com.ericsson.flowautomationui.pagemodel.fragment

import org.jboss.arquillian.drone.api.annotation.Drone
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.FindBy

class RowFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-wTableLinkCell-link")
    private List<WebElement> linkInCell

    @FindBy(className = "eaFlowInstanceDetails-wTableLinkCell-notSupplied")
    private WebElement linkNotSuplpied

    @FindBy(tagName = "td")
    private List<WebElement> rowCells

    List<WebElement> getRowCells() {
        return rowCells
    }

    List<WebElement> getLinkInCell() {
        return linkInCell
    }

    void clickRow() {
        getRowCells().get(0).click()
    }

    void dblClickRow(WebDriver webDriver) {
        Actions actions = new Actions(webDriver)
        actions.doubleClick(returnClickableCell())
        actions.perform()
    }

    WebElement returnClickableCell() {
        return getRowCells().get(0)
    }

    WebElement getNotSuppliedLink() {
        return waitVisible(linkNotSuplpied)
    }
}
