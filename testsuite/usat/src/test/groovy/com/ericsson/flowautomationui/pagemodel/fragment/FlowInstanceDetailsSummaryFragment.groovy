package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class FlowInstanceDetailsSummaryFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-status-state")
    private WebElement state

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-status-start")
    private WebElement startTime

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-status-end")
    private WebElement endTime

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-status-started-by")
    private WebElement startedBy

    @FindBy(className = "eaFlowInstanceDetails-wUserTaskSummary-status-result")
    private WebElement result

    String getResult() {
        return getText(result)
    }

    String getSummaryState() {
        return getText(state)
    }

    String getStartTime() {
        return getText(startTime)
    }

    String getEndTime() {
        return getText(endTime)
    }

    String getStartedBy() {
        return getText(startedBy)
    }
}
