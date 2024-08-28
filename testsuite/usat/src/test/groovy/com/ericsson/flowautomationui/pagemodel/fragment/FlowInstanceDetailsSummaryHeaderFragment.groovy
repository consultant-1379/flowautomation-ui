package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class FlowInstanceDetailsSummaryHeaderFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-summary-version")
    private WebElement version

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-summary-flow")
    private WebElement flow

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-summary-name")
    private WebElement name

    String getVersion() {
        return getText(version)
    }

    String getFlow() {
        return getText(flow)
    }

    String getName() {
        return getText(name)
    }

}
