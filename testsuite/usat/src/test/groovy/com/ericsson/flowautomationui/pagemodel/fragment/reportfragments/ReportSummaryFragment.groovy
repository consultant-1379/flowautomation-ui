package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class ReportSummaryFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-rSummary")
    WebElement summary

    @FindBy(className = "eaFlowInstanceDetails-rSummary-header")
    WebElement summaryHeader

    @FindBy(className = "eaFlowInstanceDetails-rTextLine")
    List<ReportTextLineFragment> textLines

    WebElement getChart() {
        return waitVisible(summary)
    }

    WebElement getSummaryHeader() {
        return waitVisible(summaryHeader)
    }

    List<ReportTextLineFragment> getSummaryValues() {
        return textLines
    }
}
