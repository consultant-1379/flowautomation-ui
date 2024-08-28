package com.ericsson.flowautomationui.spec.FlowsContextButtonsSpec

import com.ericsson.flowautomationui.pagemodel.page.CatalogPage
import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith
import spock.lang.Unroll

import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CANCEL
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CHARACTER_LENGTH_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CHARACTER_LENGTH_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CONFIRM_EXECUTION
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.CONTINUE
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.DASH_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ERRORCODE_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ERRORCODE_INPUT_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ERRORCODE_PERMISSION_DENIED_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ERRORCODE_SYSTEM_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ERRORCODE_SYSTEM_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.EXECUTE
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.NAME_REQUIRED_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.NAME_REQUIRED_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.OK
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SPACE_DASH_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SPACE_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SPECIAL_CHARACTERS_ERROR_MSG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SPECIAL_CHARACTERS_INPUT_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.START
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.START_HEADER

@RunWith(ArquillianSputnik)
class StartFlowSpec extends BaseSpecification {

    @Page
    CatalogPage catalogPage

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    def "The flow automation main page is open"() {
        setup: "flow automation is running"
        openFlowCatalogUrl()
        catalogPage.isTopsectionVisible()
        catalogPage.verifyTopSectionTitle(CatalogPage.TITLE)
    }

    @Unroll
    def "select start button and verify input error message"(final Boolean setup, String input, final String expectedErrorMessage) {
        given: "Imported Flows Table is visible"
        if (setup) {
            catalogPage.tableFragment.getTable()
            catalogPage.tableFragment.clickTableBodyRow(1)
            catalogPage.actionBarFragment.clickActionBarButton(START)
        }

        when: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        then: "verify the error message when some invalid text is entered"
        if (input != CANCEL) {
            startDialogFragment.inputString(input)
            startDialogFragment.getDisplayedErrorMessage() == expectedErrorMessage
        } else {
            startDialogFragment.clickActionButton(CANCEL)
        }

        where:
        setup | input                          | expectedErrorMessage
        true  | NAME_REQUIRED_INPUT_ERROR      | NAME_REQUIRED_ERROR_MSG
        false | SPECIAL_CHARACTERS_INPUT_ERROR | SPECIAL_CHARACTERS_ERROR_MSG
        false | CHARACTER_LENGTH_INPUT_ERROR   | CHARACTER_LENGTH_ERROR_MSG
        false | SPACE_INPUT_ERROR              | SPACE_DASH_ERROR_MSG
        false | DASH_INPUT_ERROR               | SPACE_DASH_ERROR_MSG
        false | CANCEL                         | CANCEL
    }

    def "select and start flow and verify inline error code message"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        and: "click on start button"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        when: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        then: "enter an inline error input and start"
        startDialogFragment.inputString(ERRORCODE_INPUT_ERROR)
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        and: "verify the inline error message"
        startDialogFragment.getDisplayedErrorMessage() == ERRORCODE_INPUT_ERROR_MSG

        then: "click the cancel button"
        startDialogFragment.clickActionButton(CANCEL)
    }

    def "select and start a flow and verify system error message"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        and: "click on start button"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        when: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        then: "enter a system error input and start"
        startDialogFragment.inputString(ERRORCODE_SYSTEM_ERROR)
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        and: "system error dialog is displayed and correct heading message appears"
        catalogPage.isDialogBoxDisplayed()
        startDialogFragment.getDialogBoxHeading() == ERRORCODE_SYSTEM_ERROR_MSG

        then: "click ok and cancel buttons"
        startDialogFragment.clickActionButton(OK)
        startDialogFragment.clickActionButton(CANCEL)
    }

    def "select start button and verify success"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()
        catalogPage.tableFragment.clickTableBodyRow(0)

        and: "click on start button"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        when: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        and: "enter a flow instance name and start"
        startDialogFragment.inputString("Fill data for 100 nodes-1")
        startDialogFragment.clickActionButton(CONTINUE)

        then: "confirm permission dialogue"
        startDialogFragment.getDisplayedErrorMessage() == ERRORCODE_PERMISSION_DENIED_MSG

        when:
        startDialogFragment.clickActionButton(CONTINUE)

        then: "Redirect to flow instance details page"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        and: "Verify flow instance details summary section"
        def flowInstanceDetailsSummaryHeaderFragment = instanceDetailsPage.flowInstanceDetailsSummaryHeaderFragment
        flowInstanceDetailsSummaryHeaderFragment.name == "Fill data for 100 nodes-1"
        flowInstanceDetailsSummaryHeaderFragment.flow == "Auto Software Rollout"
        flowInstanceDetailsSummaryHeaderFragment.version == "1.0.1"

        def flowInstanceDetailsSummaryFragment = instanceDetailsPage.flowInstanceDetailsSummaryFragment
        flowInstanceDetailsSummaryFragment.summaryState == "Executing"
        flowInstanceDetailsSummaryFragment.startedBy == "User 1"
        flowInstanceDetailsSummaryFragment.result != "229"

        then:
        def value = redirectToFlowCatalogUrl()
    }

    def "go to instances page, select and start flow and verify inline error code message"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()
        sleep(2000)
        catalogPage.tableFragment.clickTableBodyRow(1)

        when: "click on start button"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        then: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        when: "enter an inline error input and start"
        startDialogFragment.inputString(ERRORCODE_INPUT_ERROR)
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        then: "verify the inline error message"
        startDialogFragment.getDisplayedErrorMessage() == ERRORCODE_INPUT_ERROR_MSG

        and: "click the cancel button"
        startDialogFragment.clickActionButton(CANCEL)
    }

    def "In Flow Instances page, select and start flow and verify system error code message"() {
        when: "click on start button"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        then: "verify the header of dialog box is correct"
        sleep(2000)
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        when: "enter a system error input and start"
        startDialogFragment.inputString(ERRORCODE_SYSTEM_ERROR)
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        then: "verify the system error message"
        startDialogFragment.getDialogBoxHeading() == ERRORCODE_SYSTEM_ERROR_MSG

        then: "click ok and cancel buttons"
        startDialogFragment.clickActionButton(OK)
        startDialogFragment.clickActionButton(CANCEL)
    }

    def "In Flow Instances page, select start button using actionbar and verify success"() {
        when: "start button is selected"
        catalogPage.actionBarFragment.clickActionBarButton(START)

        then: "verify the header of dialog box is correct"
        sleep(2000)
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        when: "enter a flow instance name and start"
        startDialogFragment.inputString("0task")
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        then: "Redirect to flow instance details page"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        then: "Redirect to Flow Catalog page"
        def value = redirectToFlowCatalogUrl()
    }

    def "In Flow Instances page, select start using right click context menu and verify success"() {
        when: "right click on a flow in the flows list"
        catalogPage.tableFragment.getTable()
        catalogPage.tableFragment.rightClickRow(driver, 1)

        and: "click on context menu item Start"
        catalogPage.rightClickOnOption(START)

        and: "verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        def startDialogFragment = catalogPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        and: "enter a flow instance name and start"
        startDialogFragment.inputString("0task")
        startDialogFragment.clickActionButton(EXECUTE)

        and: "Verify confirm execution dialog"
        catalogPage.isDialogBoxDisplayed()
        def conExecDialogFragment = catalogPage.startDialogFragment
        conExecDialogFragment.getDialogBoxHeading() == CONFIRM_EXECUTION

        then: "Click execute button"
        conExecDialogFragment.clickActionButton(EXECUTE)

        then: "Redirect to flow instance details page"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        then: "Redirect to Flow Catalog page"
        def value = redirectToFlowCatalogUrl()
    }
}
