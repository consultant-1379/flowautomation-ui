package com.ericsson.flowautomationui.pagemodel.fragment.reportfragments

import com.ericsson.flowautomationui.pagemodel.fragment.BaseFragment
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class ReportTextLineFragment extends BaseFragment {

    @FindBy(className = "eaFlowInstanceDetails-rTextLine-name")
    WebElement name

    @FindBy(className = "eaFlowInstanceDetails-rTextLine-value")
    WebElement value

    @FindBy(className = "eaFlowInstanceDetails-rTextLine-link")
    WebElement link

    WebElement getName() {
        waitVisible(name)
        return name
    }

    WebElement getValue() {
        waitVisible(value)
        return value
    }

    WebElement getLink() {
        waitVisible(link)
        return link
    }
}
