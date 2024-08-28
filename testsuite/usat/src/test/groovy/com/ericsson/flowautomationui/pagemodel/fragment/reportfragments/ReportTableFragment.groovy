package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableFragment
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class ReportTableFragment extends BaseFragment {

    @FindBy(className = "elTablelib-Table")
    TableFragment tableFragment

    @FindBy(className = "eaFlowInstanceDetails-rTable-topPanel-header-text")
    WebElement tableHeader

    TableFragment getTable() {
        return tableFragment
    }

    WebElement getTableHeader() {
        waitVisible(tableHeader)
        return tableHeader
    }

}
