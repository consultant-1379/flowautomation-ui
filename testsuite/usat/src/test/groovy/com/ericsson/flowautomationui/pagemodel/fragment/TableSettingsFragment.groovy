/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2012
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/
package com.ericsson.flowautomationui.pagemodel.fragment

import org.jboss.arquillian.graphene.findby.FindByJQuery
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class TableSettingsFragment extends BaseFragment {

    @FindByJQuery("label.elTablelib-TableSettingsItem-label > :checkbox:eq(1)")
    private WebElement tableSettingsDescriptionColumn

    @FindByJQuery("span.ebCheckbox-label-text:contains('Flow')")
    private WebElement tableSettingsFlowColumn

    @FindByJQuery("span.ebCheckbox-label-text:contains('State')")
    private WebElement tableSettingsStateColumn

    @FindByJQuery("input:checked")
    private List<WebElement> selectedTableSettingColumns

    @FindByJQuery("div.eaFlowAutomationLib-tableSettings-controls > :contains('Apply')")
    private WebElement applyTableSettingButton

    @FindBy(className = "elTablelib-TableSettings-selectNone")
    private WebElement tableSettingsSelectNoneLink

    def selectNone() {
        click(tableSettingsSelectNoneLink)
        return applyTableSettingsAndReturnColumnSize()
    }

    def selectDescriptionColumn() {
        click(tableSettingsSelectNoneLink)
        //click(tableSettingsDescriptionColumn)
        tableSettingsDescriptionColumn.click()
        return applyTableSettingsAndReturnColumnSize()
    }

    def selectFlowAndStateColumn() {
        click(tableSettingsSelectNoneLink)
        click(tableSettingsFlowColumn)
        click(tableSettingsStateColumn)
        return applyTableSettingsAndReturnColumnSize()
    }

    private int applyTableSettingsAndReturnColumnSize() {
        def selectedColumnSize = selectedTableSettingColumns.size()
        click(applyTableSettingButton)
        return selectedColumnSize
    }
}
