package com.ericsson.flowautomationui.pagemodel.fragment

import org.jboss.arquillian.graphene.fragment.Root
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

import java.util.function.Predicate

class UserTaskDetailsButtonsFragment extends BaseFragment {

    @Root
    WebElement root;

    @FindBy(className = "ebBtn")
    private List<WebElement> buttons

    @FindBy(className = "ebBtn-caption")
    private List<WebElement> buttonsDescriptions

    @FindBy(className = "ebBtn_color_paleBlue")
    private WebElement continueButton

    boolean verifyNameFirstButton(String name) {
        return getButtonsDescriptions(0) == name
    }

    String getButtonsDescriptions(int index) {
        return getText(buttonsDescriptions.get(index))
    }

    boolean continueButtonIsDisabled() {
        return waitVisible(continueButton).getAttribute("class").contains("disabled")
    }

    def clickUserTaskButton(String nameOfButton) {
        sleep(5000) //Wait to render UT
        clickButton(buttons, { WebElement button -> nameOfButton == waitVisible(button).getAttribute("innerText") } as Predicate)
    }
}