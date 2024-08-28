package com.ericsson.flowautomationui.spec.InstanceDetails

import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

@RunWith(ArquillianSputnik)
class ReportI18nSpec extends BaseSpecification {

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
        instancesPage.instancesTableFragment.selectRow("report-internationalization-tests")

        then: "click on the flow instance details button of an instance with user tasks, there should should go to userTask tab"
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        instanceDetailsPage.selectedTabIsCorrect("Report")
    }

    def "the setup data is viewable and correctly translated"() {
        when: "clicking the Setup button"
        instanceDetailsPage.clickReportSetupButton()

        then: "the translated data used for setup should be displayed"
        instanceDetailsPage.getLabelNames()
        instanceDetailsPage.getAccordionTitle(0) == "使用任务选择"
        instanceDetailsPage.getLabelName(0) == "信息"
        instanceDetailsPage.getLabelName(29) == "文字輸入1"
    }

    def "the execution report is viewable and correctly translated"(){
        when: "clicking the Execution button"
        instanceDetailsPage.clickReportExecutionButton()

        then: "the report details should be viewable and correctly translated"
        instanceDetailsPage.getTextLineName(0) == "实例数:"
        instanceDetailsPage.getTableTopPanelHeader(1) == "元素状态2"
        instanceDetailsPage.getTableHeaderText(0) == "元素ID"
    }
}