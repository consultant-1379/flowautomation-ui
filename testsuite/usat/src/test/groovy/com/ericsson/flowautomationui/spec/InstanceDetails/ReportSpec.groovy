package com.ericsson.flowautomationui.spec.InstanceDetails

import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

@RunWith(ArquillianSputnik)
class ReportSpec extends BaseSpecification {

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    def "you can get to flow instance details"() {
        setup: "flow automation is running"
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)

        when: "unselect my flow instances"
        instancesPage.clickMyInstances()

        then: "when table is visible"
        instancesPage.instancesTableFragment.getTable()

        when: "click on an instance in the table"
        instancesPage.instancesTableFragment.selectRow("1task")

        then: "click on the flow instance details button of an instance with user tasks, there should should go to userTask tab"
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        instanceDetailsPage.selectedTabIsCorrect("User Tasks")
        instanceDetailsPage.correctVisibleTabs("User Tasks")
    }

    def "when a basic 500 error is hit from report or schema"() {
        when: "go back to instances page, select an instance with no report"
        instancesPage.openFlowAutomationBreadCrumb()
        instancesPage.instancesTableFragment.getTable()
        instancesPage.clickMyInstances()
        instancesPage.flowsTableFragment.selectRow("Fill Node Data")
        instancesPage.instancesTableFragment.clickRow(2)
        sleep(500)
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")
        instanceDetailsPage.selectedTabIsCorrect("Report")
        instanceDetailsPage.correctVisibleTabs("Report", "User Tasks")

        then: "verify the no report inline message"
        instanceDetailsPage.reportTabFragment.getReportHeader() == "Report"
        instanceDetailsPage.getInlineMessage() == "No report available"

        and: "switch tab and verify the no user task inline message"
        instanceDetailsPage.switchTab(0, 1)
        instanceDetailsPage.userTaskDetailsFragment.getUserTaskHeader() == "User Tasks"
        instanceDetailsPage.getInlineMessage() == "No User Tasks"
    }

    def "when there is a problem with the schema"() {
        when: "go back to instances page, select an instance with no report"
        instancesPage.openFlowAutomationBreadCrumb()

        instancesPage.instancesTableFragment.getTable()
        instancesPage.clickMyInstances()
        instancesPage.flowsTableFragment.selectRow("Fill Node Data")
        instancesPage.instancesTableFragment.dblClickRow(driver, 1)
        instanceDetailsPage.selectedTabIsCorrect("Report")
        instanceDetailsPage.correctVisibleTabs("Report", "User Tasks")

        then: "verify the no report inline message"
        instanceDetailsPage.reportTabFragment.getReportHeader() == "Report"
        instanceDetailsPage.getInlineMessage() == "Error in flow package. Check the flow design. Error message: [object has missing required properties ([\"numberOfNodes\"])]"

        and: "go back to instances page, select an instance with no user tasks, should open report tab"
        instancesPage.openFlowAutomationBreadCrumb()
        instancesPage.instancesTableFragment.getTable()
        instancesPage.clickMyInstances()
        instancesPage.flowsTableFragment.selectRow("Collect PM Counters, Activate KPI")
        instancesPage.instancesTableFragment.clickRow(2)
        sleep(500)
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")
        instanceDetailsPage.selectedTabIsCorrect("Report")
        instanceDetailsPage.correctVisibleTabs("Report", "User Tasks")
        instanceDetailsPage.hasActionDropdown()
    }

    def "the Overview widget is present with the correct values"() {
        when: "there are 3 sections"
        instanceDetailsPage.getAmountOfSectionsInReport() == 3

        then: "the first section contains the overview section"
        instanceDetailsPage.thereAreCorrectAmountOfTextLines(0, 0, 5)
        instanceDetailsPage.valueOfALineIs(0, 0, 0, "Name:", "Auto Upgrade Demo", null)
        instanceDetailsPage.valueOfALineIs(0, 0, 2, "Summary Result:", "View", "http://localhost:8585/#flow-automation/flowinstances")
        instanceDetailsPage.valueOfALineIs(0, 0, 3, "Text Value Not Returned:", "N/A", null)
        instanceDetailsPage.valueOfALineIs(0, 0, 4, "Link Name:", "View", "http://localhost:8585/#flow-automation/flowinstances")
    }

    def "ToolTips are rendered when there is a description for link and not when there isn't"() {
        when: "we hover over a link with a description"
        scrollToElement(instanceDetailsPage.getTextLine(0, 0, 2))

        then: "there is a tooltip present with the correct value"
        instanceDetailsPage.tooltipIsCorrect(true, "Description Text")

        and: "when we hover over a link with no description"
        scrollToElement(instanceDetailsPage.getTextLine(0, 0, 4))

        then: "there is no tool tip present"
        instanceDetailsPage.tooltipIsCorrect(false, "")
    }

    def "the summary widgets are present with the correct values"() {
        when: "there are 3 sections"
        instanceDetailsPage.getAmountOfSectionsInReport() == 3

        then: "the second section contains the summary section"
        instanceDetailsPage.thereAreCorrectAmountOfSummariesWithinAssertion(1, 2)
        instanceDetailsPage.theSummaryTitleIsCorrect(1, 0, "Preparation")
        instanceDetailsPage.theSummaryContainsTheCorrectNames(1, 0, "NEs prepared", "NEs failed", "NEs ongoing", "Summary value Not Returned")
        instanceDetailsPage.theSummaryContainsTheCorrectValues(1, 0, false, 0, "1", "2", "0", "N/A")

        and: "scroll down to the last element"
        scrollToElement(instanceDetailsPage.getTableElement(2, 0))

        then: "the next summary should be correctly rendered"
        instanceDetailsPage.theSummaryTitleIsCorrect(1, 1, "Activation")
        instanceDetailsPage.theSummaryContainsTheCorrectNames(1, 1, "NEs activated", "NEs failed", "NEs ongoing", "Link to somewhere")
        instanceDetailsPage.theSummaryContainsTheCorrectValues(1, 1, true, 3, "10", "11", "12", "View")
    }

    def "the table widget is present with the correct values"() {
        when: "there are 3 sections"
        instanceDetailsPage.getAmountOfSectionsInReport() == 3

        then: "the last section contains the table with the correct values and links"
        instanceDetailsPage.theTableTitleIsCorrect(2, 0, "Node Result Table")
        def firstRow = instanceDetailsPage.getReportTableRow(2, 0, 2)
        instanceDetailsPage.theTableRowIsCorrect(firstRow, true, "http://localhost:8585/#flow-automation/flowinstances", 3, "ERBS00025", "Cancelled", "Activation", "View")
        def secondRow = instanceDetailsPage.getReportTableRow(2, 0, 3)
        instanceDetailsPage.theTableRowIsCorrect(secondRow, true, "http://localhost:8585/#flow-automation/flowinstances", 3, "ERBS00026", "Executed", "Activation", "View")

        and: "when a link is not required and not supplied we print the text N/A"
        def thirdRow = instanceDetailsPage.getReportTableRow(2, 0, 4)
        instanceDetailsPage.theTableRowIsCorrect(thirdRow, true, null, 3, "ERBS00026", "Executed", "Activation", "N/A")
    }

    def "when report table loads for the first time by default first column is sorted in ascending order"() {
        when: "fetch the list of first column values in the report table"
        def tableReportData = instanceDetailsPage.tableFragment.getFirstColumnValuesInDescendingOrder()

        then: "Flow list should get sorted in descending order on name column"
        instanceDetailsPage.isDataSorted(tableReportData)
    }

    def "Sorting some other column in ascending order really sorts the data in ascending order"() {
        when: "fetch the list of all flow names in descending order before clicking sort icon"
        def secondColumnValues = instanceDetailsPage.tableFragment.getSecondColumnValuesInAscendingOrder()

        and: "sort descending on name column"
        instanceDetailsPage.tableFragment.sortColumnInAscendingOrder(2)

        then: "Flow list should get sorted in descending order on name column"
        instanceDetailsPage.compareSortedReportData(secondColumnValues)
    }

    def "filtering on a column really filters the records in the table"() {
        when: "fetch the list of all flow names in descending order before clicking sort icon"
        instanceDetailsPage.applyFilter('ERBS00025', driver)

        and: "wait for table to be visible"
        instanceDetailsPage.tableFragment.getTable()

        then: "flow list should be filtered on all the columns "
        instanceDetailsPage.tableFragment.compareFilteredRows('ERBS00025')
    }

    def "the setup data is viewable and correct"() {
        when: "clicking the Setup button"
        instanceDetailsPage.clickReportSetupButton()
        sleep(2000)

        then: "the data used for setup should be displayed"
        instanceDetailsPage.isSetupDataAccordionDisplayed()
        instanceDetailsPage.clickReportExecutionButton()
    }
}