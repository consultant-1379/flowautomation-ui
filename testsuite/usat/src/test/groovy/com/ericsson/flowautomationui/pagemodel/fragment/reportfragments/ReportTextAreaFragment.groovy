package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.support.FindBy

class ReportTextAreaFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-rTextLine")
    List<ReportTextLineFragment> textLines

    List<ReportTextLineFragment> getLines() {
        return textLines
    }
}
