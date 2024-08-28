package com.ericsson.flowautomationui.spec

import com.ericsson.flowautomationui.pagemodel.fragment.FlowSummaryFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TitleAndFiltersFragment
import com.ericsson.flowautomationui.pagemodel.page.CatalogPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

import static com.ericsson.flowautomationui.pagemodel.page.CatalogPage.IMPORT_LINK_BUTTON

@RunWith(ArquillianSputnik)
class FlowsSpec extends BaseSpecification {

    @Page
    InstancesPage instancesPage

    @Page
    CatalogPage catalogPage

    @Page
    TitleAndFiltersFragment titleAndFiltersFragment

    def "the title contains flow automation"() {
        setup: "flow automation is running"
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)
        instancesPage.clickCatalogLink()
    }

    def "all buttons are visible on flow select"() {
        given: "Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "select a flow is selected"
        sleep(2000)
        catalogPage.tableFragment.clickRow(2)

        then: "verify all buttons are visible"
        catalogPage.actionBarFragment.hasActionButton(IMPORT_LINK_BUTTON)
        and: "unselect the flow"
        sleep(2000)
        catalogPage.tableFragment.clickRow(2)
    }

    def "View Flow summary"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "flow summary content does not exist"
        FlowSummaryFragment flowSummaryFragment = catalogPage.flowSummaryFragment
        flowSummaryFragment.isSummaryContentHidden()

        then: "verify the no flow selected message"
        flowSummaryFragment.getInstanceWarning() == "No Flow Selected"

        and: "a flow is selected in the table"
        sleep(2000)
        catalogPage.tableFragment.clickTableBodyRow(0)

        then: "the empty flow summary content disappears"
        flowSummaryFragment.isEmptySummaryContentHidden()

        and: "flow summary is updated with text"
        flowSummaryFragment.getFlowNameText() == "Auto Software Rollout"
        flowSummaryFragment.getFlowDescriptionText() == "Auto software rollout.s 1"
        flowSummaryFragment.getFlowVersionText() == "2.0"

        and: "selected count is 1"
        titleAndFiltersFragment.isSelectedCountCorrect("1")

        when: "clear is clicked to remove the flow selection"
        titleAndFiltersFragment.clearSelection()

        then: "flow selected count is cleared"
        titleAndFiltersFragment.isSelectedCountCleared(driver)

        and: "a flow is selected in the table"
        catalogPage.tableFragment.clickTableBodyRow(5)

        then: "the empty flow summary content disappears"
        flowSummaryFragment.isEmptySummaryContentHidden()

        and: "flow summary is updated with text"
        flowSummaryFragment.getFlowNameText() == "Radio Nodes Fire Alarm Issue"
        flowSummaryFragment.getFlowDescriptionText() == "Radio nodes caught fire and need to be recovered 2"
        flowSummaryFragment.getFlowVersionText() == "4.2"

        and: "selected count is 1"
        titleAndFiltersFragment.isSelectedCountCorrect("1")

        when: "clear is clicked to remove the flow selection"
        titleAndFiltersFragment.clearSelection()

        then: "flow selected count is cleared"
        titleAndFiltersFragment.isSelectedCountCleared(driver)

        and: "flow summary content does not exist"
        flowSummaryFragment.isSummaryContentHidden()
    }

    def "Verify Flows right click context menu"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "right click on first row, assert menu present"
        catalogPage.tableFragment.rightClickRow(driver, 1)

        then: "context menu exists"
        catalogPage.isRightClickMenuAvailable(driver)
    }

    def "Sorting flow names in descending order sorts the table in descending order"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "fetch the list of all flow names in descending order before clicking sort icon"
        def flowNamesDesccendingList = catalogPage.tableFragment.getFirstColumnValuesInDescendingOrder()

        and: "sort descending on name column"
        catalogPage.tableFragment.sortDescending()

        then: "Flow list should get sorted in descending order on name column"
        catalogPage.compareSortedFlows(flowNamesDesccendingList)
    }

    def "when we select None option in table settings, flow list displays only default Name column"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "we we click on table settings"
        titleAndFiltersFragment.applyTableSettings()

        and: "table settings flyout panel is visible"
        catalogPage.isFlyoutPanelVisible()

        and: "None is selected"
        def selectedTableColumns = catalogPage.tableSettingsFragement.selectNone()

        and: "get the list of columns displayed in flow table"
        def tableColumns = catalogPage.tableFragment.getTableColumns()

        then: "Table should show only name and column"
        tableColumns.size() == selectedTableColumns
    }

    def "when we select a column in table settings, flow list displays that column with Name column"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "we we click on table settings"
        sleep(2000)
        titleAndFiltersFragment.applyTableSettings()
        sleep(2000)

        then: "table settings flyout panel is visible"
        catalogPage.isFlyoutPanelVisible()
        when: "description column is selected"
        def selectedTableColumns = catalogPage.tableSettingsFragement.selectDescriptionColumn()

        and: "get the list of columns displayed in flow table"
        def tableColumns = catalogPage.tableFragment.getTableColumns()

        then: "Table should show only name and description column"
        tableColumns.size() == selectedTableColumns
    }

    def "When we enter some text in filter text box only flows with names having that text are displayed in the flow table"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "we enter some text in filter text box"
        titleAndFiltersFragment.applyFilter("f", driver)

        and: "filtered table is visible"
        catalogPage.tableFragment.getTable()

        then: "filtered table contains only flows having filter text in their names"
        !catalogPage.compareTableFilteredRows("f")
    }

    def "test opening Instances app with Flow Selected"() {
        when: "Return to Application main page"
        instancesPage.openFlowAutomationBreadCrumb()

        then:
        instancesPage.flowInstanceStatisticsFragment.compareValue("0", "2", "0", "0", "1", "1")

        when: "select an Instances by right and hit view instances"
        instancesPage.clickCatalogLink()
        sleep(5000)
        catalogPage.tableFragment.rightClickRow(driver, 0)
        sleep(2000)
        catalogPage.rightClickOnOption('View Instances')

        then:
        sleep(2000)
        instancesPage.flowInstanceStatisticsFragment.compareValue("0", "1", "0", "0", "1", "1")
        and:
        instancesPage.instancesTableFragment.getAllTableBodyRows().size() == 3
    }
}
