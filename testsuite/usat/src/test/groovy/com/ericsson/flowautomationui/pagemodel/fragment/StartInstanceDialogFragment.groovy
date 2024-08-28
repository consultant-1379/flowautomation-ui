package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.Keys
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class StartInstanceDialogFragment extends BaseFragment {

    @FindBy(className = "ebDialogBox-primaryText")
    private WebElement dialogBoxHeading

    @FindBy(className = "ebDialogBox-secondaryText")
    private WebElement secondaryText

    @FindBy(className = "ebBtn-caption")
    private List<WebElement> actionButtons

    @FindBy(className = "ebDialogBox")
    private WebElement executeDialogBox

    @FindBy(className = "eaFlowAutomationLib-wFlowExecute-container-flowInstanceNameErrorText")
    private WebElement validationErrorMsg

    @FindBy(className = "ebInput")
    private WebElement inputBoxForString

    String getDialogBoxHeading() {
        waitVisible(executeDialogBox)
        return getText(dialogBoxHeading)
    }

    String getSecondaryText() {
        waitVisible(executeDialogBox)
        return getText(secondaryText)
    }

    boolean clickActionButton(final String actionButtonToClick) {
        clickActionButton(actionButtons, actionButtonToClick)
    }

    void inputString(final String value) {
        waitPresent(inputBoxForString)
        inputBoxForString.clear()
        if ("" == value) {
            inputBoxForString.sendKeys(".", Keys.BACK_SPACE)
        } else {
            inputBoxForString.sendKeys(value)
        }
    }

    String getDisplayedErrorMessage() {
        return getText(validationErrorMsg)
    }

    boolean doesExist() {
        try {
            instanceDetailsPage.dialogFragment.actionButtons
            return false
        } catch (ignored) {
            return true
        }
    }
}