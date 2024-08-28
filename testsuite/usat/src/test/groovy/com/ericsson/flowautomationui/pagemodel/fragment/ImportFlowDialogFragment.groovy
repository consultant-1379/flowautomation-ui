package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class ImportFlowDialogFragment extends BaseFragment {

    public static final String CANCEL = "Cancel"
    public static final String OK = "OK"

    @FindBy(className = "ebDialogBox-primaryText")
    private WebElement dialogBoxHeading

    @FindBy(className = "ebBtn-caption")
    private List<WebElement> actionButtons

    @FindBy(className = "ebDialogBox")
    private WebElement importFlowDialogBox

    @FindBy(className = "eaFlowCatalog-wFileSelector-textBox-fileNameErrorText")
    private WebElement validationErrorMsg

    String getDialogBoxHeading() {
        waitVisible(importFlowDialogBox)
        return getText(dialogBoxHeading)
    }

    boolean clickActionButton(final String actionButtonToClick) {
        return clickActionButton(actionButtons, actionButtonToClick)
    }

    String getDisplayedErrorMessage() {
        return getText(validationErrorMsg)
    }
}
