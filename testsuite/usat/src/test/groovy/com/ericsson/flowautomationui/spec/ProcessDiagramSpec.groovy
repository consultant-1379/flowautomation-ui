package com.ericsson.flowautomationui.spec

import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

@RunWith(ArquillianSputnik)
class ProcessDiagramSpec extends BaseSpecification {

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    def "test process diagram"() {
        setup: "flow automation is running"

        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()
        instancesPage.verifyTopSectionTitle(InstancesPage.TITLE)

        // Sunny day test
        instancesPage.clickMyInstances()
        instancesPage.instancesTableFragment.getTable()
        instancesPage.instancesTableFragment.selectRow("Fill data for 100 nodes")
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        sleep(5000)
        instanceDetailsPage.isTopsectionVisible()
        instanceDetailsPage.verifyTopSectionTitle(InstanceDetailsPage.TITLE)

        instanceDetailsPage.isTabSelected(2)
        instanceDetailsPage.selectedTabIsCorrect("Process Diagram")
        instanceDetailsPage.correctVisibleTabs("Process Diagram")
        
        // TODO - check Activity button selected by default
        instanceDetailsPage.clickProcessActivityButton()
        instanceDetailsPage.clickProcessDefinitionButton()

        // Test for errors getting data from server - individual diagrams                
        instancesPage.openFlowAutomationBreadCrumb()

        instancesPage.clickMyInstances()
        instancesPage.instancesTableFragment.getTable()

        instancesPage.instancesTableFragment.selectRow("Fill data for 100 nodes-1")
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        instanceDetailsPage.isTopsectionVisible()
        instanceDetailsPage.verifyTopSectionTitle(InstanceDetailsPage.TITLE)
        instanceDetailsPage.isTabSelected(2)
        instanceDetailsPage.selectedTabIsCorrect("Process Diagram")
        instanceDetailsPage.correctVisibleTabs("Process Diagram")

        // TODO - check Activity button selected by default
        instanceDetailsPage.clickProcessActivityButton()
        instanceDetailsPage.getProcessActivityDiagramInlineMessage() == "Unable to Retrieve Data"

        instanceDetailsPage.clickProcessDefinitionButton()
        instanceDetailsPage.getProcessDefinitionDiagramInlineMessage() == "Unable to Retrieve Data"
    }
}