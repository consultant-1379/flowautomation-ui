package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class InstanceDialogFragment extends BaseFragment {

    @FindBy(className = "ebDialogBox-primaryText")
    private WebElement dialogBoxHeading

    @FindBy(className = "ebDialogBox-secondaryText")
    private WebElement secondaryText

    @FindBy(className = "ebBtn-caption")
    private List<WebElement> actionButtons

    @FindBy(className = "ebDialogBox")
    private WebElement stopDialogBox

    boolean isStopDialogDisplayed() {
        return waitVisible(stopDialogBox).isDisplayed()
    }

    String getDialogBoxHeading() {
        return getText(dialogBoxHeading)
    }

    String getSecondaryText() {
        return getText(secondaryText)
    }

    boolean clickActionButton(final String actionButtonToClick) {
        return clickButton(actionButtons, actionButtonToClick)
    }
}

