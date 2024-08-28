package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.support.FindBy

class SectionFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-rText")
    List<ReportTextAreaFragment> textAreas

    @FindBy(className = "eaFlowInstanceDetails-rTable")
    List<ReportTableFragment> reportTables

    @FindBy(className = "eaFlowInstanceDetails-rSummary")
    List<ReportSummaryFragment> summaries

    List<ReportTextAreaFragment> getTextAreas() {
        return textAreas
    }

    List<ReportTableFragment> getReportTables() {
        return reportTables
    }

    List<ReportSummaryFragment> getSummaries() {
        return summaries
    }

    ReportTextAreaFragment getTextArea(int index) {
        return getTextAreas().get(index)
    }

    ReportTableFragment getReportTable(int index) {
        return getReportTables().get(index)
    }

    ReportSummaryFragment getChart(int index) {
        return getSummaries().get(index)
    }
}
