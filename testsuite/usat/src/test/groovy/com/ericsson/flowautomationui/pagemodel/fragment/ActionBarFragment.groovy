/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2017
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/

package com.ericsson.flowautomationui.pagemodel.fragment

import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

import java.util.function.Predicate

class ActionBarFragment extends BaseFragment {

    @FindBy(className = "elLayouts-ActionBarButton")
    private List<WebElement> actionBarButtons

    List<WebElement> getActionBarButtons() {
        return actionBarButtons
    }

    boolean clickActionBarButton(String nameOfButton) {
        clickButton(getActionBarButtons(), {
            WebElement button -> nameOfButton == button.getAttribute("innerText")
        } as Predicate)
    }

    boolean hasActionButton(String nameOfButton) {
        getActionBarButtons().stream().anyMatch({
            WebElement button -> nameOfButton == button.getAttribute("innerText")
        } as Predicate)
    }

    boolean hasNotActionButton(String nameOfButton) {
        getActionBarButtons().stream().anyMatch({
            WebElement button -> nameOfButton != button.getAttribute("innerText")
        } as Predicate)
    }

    boolean actionBarButtonIsDisabled(String nameOfButton) {
        getActionBarButtons().stream().anyMatch({
            WebElement button ->
                nameOfButton == button.getAttribute("innerText") &&
                        "true" == button.getAttribute("disabled")
        } as Predicate)
    }
}
