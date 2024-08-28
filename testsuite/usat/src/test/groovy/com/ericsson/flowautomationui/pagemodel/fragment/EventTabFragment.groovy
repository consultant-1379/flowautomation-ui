package com.ericsson.flowautomationui.pagemodel.fragment


import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class EventTabFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-wEventTable-header-section-title")
    private WebElement title

    @FindBy(className = "elTablelib-Table-table")
    TableFragment eventTable

    @FindBy(className = "eaFlowInstanceDetails-wEventDetails-group-header-section")
    private WebElement eventDetailHeader

    boolean verifyTitle(text) {
        return getText(title) == text
    }

    boolean verifyDetailHeader(text) {
        return getText(eventDetailHeader) == text
    }
}

