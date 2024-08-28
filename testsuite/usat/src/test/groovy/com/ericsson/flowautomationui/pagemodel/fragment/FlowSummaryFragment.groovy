package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class FlowSummaryFragment extends BaseFragment {

    @FindBy(className = "eaFlowCatalog-rFlowSummary-content_hidden")
    private WebElement flowSummaryContentHidden

    @FindBy(className = "eaFlowCatalog-rFlowSummary-content-flowDescription-content")
    private WebElement flowDescription

    @FindBy(className = "eaFlowCatalog-rFlowSummary-content-flowVersion-content")
    private WebElement flowVersion

    @FindBy(className = "eaFlowCatalog-rFlowSummary-content-flowName-label")
    private WebElement flowName

    @FindBy(className = "ebInlineMessage-header")
    private WebElement instanceWarning

    void isSummaryContentHidden() {
        waitPresent(flowSummaryContentHidden)
    }

    void isEmptySummaryContentHidden() {
        waitNotPresent(flowSummaryContentHidden)
    }

    String getFlowNameText() {
        return getText(flowName)
    }

    String getFlowDescriptionText() {
        return getText(flowDescription)
    }

    String getFlowVersionText() {
        return getText(flowVersion)
    }

    String getInstanceWarning() {
        return getText(instanceWarning)
    }

}
