package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.By
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class ReportTabFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-rReportTab-header")
    private WebElement reportHeader

    @FindBy(className = "ebTabs-tabItemWrapper")
    private List<WebElement> tabs

    List<WebElement> getTabs() {
        for (WebElement tab : tabs) {
            System.out.println("***** Tab: " + tab.getText())
        }

        return waitVisible(tabs)
    }

    String getReportHeader() {
        return getText(reportHeader)
    }

    String isTabSelected(final int tabNumber) {
        def reportTabs = getTabs()
        def size = reportTabs.size()
        if (tabNumber < size) {
            WebElement tab = reportTabs.get(tabNumber)
            WebElement tabItem = tab.findElement(By.className("ebTabs-tabItem"))
            tab.click()
            return tabItem.getText()
        } else {
            throw new Exception(String.format("IndexOutOfBounds Index: %s, Size: %s", tabNumber, size))
        }
    }
}
