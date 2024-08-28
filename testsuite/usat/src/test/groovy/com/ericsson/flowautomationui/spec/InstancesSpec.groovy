package com.ericsson.flowautomationui.spec

import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.*

@RunWith(ArquillianSputnik)
class InstancesSpec extends BaseSpecification {

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    def "the title contains flow automation"() {
        setup: "flow automation is running "
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)
    }

    def "test correct number of instances when no flow selected and my instances"() {
        when: "click on Instances button"
        instancesPage.flowsTableFragment.getTable()

        then: "Verify number of instances when no flow selected is zero"
        instancesPage.flowInstanceStatisticsFragment.compareValue("0", "2", "0", "0", "1", "1")
    }

    def "test correct number of executions when no flow selected for all users"() {
        when: "unselect my flow instances"
        instancesPage.clickMyInstances()

        then: "Verify number of executions for selected flow"
        sleep(5000) // Wait until have all the rows available
        instancesPage.instancesTableFragment.getAllTableBodyRows().size() == 15
        instancesPage.flowInstanceStatisticsFragment.compareValue("4", "4", "4", "3", "1", "3")
    }

    def "validate button delete hidden"() {
        def flowInstance = instancesPage.instancesTableFragment.getRowWithColumnHeaderAndValue("Name", "internationalization-tests")

        when: "click in the instance"
        instancesPage.instancesTableFragment.clickRow(flowInstance)

        and: "wait 0.5 seconds"
        sleep(500)

        then: "Verify if the delete button is hidden"
        instancesPage.actionBarFragment.hasNotActionButton("Delete Instance")
    }

    def "validate button delete"() {
        def flowInstance = instancesPage.instancesTableFragment.getRowWithColumnHeaderAndValue("Name", "report-internationalization-tests")

        when: "click in the instance"
        instancesPage.instancesTableFragment.clickRow(flowInstance)

        and: "wait 0.5 seconds"
        sleep(500)

        then: "Verify if the delete button appear"
        instancesPage.actionBarFragment.hasActionButton("Delete Instance")
    }

    def "validate dialog box when click in delete button"() {
        when: "click to delete the instance"
        instancesPage.actionBarFragment.clickActionBarButton("Delete Instance")

        then: "the system show the dialog box"
        instancesPage.deleteInstanceDialogFragment.isStopDialogDisplayed()

        and: "When cancel button is clicked in the delete dialog."
        instancesPage.deleteInstanceDialogFragment.clickActionButton("Cancel")
    }

    def "test correct number of executions when a flow is selected for all users"() {
        when: "select a flow"
        instancesPage.flowsTableFragment.selectRow("Fill Node Data")

        then: "Verify number of executions for selected flow"
        instancesPage.instancesTableFragment.getAllTableBodyRows().size() == 2
        and: "The Start Button is disabled"
        instancesPage.actionBarFragment.actionBarButtonIsDisabled("Start")
    }

    def "test warning message when flow has no instances"() {
        when: "select a flow which has no instances"
        instancesPage.flowsTableFragment.selectRow("Physical Servers")

        then: "Verify correct warning message is displayed"
        instancesPage.verifyTextInstanceWarning("There are no instances associated with the selected options")
    }

    def "test start button is visible on flow select"() {
        when: "select a flow"
        instancesPage.flowsTableFragment.selectRow("Radio Nodes Fire Alarm Issue")

        then: "verify all buttons are visible"
        instancesPage.actionBarFragment.hasActionButton("Start")
    }

    def "test when we select a column in table settings, flow list displays that column with Name column"() {
        when: "we click on table settings"
        instancesPage.flowsTableFragment.selectRow("Auto Software Rollout")
        instancesPage.titleAndFiltersFragment.applyTableSettings()

        then: "table settings flyout panel is visible"
        instancesPage.isFlyoutPanelVisible()

        and: "flow column is selected"
        def selectedTableColumns = instancesPage.tableSettingsFragement.selectFlowAndStateColumn()

        when: "get the list of columns displayed in flow table"
        def tableColumns = instancesPage.instancesTableFragment.getTableColumns()

        then: "Table should show only name and description column"
        tableColumns.size() == selectedTableColumns
    }

    def 'test flows enabled can be started'() {
        when: "we click an enabled flow"
        instancesPage.flowsTableFragment.selectRow("Current BTS Nodes Upgrade")
        then: "The Start Button is enabled"
        !instancesPage.actionBarFragment.actionBarButtonIsDisabled("Start")
    }

    def "test when the flow instance in executing phase is selected and stopped, it gets stopped."() {
        setup: "Get the flow instance to Stop"
        instancesPage.flowsTableFragment.selectRow("Current BTS Nodes Upgrade")
        def flowInstance = instancesPage.instancesTableFragment.getRowWithColumnHeaderAndValue("Name", "instances app: flow instance to be stopped")

        when: "When a flow instance is selected in the instances table"
        instancesPage.instancesTableFragment.clickRow(flowInstance)

        and: "wait 0.5 seconds"
        sleep(1000)

        then: "The execution phase for the selected instance is Executing and the Stop button appears in action bar"
        assertStateEquals(flowInstance, "Executing")
        instancesPage.actionBarFragment.hasActionButton("Stop")

        and: "When Stop button in the action bar is clicked"
        instancesPage.actionBarFragment.clickActionBarButton("Stop")
        then: "A confirmation dialog is displayed with options Stop and Cancel."
        instancesPage.stopInstanceDialogFragment.isStopDialogDisplayed()

        and: "When Stop button is clicked in the confirmation dialog."
        instancesPage.stopInstanceDialogFragment.clickActionButton("Stop")

        then: "Flow instance's execution status changes to Stopped after few seconds and the Stop option in actionbar disappears"
        assertStateEquals(flowInstance, "Stopped")
        !instancesPage.actionBarFragment.hasActionButton("Stop")
    }

    def "select start button and verify success"() {
        given: "Imported Flows Table is visible"
        instancesPage.flowsTableFragment.getTable()
        instancesPage.flowsTableFragment.clickTableBodyRow(0)

        and: "click on start button"
        instancesPage.actionBarFragment.clickActionBarButton(START)

        when: "verify the header of dialog box is correct"
        instancesPage.isDialogBoxDisplayed()
        def startDialogFragment = instancesPage.startDialogFragment
        startDialogFragment.getDialogBoxHeading() == START_HEADER

        and: "enter a flow instance name and start"
        startDialogFragment.inputString("Fill data for 100 nodes-1")
        startDialogFragment.clickActionButton(CONTINUE)

        then: "confirm permission dialogue"
        startDialogFragment.getDisplayedErrorMessage() == ERRORCODE_PERMISSION_DENIED_MSG

        when:
        startDialogFragment.clickActionButton(CONTINUE)

        then: "Redirect to flow instance details page"
        instanceDetailsPage.isTopsectionVisible()
        instanceDetailsPage.verifyTopSectionTitle(InstanceDetailsPage.TITLE)

        and: "Verify flow instance details summary section"
        def flowInstanceDetailsSummaryHeaderFragment = instanceDetailsPage.flowInstanceDetailsSummaryHeaderFragment
        flowInstanceDetailsSummaryHeaderFragment.getName() == "Fill data for 100 nodes-1"
        flowInstanceDetailsSummaryHeaderFragment.getFlow() == "Auto Software Rollout"
        flowInstanceDetailsSummaryHeaderFragment.getVersion() == "1.0.1"

        def flowInstanceDetailsSummaryFragment = instanceDetailsPage.flowInstanceDetailsSummaryFragment
        flowInstanceDetailsSummaryFragment.getSummaryState() == "Executing"
        flowInstanceDetailsSummaryFragment.getStartedBy() == "User 1"
        flowInstanceDetailsSummaryFragment.getResult() != "229"

        and: "Verify flow instance details Export option available"
        instanceDetailsPage.hasActionDropdown()

        then:
        def value = redirectToFlowCatalogUrl()
    }

    private void assertStateEquals(def flowInstance, def expectedState) {
        int stateColumnIndex = instancesPage.instancesTableFragment.getColumnIndex("State")
        String executionState = instancesPage.instancesTableFragment.getCellValue(flowInstance, stateColumnIndex)
        executionState == expectedState
    }
}
