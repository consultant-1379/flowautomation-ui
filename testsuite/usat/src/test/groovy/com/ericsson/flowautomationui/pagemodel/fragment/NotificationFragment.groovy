package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class NotificationFragment extends BaseFragment {

    @FindBy(className = "ebNotification")
    WebElement notification

    void isNotificationDisplayed() {
        waitVisible(notification)
    }

    String getNotificationText() {
        return getText(notification)
    }

}
